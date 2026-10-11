<?php
/**
 * Termine — post-like entries (not pages). Date meta + Termin-Typ taxonomy (editable in WP admin).
 */

defined( 'ABSPATH' ) || exit;

const ARRIVA_EVENT_DATE_META = 'arriva_event_date';
const ARRIVA_EVENT_TYPE_TAX  = 'arriva_event_type';
const ARRIVA_EVENT_POST_TYPE = 'arriva_event';

/**
 * Register CPT + taxonomy (also called on plugin activation before flush_rewrite_rules).
 */
function arriva_register_events_content_types() {
	register_post_type(
		ARRIVA_EVENT_POST_TYPE,
		array(
			'labels'              => array(
				'name'               => __( 'Termine', 'arriva' ),
				'singular_name'      => __( 'Termin', 'arriva' ),
				'add_new'            => __( 'Termin hinzufügen', 'arriva' ),
				'add_new_item'       => __( 'Neuen Termin hinzufügen', 'arriva' ),
				'edit_item'          => __( 'Termin bearbeiten', 'arriva' ),
				'new_item'           => __( 'Neuer Termin', 'arriva' ),
				'view_item'          => __( 'Termin ansehen', 'arriva' ),
				'search_items'       => __( 'Termine suchen', 'arriva' ),
				'not_found'          => __( 'Keine Termine gefunden', 'arriva' ),
				'not_found_in_trash' => __( 'Keine Termine im Papierkorb', 'arriva' ),
				'menu_name'          => __( 'Termine', 'arriva' ),
			),
			'public'              => true,
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'termine' ),
			'show_in_rest'        => true,
			'rest_base'           => 'arriva-events',
			'menu_icon'           => 'dashicons-calendar-alt',
			'supports'            => array( 'title', 'editor', 'excerpt', 'custom-fields' ),
			'capability_type'     => 'post',
			'exclude_from_search' => true,
			'taxonomies'          => array( ARRIVA_EVENT_TYPE_TAX ),
		)
	);

	register_taxonomy(
		ARRIVA_EVENT_TYPE_TAX,
		array( 'arriva_event' ),
		array(
			'labels'            => array(
				'name'          => __( 'Termin-Typen', 'arriva' ),
				'singular_name' => __( 'Termin-Typ', 'arriva' ),
				'search_items'  => __( 'Termin-Typen suchen', 'arriva' ),
				'all_items'     => __( 'Alle Termin-Typen', 'arriva' ),
				'edit_item'     => __( 'Termin-Typ bearbeiten', 'arriva' ),
				'update_item'   => __( 'Termin-Typ aktualisieren', 'arriva' ),
				'add_new_item'  => __( 'Neuen Termin-Typ hinzufügen', 'arriva' ),
				'new_item_name' => __( 'Neuer Termin-Typ', 'arriva' ),
				'menu_name'     => __( 'Termin-Typen', 'arriva' ),
			),
			'public'            => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'hierarchical'      => true,
			'rewrite'           => array( 'slug' => 'termin-typ' ),
		)
	);

	register_post_meta(
		'arriva_event',
		ARRIVA_EVENT_DATE_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'arriva_sanitize_event_date',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}

add_action( 'init', 'arriva_register_events_content_types' );

/**
 * @param mixed $value Meta value.
 * @return string
 */
function arriva_sanitize_event_date( $value ) {
	$value = is_string( $value ) ? trim( $value ) : '';
	if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
		return $value;
	}
	return '';
}

/**
 * Query events by date meta.
 *
 * @param array<string, mixed> $args count, year, from_date, to_date, type (term slug), order.
 * @return WP_Post[]
 */
function arriva_query_events( array $args = array() ) {
	$defaults = array(
		'count'     => 10,
		'year'      => 0,
		'from_date' => '',
		'to_date'   => '',
		'type'      => '',
		'order'     => 'ASC',
	);
	$args     = wp_parse_args( $args, $defaults );

	$meta_query = array(
		'relation'    => 'AND',
		'date_clause' => array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'compare' => 'EXISTS',
			'type'    => 'DATE',
		),
	);

	if ( $args['year'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => array( $args['year'] . '-01-01', $args['year'] . '-12-31' ),
			'compare' => 'BETWEEN',
			'type'    => 'DATE',
		);
	}

	if ( $args['from_date'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => $args['from_date'],
			'compare' => '>=',
			'type'    => 'DATE',
		);
	}

	if ( $args['to_date'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => $args['to_date'],
			'compare' => '<=',
			'type'    => 'DATE',
		);
	}

	$tax_query = array();
	if ( $args['type'] ) {
		$tax_query[] = array(
			'taxonomy' => ARRIVA_EVENT_TYPE_TAX,
			'field'    => 'slug',
			'terms'    => array_map( 'sanitize_key', (array) $args['type'] ),
		);
	}

	$query_args = array(
		'post_type'      => 'arriva_event',
		'post_status'    => 'publish',
		'posts_per_page' => (int) $args['count'] > 0 ? (int) $args['count'] : -1,
		'meta_query'     => $meta_query,
		'orderby'        => 'date_clause',
		'order'          => 'ASC' === strtoupper( (string) $args['order'] ) ? 'ASC' : 'DESC',
	);

	if ( $tax_query ) {
		$query_args['tax_query'] = $tax_query;
	}

	$query = new WP_Query( $query_args );

	return $query->posts;
}

