<?php
/**
 * Vereinsprodukte — editable in WP (like Termine), member-only singles.
 */

defined( 'ABSPATH' ) || exit;

const ARRIVA_MERCH_POST_TYPE   = 'arriva_merch';
const ARRIVA_MERCH_PRICE_META  = 'arriva_merch_price';
const ARRIVA_MERCH_OPTIONS_META = 'arriva_merch_options';
const ARRIVA_MERCH_GROUP_META  = 'arriva_merch_group';

/**
 * Register CPT (call on init and plugin activation).
 */
function arriva_register_merch_content_type() {
	register_post_type(
		ARRIVA_MERCH_POST_TYPE,
		array(
			'labels'              => array(
				'name'               => __( 'Vereinsprodukte', 'arriva' ),
				'singular_name'      => __( 'Produkt', 'arriva' ),
				'add_new'            => __( 'Produkt hinzufügen', 'arriva' ),
				'add_new_item'       => __( 'Neues Produkt hinzufügen', 'arriva' ),
				'edit_item'          => __( 'Produkt bearbeiten', 'arriva' ),
				'new_item'           => __( 'Neues Produkt', 'arriva' ),
				'view_item'          => __( 'Produkt ansehen', 'arriva' ),
				'search_items'       => __( 'Produkte suchen', 'arriva' ),
				'not_found'          => __( 'Keine Produkte gefunden', 'arriva' ),
				'not_found_in_trash' => __( 'Keine Produkte im Papierkorb', 'arriva' ),
				'menu_name'          => __( 'Vereinsprodukte', 'arriva' ),
			),
			'public'              => true,
			'has_archive'         => false,
			'rewrite'             => array( 'slug' => 'merch-artikel' ),
			'show_in_rest'        => true,
			'rest_base'           => 'arriva-merch',
			'menu_icon'           => 'dashicons-tag',
			'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes' ),
			'capability_type'     => 'post',
			'exclude_from_search' => true,
		)
	);

	$meta_auth = static function () {
		return current_user_can( 'edit_posts' );
	};

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_PRICE_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => 'sanitize_text_field',
		)
	);

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_OPTIONS_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_GROUP_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'default'           => 'featured',
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => function ( $value ) {
				return in_array( $value, array( 'featured', 'catalog' ), true ) ? $value : 'featured';
			},
		)
	);
}

add_action( 'init', 'arriva_register_merch_content_type' );

/**
 * Featured products when Gruppe meta was never saved (e.g. REST import before auth_callback).
 *
 * @return string[]
 */
function arriva_merch_featured_slugs_fallback() {
	return array(
		'hybrid-jacke-navy',
		'hybrid-jacke-schwarz',
		'jogginghose-version-1',
		'jogginghose-version-2',
	);
}

/**
 * @param WP_Post $post Product.
 * @return string featured|catalog
 */
function arriva_merch_product_group( WP_Post $post ) {
	$stored = get_post_meta( $post->ID, ARRIVA_MERCH_GROUP_META, true );
	if ( is_string( $stored ) && in_array( $stored, array( 'featured', 'catalog' ), true ) ) {
		return $stored;
	}

	return in_array( $post->post_name, arriva_merch_featured_slugs_fallback(), true ) ? 'featured' : 'catalog';
}

/**
 * @param WP_Post[] $posts Products.
 * @return WP_Post[]
 */
function arriva_merch_sort_products( array $posts ) {
	$order = array_flip( arriva_merch_featured_slugs_fallback() );

	usort(
		$posts,
		static function ( WP_Post $a, WP_Post $b ) use ( $order ) {
			$oa = isset( $order[ $a->post_name ] ) ? (int) $order[ $a->post_name ] : 1000;
			$ob = isset( $order[ $b->post_name ] ) ? (int) $order[ $b->post_name ] : 1000;

			if ( $oa === $ob ) {
				return strcasecmp( $a->post_title, $b->post_title );
			}

			return $oa <=> $ob;
		}
	);

	return $posts;
}

/**
 * @param string $group featured|catalog|'' for all.
 * @return WP_Post[]
 */
function arriva_query_merch( $group = '' ) {
	$posts = get_posts(
		array(
			'post_type'      => ARRIVA_MERCH_POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => array( 'menu_order' => 'ASC', 'title' => 'ASC' ),
			'order'          => 'ASC',
		)
	);

	if ( ! $group ) {
		return arriva_merch_sort_products( $posts );
	}

	$filtered = array();
	foreach ( $posts as $post ) {
		if ( arriva_merch_product_group( $post ) === $group ) {
			$filtered[] = $post;
		}
	}

	return arriva_merch_sort_products( $filtered );
}

