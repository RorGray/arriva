<?php
/**
 * Mitglieder-Übersicht: member-only news category, Rhine gauge and weather data.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Slug of the post category that is only visible to members.
 *
 * @return string
 */
function arriva_member_news_category_slug() {
	return (string) apply_filters( 'arriva_member_news_category_slug', 'mitglieder' );
}

/**
 * @return int Category term ID, 0 if the category does not exist.
 */
function arriva_member_news_category_id() {
	$term = get_term_by( 'slug', arriva_member_news_category_slug(), 'category' );
	return $term instanceof WP_Term ? (int) $term->term_id : 0;
}

/**
 * @param int|WP_Post|null $post Post.
 * @return bool
 */
function arriva_is_member_news_post( $post = null ) {
	$post   = get_post( $post );
	$cat_id = arriva_member_news_category_id();

	return $post instanceof WP_Post && 'post' === $post->post_type && $cat_id && has_term( $cat_id, 'category', $post );
}

/**
 * Guests: keep member news out of blog, archives, search and feeds.
 *
 * @param WP_Query $query Query.
 */
function arriva_hide_member_news_from_guests( $query ) {
	if ( is_admin() || is_user_logged_in() || ! $query->is_main_query() ) {
		return;
	}

	$cat_id = arriva_member_news_category_id();
	if ( ! $cat_id || $query->is_singular() || $query->is_category( $cat_id ) ) {
		return;
	}

	$excluded   = (array) $query->get( 'category__not_in' );
	$excluded[] = $cat_id;
	$query->set( 'category__not_in', array_unique( array_map( 'intval', $excluded ) ) );
}
add_action( 'pre_get_posts', 'arriva_hide_member_news_from_guests' );

/**
 * Guests: REST /wp/v2/posts without member news.
 *
 * @param array $args WP_Query args.
 * @return array
 */
function arriva_hide_member_news_from_rest( $args ) {
	$cat_id = arriva_member_news_category_id();
	if ( is_user_logged_in() || ! $cat_id ) {
		return $args;
	}

	$excluded                 = isset( $args['category__not_in'] ) ? (array) $args['category__not_in'] : array();
	$excluded[]               = $cat_id;
	$args['category__not_in'] = array_unique( array_map( 'intval', $excluded ) );

	return $args;
}
add_filter( 'rest_post_query', 'arriva_hide_member_news_from_rest' );

/**
 * Sitemaps never list member news.
 *
 * @param array  $args      WP_Query args.
 * @param string $post_type Post type.
 * @return array
 */
function arriva_hide_member_news_from_sitemap( $args, $post_type ) {
	$cat_id = arriva_member_news_category_id();
	if ( 'post' !== $post_type || ! $cat_id ) {
		return $args;
	}

	$excluded                 = isset( $args['category__not_in'] ) ? (array) $args['category__not_in'] : array();
	$excluded[]               = $cat_id;
	$args['category__not_in'] = array_unique( array_map( 'intval', $excluded ) );

	return $args;
}
add_filter( 'wp_sitemaps_posts_query_args', 'arriva_hide_member_news_from_sitemap', 10, 2 );

/**
 * @param array $args Taxonomy sitemap query args.
 * @return array
 */
function arriva_hide_member_news_category_from_sitemap( $args ) {
	$cat_id = arriva_member_news_category_id();
	if ( $cat_id ) {
		$args['exclude'] = array_merge( isset( $args['exclude'] ) ? (array) $args['exclude'] : array(), array( $cat_id ) );
	}
	return $args;
}
add_filter( 'wp_sitemaps_taxonomies_query_args', 'arriva_hide_member_news_category_from_sitemap' );

/**
 * "Neue Mitteilung schreiben" (post-new.php?arriva_news=1): preselect the member category.
 *
 * @param int     $post_id Post ID.
 * @param WP_Post $post    Post.
 */