/**
 * Termin-Typ slugs whose events may be listed to visitors who are not logged in.
 *
 * @return string[]
 */
function arriva_public_event_type_slugs() {
	return (array) apply_filters( 'arriva_public_event_type_slugs', array( 'oeffentlich', 'offentlich', 'public' ) );
}

/**
 * Primary Termin-Typ term for an event (first assigned term).
 *
 * @param WP_Post $post Event post.
 * @return WP_Term|null
 */
function arriva_get_event_type_term( WP_Post $post ) {
	$terms = get_the_terms( $post->ID, ARRIVA_EVENT_TYPE_TAX );
	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return null;
	}
	return $terms[0];
}

/**
 * @param WP_Post $post Event post.
 * @return string
 */
function arriva_format_event_date( WP_Post $post ) {
	$iso = get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
	if ( ! $iso ) {
		return '';
	}
	$ts = strtotime( $iso . ' 12:00:00' );
	if ( ! $ts ) {
		return esc_html( $iso );
	}
	return wp_date( 'j. F Y', $ts );
}

/**
 * Day, short month and short weekday for the event date tile.
 *
 * @param WP_Post $post Event post.
 * @return array{iso: string, day: string, month: string, weekday: string}|null
 */
function arriva_event_date_badge( WP_Post $post ) {
	$iso = get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
	if ( ! is_string( $iso ) || '' === $iso ) {
		return null;
	}
	$ts = strtotime( $iso . ' 12:00:00' );
	if ( ! $ts ) {
		return null;
	}
	return array(
		'iso'     => $iso,
		'day'     => wp_date( 'd', $ts ),
		'month'   => wp_date( 'M', $ts ),
		'weekday' => wp_date( 'D', $ts ),
	);
}

/**
 * Echo one event card (<li>) for the shared events list styles.
 *
 * @param WP_Post $post  Event post.
 * @param array   $args  tile: 'month'|'weekday', today: Y-m-d, is_next: bool, link: bool.
 */
function arriva_render_event_card( WP_Post $post, array $args = array() ) {
	$args = wp_parse_args(
		$args,
		array(
			'tile'    => 'month',
			'today'   => wp_date( 'Y-m-d' ),
			'is_next' => false,
			'link'    => true,
		)
	);

	$badge   = arriva_event_date_badge( $post );
	$type    = arriva_event_type_label( $post );
	$variant = arriva_event_type_variant( $post );
	$detail  = trim( wp_strip_all_tags( (string) get_post_field( 'post_excerpt', $post ) ) );

	$classes = array( 'arriva-events__card' );
	if ( $badge && $badge['iso'] < $args['today'] ) {
		$classes[] = 'is-past';
	}
	if ( $args['is_next'] ) {
		$classes[] = 'is-next';
	}

	$tag = $args['link'] ? 'a' : 'div';

	echo '<li class="arriva-events__item">';
	if ( $args['link'] ) {
		echo '<a class="' . esc_attr( implode( ' ', $classes ) ) . '" href="' . esc_url( get_permalink( $post ) ) . '">';
	} else {
		echo '<div class="' . esc_attr( implode( ' ', $classes ) ) . '">';
	}

	if ( $badge ) {
		$sub = 'weekday' === $args['tile'] ? $badge['weekday'] : $badge['month'];
		echo '<time class="arriva-events__date" datetime="' . esc_attr( $badge['iso'] ) . '">';
		echo '<span class="arriva-events__day">' . esc_html( $badge['day'] ) . '</span>';
		echo '<span class="arriva-events__sub">' . esc_html( $sub ) . '</span>';
		echo '</time>';
	}

	echo '<span class="arriva-events__body">';
	echo '<span class="arriva-events__title">' . esc_html( get_the_title( $post ) ) . '</span>';
	if ( $detail ) {
		echo '<span class="arriva-events__detail">' . esc_html( $detail ) . '</span>';
	}
	echo '</span>';

	if ( $type ) {
		$variant_class = $variant ? ' arriva-events__type--' . $variant : '';
		echo '<span class="arriva-events__type' . esc_attr( $variant_class ) . '">' . esc_html( $type ) . '</span>';
	}

	echo '</' . $tag . '>';
	echo '</li>';
}

/**
 * Whether a RichText attribute has visible text.
 *
 * @param string $value Attribute HTML.
 * @return bool
 */
function arriva_has_rich_text( $value ) {
	return '' !== trim( wp_strip_all_tags( (string) $value ) );
}

/**
 * @param WP_Post $post Event post.
 * @return string
 */
function arriva_event_type_label( WP_Post $post ) {
	$term = arriva_get_event_type_term( $post );
	return $term ? $term->name : '';
}

/**
 * Colour variant for a Termin-Typ pill. Unknown types use the accent outline.
 *
 * @param WP_Post $post Event post.
 * @return string public|sport|internal|youth|default|empty
 */