/**
 * @param WP_Post $post Product.
 * @return string[]
 */
function arriva_merch_option_lines( WP_Post $post ) {
	$raw = get_post_meta( $post->ID, ARRIVA_MERCH_OPTIONS_META, true );
	if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
		return array();
	}

	$lines = preg_split( '/\r\n|\r|\n/', $raw );

	return array_values(
		array_filter(
			array_map( 'trim', $lines ),
			static function ( $line ) {
				return '' !== $line;
			}
		)
	);
}

/**
 * Single product layout (meta + back link).
 *
 * @param string $content Post content.
 * @return string
 */
function arriva_merch_single_content( $content ) {
	if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin() ) {
		return $content;
	}

	if ( ! is_singular( ARRIVA_MERCH_POST_TYPE ) || ! in_the_loop() || ! is_main_query() ) {
		return $content;
	}

	static $done = false;
	if ( $done ) {
		return $content;
	}
	$done = true;

	$post  = get_post();
	$price = get_post_meta( $post->ID, ARRIVA_MERCH_PRICE_META, true );
	$price = $price ? $price : __( 'Preis auf Anfrage', 'arriva' );

	$options = arriva_merch_option_lines( $post );
	$group   = arriva_merch_product_group( $post );

	ob_start();
	echo '<article class="arriva-merch-single">';

	echo '<div class="arriva-merch-single__layout">';

	echo '<div class="arriva-merch-single__gallery">';
	if ( has_post_thumbnail( $post ) ) {
		echo '<figure class="arriva-merch-single__figure">';
		echo get_the_post_thumbnail( $post, 'large', array( 'class' => 'arriva-merch-single__image' ) );
		echo '</figure>';
	} else {
		echo '<div class="arriva-merch-single__figure arriva-merch-single__figure--empty" aria-hidden="true"></div>';
	}
	echo '</div>';

	echo '<aside class="arriva-merch-single__buy" aria-label="' . esc_attr__( 'Bestellinformationen', 'arriva' ) . '">';
	if ( 'featured' === $group ) {
		echo '<p class="arriva-merch-single__badge">' . esc_html__( 'Korrekturabzug', 'arriva' ) . '</p>';
	}
	echo '<p class="arriva-merch-single__price-row">';
	echo '<span class="arriva-merch-single__price-label">' . esc_html__( 'Preis', 'arriva' ) . '</span>';
	echo '<span class="arriva-merch-single__price">' . esc_html( $price ) . '</span>';
	echo '</p>';

	if ( $options ) {
		echo '<div class="arriva-merch-single__options">';
		echo '<h2 class="arriva-merch-single__options-title">' . esc_html__( 'Optionen', 'arriva' ) . '</h2>';
		echo '<ul class="arriva-merch-single__options-list">';
		foreach ( $options as $line ) {
			echo '<li>' . esc_html( $line ) . '</li>';
		}
		echo '</ul>';
		echo '</div>';
	}

	echo '<p class="arriva-merch-single__order-note">' . esc_html__( 'Kein Online-Warenkorb — Bestellung über den Vorstand.', 'arriva' ) . '</p>';
	echo '<a class="arriva-merch-single__order" href="' . esc_url( home_url( '/mitglieder/vorstand/' ) ) . '">' . esc_html__( 'Beim Vorstand bestellen', 'arriva' ) . '</a>';
	echo '</aside>';

	echo '</div>';

	if ( trim( $content ) ) {
		echo '<div class="arriva-merch-single__details">';
		echo '<h2 class="arriva-merch-single__details-title">' . esc_html__( 'Beschreibung', 'arriva' ) . '</h2>';
		echo '<div class="arriva-merch-single__body">';
		echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered content.
		echo '</div>';
		echo '</div>';
	}

	echo '<nav class="arriva-merch-single__actions" aria-label="' . esc_attr__( 'Navigation', 'arriva' ) . '">';
	echo '<a class="arriva-merch-single__back" href="' . esc_url( home_url( '/mitglieder/merch/' ) ) . '">' . esc_html__( '← Zurück zur Übersicht', 'arriva' ) . '</a>';
	echo '</nav>';

	echo '</article>';

	return ob_get_clean();
}
add_filter( 'the_content', 'arriva_merch_single_content', 9 );