function arriva_preselect_member_news_category( $post_id, $post ) {
	if ( ! is_admin() || 'auto-draft' !== $post->post_status || empty( $_GET['arriva_news'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- only presets a draft category.
		return;
	}

	$cat_id = arriva_member_news_category_id();
	if ( $cat_id ) {
		wp_set_post_categories( $post_id, array( $cat_id ) );
	}
}
add_action( 'save_post_post', 'arriva_preselect_member_news_category', 10, 2 );

/**
 * Latest member news posts.
 *
 * @param int $count Number of posts.
 * @return WP_Post[]
 */
function arriva_query_member_news( $count ) {
	$cat_id = arriva_member_news_category_id();
	if ( ! $cat_id ) {
		return array();
	}

	return get_posts(
		array(
			'post_type'      => 'post',
			'post_status'    => 'publish',
			'cat'            => $cat_id,
			'posts_per_page' => max( 1, (int) $count ),
		)
	);
}

/**
 * GET JSON with a transient cache. Failures are cached briefly so a dead API doesn't slow every page.
 *
 * @param string $url URL.
 * @param int    $ttl Cache lifetime in seconds.
 * @return array|null Decoded JSON.
 */
function arriva_remote_json( $url, $ttl ) {
	$key    = 'arriva_remote_' . md5( $url );
	$cached = get_transient( $key );
	if ( false !== $cached ) {
		return is_array( $cached ) ? $cached : null;
	}

	$response = wp_remote_get(
		$url,
		array(
			'timeout' => 4,
			'headers' => array( 'Accept' => 'application/json' ),
		)
	);

	$data = null;
	if ( ! is_wp_error( $response ) && 200 === (int) wp_remote_retrieve_response_code( $response ) ) {
		$decoded = json_decode( wp_remote_retrieve_body( $response ), true );
		$data    = is_array( $decoded ) ? $decoded : null;
	}

	set_transient( $key, null === $data ? 'error' : $data, null === $data ? 5 * MINUTE_IN_SECONDS : $ttl );

	return $data;
}

/**
 * Current water level from PEGELONLINE (WSV).
 *
 * @param string $station Station short name or UUID, e.g. SPEYER.
 * @return array{value:float,time:int,trend:int,state:string,water:string,station:string}|null
 */
function arriva_rhine_level( $station ) {
	$station = trim( (string) $station );
	if ( '' === $station ) {
		return null;
	}

	$base = 'https://www.pegelonline.wsv.de/webservices/rest-api/v2/stations/' . rawurlencode( $station );
	$info = arriva_remote_json( $base . '.json?includeTimeseries=true&includeCurrentMeasurement=true', 15 * MINUTE_IN_SECONDS );
	if ( ! $info || empty( $info['timeseries'] ) ) {
		return null;
	}

	$current = null;
	foreach ( $info['timeseries'] as $series ) {
		if ( isset( $series['shortname'] ) && 'W' === $series['shortname'] && isset( $series['currentMeasurement']['value'] ) ) {
			$current = $series['currentMeasurement'];
			break;
		}
	}
	if ( ! $current ) {
		return null;
	}

	$trend   = 0;
	$history = arriva_remote_json( $base . '/W/measurements.json?start=PT3H', 15 * MINUTE_IN_SECONDS );
	if ( is_array( $history ) && count( $history ) > 1 && isset( $history[0]['value'] ) ) {
		$diff = (float) $current['value'] - (float) $history[0]['value'];
		// Gauge readings jitter by a centimetre or two.
		if ( $diff >= 3 ) {
			$trend = 1;
		} elseif ( $diff <= -3 ) {
			$trend = -1;
		}
	}

	return array(
		'value'   => (float) $current['value'],
		'time'    => (int) strtotime( (string) $current['timestamp'] ),
		'trend'   => $trend,
		'state'   => isset( $current['stateMnwMhw'] ) ? (string) $current['stateMnwMhw'] : 'unknown',
		'water'   => isset( $info['water']['longname'] ) ? (string) $info['water']['longname'] : '',
		'station' => isset( $info['longname'] ) ? (string) $info['longname'] : $station,
	);
}

/**
 * Forecast from Open-Meteo.
 *
 * @param float $lat  Latitude.
 * @param float $lon  Longitude.
 * @param int   $days Number of days incl. today.
 * @return array{current:array,days:array}|null
 */
function arriva_weather_forecast( $lat, $lon, $days ) {
	$url = add_query_arg(
		array(
			'latitude'      => round( (float) $lat, 4 ),
			'longitude'     => round( (float) $lon, 4 ),
			'current'       => 'temperature_2m,weather_code,wind_speed_10m',
			'daily'         => 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max',
			'timezone'      => 'Europe/Berlin',
			'forecast_days' => min( 7, max( 1, (int) $days ) ),
		),
		'https://api.open-meteo.com/v1/forecast'
	);

	$data = arriva_remote_json( $url, HOUR_IN_SECONDS );
	if ( ! $data || empty( $data['daily']['time'] ) ) {
		return null;
	}

	$out = array(
		'current' => isset( $data['current'] ) ? $data['current'] : array(),
		'days'    => array(),
	);

	foreach ( $data['daily']['time'] as $i => $date ) {
		$out['days'][] = array(
			'date' => (string) $date,
			'code' => (int) $data['daily']['weather_code'][ $i ],
			'max'  => (float) $data['daily']['temperature_2m_max'][ $i ],
			'min'  => (float) $data['daily']['temperature_2m_min'][ $i ],
			'rain' => (int) $data['daily']['precipitation_probability_max'][ $i ],
			'wind' => (float) $data['daily']['wind_speed_10m_max'][ $i ],
		);
	}

	return $out;
}

/**
 * WMO weather code → symbol + German description.
 *
 * @param int $code WMO code.
 * @return array{icon:string,label:string}
 */
function arriva_weather_code_info( $code ) {
	$map = array(
		0  => array( '☀️', 'Sonnig' ),
		1  => array( '🌤️', 'Überwiegend sonnig' ),
		2  => array( '⛅', 'Teils bewölkt' ),
		3  => array( '☁️', 'Bewölkt' ),
		45 => array( '🌫️', 'Nebel' ),
		48 => array( '🌫️', 'Reifnebel' ),
		51 => array( '🌦️', 'Leichter Niesel' ),
		53 => array( '🌦️', 'Niesel' ),
		55 => array( '🌧️', 'Starker Niesel' ),
		56 => array( '🌧️', 'Gefrierender Niesel' ),
		57 => array( '🌧️', 'Gefrierender Niesel' ),
		61 => array( '🌦️', 'Leichter Regen' ),
		63 => array( '🌧️', 'Regen' ),
		65 => array( '🌧️', 'Starker Regen' ),
		66 => array( '🌧️', 'Gefrierender Regen' ),
		67 => array( '🌧️', 'Gefrierender Regen' ),
		71 => array( '🌨️', 'Leichter Schnee' ),
		73 => array( '🌨️', 'Schnee' ),
		75 => array( '❄️', 'Starker Schnee' ),
		77 => array( '🌨️', 'Schneegriesel' ),
		80 => array( '🌦️', 'Regenschauer' ),
		81 => array( '🌧️', 'Regenschauer' ),
		82 => array( '⛈️', 'Heftige Schauer' ),
		85 => array( '🌨️', 'Schneeschauer' ),
		86 => array( '🌨️', 'Schneeschauer' ),
		95 => array( '⛈️', 'Gewitter' ),
		96 => array( '⛈️', 'Gewitter mit Hagel' ),
		99 => array( '⛈️', 'Gewitter mit Hagel' ),
	);

	$entry = isset( $map[ $code ] ) ? $map[ $code ] : array( '🌡️', '' );

	return array(
		'icon'  => $entry[0],
		'label' => $entry[1],
	);
}

/**
 * Replace %s / %1$s style placeholders without breaking on stray percent signs.
 *
 * @param string $template Template from a block attribute.
 * @param array  $values   Values for %1$s, %2$s, … (plain %s = first).
 * @return string
 */
function arriva_fill_template( $template, array $values ) {
	$replace = array( '%s' => isset( $values[0] ) ? $values[0] : '' );
	foreach ( array_values( $values ) as $i => $value ) {
		$replace[ '%' . ( $i + 1 ) . '$s' ] = $value;
		$replace[ '%' . ( $i + 1 ) . '$d' ] = $value;
	}
	$replace['%d'] = isset( $values[0] ) ? $values[0] : '';

	return strtr( (string) $template, $replace );
}