function arriva_event_type_variant( WP_Post $post ) {
	$term = arriva_get_event_type_term( $post );
	if ( ! $term ) {
		return '';
	}

	$known = array(
		'oeffentlich' => 'public',
		'offentlich'  => 'public',
		'public'      => 'public',
		'sport'       => 'sport',
		'intern'      => 'internal',
		'interne'     => 'internal',
		'jugend'      => 'youth',
	);

	$slug = sanitize_title( $term->slug );
	if ( isset( $known[ $slug ] ) ) {
		return $known[ $slug ];
	}

	$name = sanitize_title( $term->name );
	return isset( $known[ $name ] ) ? $known[ $name ] : 'default';
}

/**
 * Echo a month-grid calendar (all 12 months of $year; view.js shows one at a time).
 *
 * @param int       $year  Year.
 * @param WP_Post[] $posts Event posts in that year.
 * @param string    $today Y-m-d.
 */
function arriva_render_events_calendar( $year, array $posts, $today ) {
	$by_day = array();
	foreach ( $posts as $post ) {
		$iso = (string) get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
		if ( $iso ) {
			$by_day[ $iso ][] = $post;
		}
	}

	$start_of_week = (int) get_option( 'start_of_week', 1 );

	$weekdays = array();
	for ( $i = 0; $i < 7; $i++ ) {
		// 2023-01-01 was a Sunday, so day N of January 2023 has weekday index N-1.
		$weekdays[] = wp_date( 'D', gmmktime( 12, 0, 0, 1, 1 + ( ( $start_of_week + $i ) % 7 ), 2023 ) );
	}

	echo '<div class="arriva-cal">';

	for ( $month = 1; $month <= 12; $month++ ) {
		$first   = gmmktime( 12, 0, 0, $month, 1, $year );
		$label   = wp_date( 'F', $first );
		$days    = (int) gmdate( 't', $first );
		$leading = ( (int) gmdate( 'w', $first ) - $start_of_week + 7 ) % 7;

		echo '<div class="arriva-cal__month" data-month="' . esc_attr( (string) $month ) . '" data-label="' . esc_attr( $label ) . '">';
		echo '<h3 class="screen-reader-text">' . esc_html( $label . ' ' . $year ) . '</h3>';

		echo '<div class="arriva-cal__weekdays" aria-hidden="true">';
		foreach ( $weekdays as $weekday ) {
			echo '<span>' . esc_html( $weekday ) . '</span>';
		}
		echo '</div>';

		echo '<div class="arriva-cal__grid">';

		for ( $i = 0; $i < $leading; $i++ ) {
			echo '<div class="arriva-cal__day is-outside" aria-hidden="true"></div>';
		}

		for ( $day = 1; $day <= $days; $day++ ) {
			$iso     = sprintf( '%04d-%02d-%02d', $year, $month, $day );
			$classes = array( 'arriva-cal__day' );
			if ( $iso === $today ) {
				$classes[] = 'is-today';
			} elseif ( $iso < $today ) {
				$classes[] = 'is-past';
			}
			if ( ! empty( $by_day[ $iso ] ) ) {
				$classes[] = 'has-events';
			}

			echo '<div class="' . esc_attr( implode( ' ', $classes ) ) . '">';
			echo '<span class="arriva-cal__num">' . esc_html( (string) $day ) . '</span>';

			if ( ! empty( $by_day[ $iso ] ) ) {
				foreach ( $by_day[ $iso ] as $post ) {
					$detail = trim( wp_strip_all_tags( (string) get_post_field( 'post_excerpt', $post ) ) );
					echo '<a class="arriva-cal__event" href="' . esc_url( get_permalink( $post ) ) . '">';
					echo '<span class="arriva-cal__event-title">' . esc_html( get_the_title( $post ) ) . '</span>';
					if ( $detail ) {
						echo '<span class="arriva-cal__event-detail">' . esc_html( $detail ) . '</span>';
					}
					echo '</a>';
				}
			}

			echo '</div>';
		}

		$trailing = ( 7 - ( ( $leading + $days ) % 7 ) ) % 7;
		for ( $i = 0; $i < $trailing; $i++ ) {
			echo '<div class="arriva-cal__day is-outside" aria-hidden="true"></div>';
		}

		echo '</div>';
		echo '</div>';
	}

	echo '</div>';
}

/**
 * Group date-sorted event posts by month (keeps input order).
 *
 * @param WP_Post[] $posts Event posts, sorted by date.
 * @return array<string, array{label: string, posts: WP_Post[]}> Keyed by Y-m.
 */
function arriva_group_events_by_month( array $posts ) {
	$groups = array();

	foreach ( $posts as $post ) {
		$iso = (string) get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
		$ts  = $iso ? strtotime( $iso . ' 12:00:00' ) : false;
		if ( ! $ts ) {
			continue;
		}

		$key = wp_date( 'Y-m', $ts );
		if ( ! isset( $groups[ $key ] ) ) {
			$groups[ $key ] = array(
				'label' => wp_date( 'F', $ts ),
				'posts' => array(),
			);
		}
		$groups[ $key ]['posts'][] = $post;
	}

	return $groups;
}
