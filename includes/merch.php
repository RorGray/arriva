<?php
/**
 * Vereinsprodukte — editable in WP (like Termine), member-only singles.
 */

defined( 'ABSPATH' ) || exit;

const ARRIVA_MERCH_POST_TYPE    = 'arriva_merch';
const ARRIVA_MERCH_PRICE_META   = 'arriva_merch_price';
const ARRIVA_MERCH_OPTIONS_META = 'arriva_merch_options';
const ARRIVA_MERCH_GROUP_META   = 'arriva_merch_group';
const ARRIVA_MERCH_BADGE_META   = 'arriva_merch_badge';
const ARRIVA_MERCH_GALLERY_META = 'arriva_merch_gallery';
const ARRIVA_MERCH_COLORS_META  = 'arriva_merch_colors';
const ARRIVA_MERCH_DETAILS_META = 'arriva_merch_details';

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
			'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes', 'custom-fields' ),
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
			'label'             => __( 'Preis', 'arriva' ),
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

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_BADGE_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => 'sanitize_text_field',
			'label'             => __( 'Badge (Shop-Karte)', 'arriva' ),
		)
	);

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_GALLERY_META,
		array(
			'type'              => 'array',
			'single'            => true,
			'show_in_rest'      => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array(
						'type' => 'integer',
					),
				),
			),
			'default'           => array(),
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => static function ( $value ) {
				if ( ! is_array( $value ) ) {
					return array();
				}

				return array_values(
					array_unique(
						array_filter(
							array_map( 'absint', $value )
						)
					)
				);
			},
		)
	);

	register_post_meta(
		ARRIVA_MERCH_POST_TYPE,
		ARRIVA_MERCH_COLORS_META,
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
		ARRIVA_MERCH_DETAILS_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'auth_callback'     => $meta_auth,
			'sanitize_callback' => 'sanitize_textarea_field',
		)
	);
}

add_action(
	'wp_enqueue_scripts',
	static function () {
		if ( ! is_singular( ARRIVA_MERCH_POST_TYPE ) ) {
			return;
		}

		$asset = require __DIR__ . '/../shared/merch-single.asset.php';

		wp_enqueue_style(
			'arriva-merch-single',
			plugins_url( 'shared/merch-single.css', __DIR__ . '/../arriva.php' ),
			array( 'arriva-merch-catalog' ),
			ARRIVA_VERSION
		);

		wp_enqueue_script(
			'arriva-merch-single',
			plugins_url( 'shared/merch-single.js', __DIR__ . '/../arriva.php' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
);

add_action(
	'enqueue_block_editor_assets',
	static function () {
		$asset = require __DIR__ . '/../merch-editor/index.asset.php';

		wp_enqueue_style(
			'arriva-merch-editor',
			plugins_url( 'merch-editor/style.css', __DIR__ . '/../arriva.php' ),
			array(),
			ARRIVA_VERSION
		);

		wp_enqueue_script(
			'arriva-merch-editor',
			plugins_url( 'merch-editor/index.js', __DIR__ . '/../arriva.php' ),
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}
);

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
 * Optional overlay label on shop cards / product page (e.g. „NEU“). Empty = hidden.
 *
 * @param WP_Post $post Product.
 * @return string
 */
function arriva_merch_badge_label( WP_Post $post ) {
	$label = get_post_meta( $post->ID, ARRIVA_MERCH_BADGE_META, true );
	if ( ! is_string( $label ) ) {
		return '';
	}

	return trim( $label );
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
 * @param string $name Color label.
 * @return string Hex or empty.
 */
function arriva_merch_color_name_to_hex( $name ) {
	$key = strtolower( trim( $name ) );
	$map = array(
		'navy'            => '#1e2a4a',
		'schwarz'         => '#1a1a1a',
		'weiß'            => '#f5f5f2',
		'weiss'           => '#f5f5f2',
		'royalblau'       => '#1e4d8c',
		'royal'           => '#1e4d8c',
		'bright royal'    => '#2563eb',
		'convoy grey'     => '#6b7280',
		'carolina blue'   => '#6cb4d8',
		'forest green'    => '#2d5a3d',
		'military green'  => '#4a5d3f',
		'heather saphir'  => '#3d5a80',
		'orange'          => '#e87722',
		'charcoal'        => '#36454f',
		'pink'            => '#e8a0bf',
		'mint'            => '#98d4bb',
	);

	return isset( $map[ $key ] ) ? $map[ $key ] : '';
}

/**
 * @param string $line One color entry ("Navy", "Navy #1e2a4a", "#1e2a4a").
 * @return array{label:string,hex:string}|null
 */
function arriva_merch_parse_color_line( $line ) {
	$line = trim( $line );
	if ( '' === $line ) {
		return null;
	}

	if ( preg_match( '/^(?<label>[^#]+?)\s+(?<hex>#[0-9a-fA-F]{3,8})$/u', $line, $m ) ) {
		return array(
			'label' => trim( $m['label'] ),
			'hex'   => $m['hex'],
		);
	}

	if ( preg_match( '/^#[0-9a-fA-F]{3,8}$/', $line ) ) {
		return array(
			'label' => $line,
			'hex'   => $line,
		);
	}

	return array(
		'label' => $line,
		'hex'   => arriva_merch_color_name_to_hex( $line ),
	);
}

/**
 * @param WP_Post $post Product.
 * @return array<int, array{label:string,hex:string}>
 */
function arriva_merch_color_swatches( WP_Post $post ) {
	$swatches = array();
	$raw      = get_post_meta( $post->ID, ARRIVA_MERCH_COLORS_META, true );

	if ( is_string( $raw ) && '' !== trim( $raw ) ) {
		$lines = preg_split( '/\r\n|\r|\n/', $raw );
		foreach ( $lines as $line ) {
			$parsed = arriva_merch_parse_color_line( $line );
			if ( $parsed ) {
				$swatches[] = $parsed;
			}
		}
	}

	if ( empty( $swatches ) ) {
		foreach ( arriva_merch_option_lines( $post ) as $line ) {
			if ( preg_match( '/^Farben?:\s*(.+)$/iu', $line, $m ) ) {
				$parts = preg_split( '/\s*[·,—–-]\s*|\s*,\s*/u', $m[1] );
				foreach ( $parts as $part ) {
					$part = preg_replace( '/\s*(Druck|druck).*$/u', '', trim( $part ) );
					$parsed = arriva_merch_parse_color_line( $part );
					if ( $parsed && '' !== $parsed['label'] ) {
						$swatches[] = $parsed;
					}
				}
				break;
			}
		}
	}

	return $swatches;
}

/**
 * @param WP_Post $post Product.
 * @return string[]
 */
function arriva_merch_spec_lines( WP_Post $post ) {
	$lines = arriva_merch_option_lines( $post );
	$specs = array();

	foreach ( $lines as $line ) {
		if ( preg_match( '/^Farben?:\s*/iu', $line ) ) {
			continue;
		}
		$specs[] = $line;
	}

	$details = get_post_meta( $post->ID, ARRIVA_MERCH_DETAILS_META, true );
	if ( is_string( $details ) && '' !== trim( $details ) ) {
		foreach ( preg_split( '/\r\n|\r|\n/', $details ) as $line ) {
			$line = trim( $line );
			if ( '' !== $line ) {
				$specs[] = $line;
			}
		}
	}

	return $specs;
}

/**
 * @param WP_Post $post Product.
 * @return int[] Attachment IDs (featured image + gallery meta).
 */
function arriva_merch_gallery_ids( WP_Post $post ) {
	$stored = get_post_meta( $post->ID, ARRIVA_MERCH_GALLERY_META, true );
	$ids    = is_array( $stored ) ? array_map( 'absint', $stored ) : array();

	if ( has_post_thumbnail( $post ) ) {
		$thumb = (int) get_post_thumbnail_id( $post );
		if ( $thumb && ! in_array( $thumb, $ids, true ) ) {
			array_unshift( $ids, $thumb );
		} elseif ( empty( $ids ) ) {
			$ids[] = $thumb;
		}
	}

	return array_values(
		array_filter(
			array_unique( $ids ),
			static function ( $id ) {
				return $id > 0 && wp_attachment_is_image( $id );
			}
		)
	);
}

/**
 * @param WP_Post $post Product.
 */
function arriva_merch_render_gallery( WP_Post $post ) {
	$ids = arriva_merch_gallery_ids( $post );

	echo '<div class="arriva-merch-single__gallery" data-arriva-merch-gallery>';

	if ( empty( $ids ) ) {
		echo '<div class="arriva-merch-single__stage arriva-merch-single__stage--empty" aria-hidden="true"></div>';
		echo '</div>';
		return;
	}

	$first = (int) $ids[0];
	$full  = wp_get_attachment_image_url( $first, 'full' );
	$large = wp_get_attachment_image_url( $first, 'large' );
	$alt   = get_post_meta( $first, '_wp_attachment_image_alt', true );

	echo '<div class="arriva-merch-single__stage">';
	echo '<button type="button" class="arriva-merch-single__zoom" data-full="' . esc_url( $full ? $full : $large ) . '" aria-label="' . esc_attr__( 'Bild vergrößern', 'arriva' ) . '">';
	echo wp_get_attachment_image( $first, 'large', false, array( 'class' => 'arriva-merch-single__image' ) );
	echo '<span class="arriva-merch-single__zoom-hint">' . esc_html__( 'Vergrößern', 'arriva' ) . '</span>';
	echo '</button>';
	echo '</div>';

	if ( count( $ids ) > 1 ) {
		echo '<ul class="arriva-merch-single__thumbs" role="list">';
		foreach ( $ids as $index => $id ) {
			$id     = (int) $id;
			$large  = wp_get_attachment_image_url( $id, 'large' );
			$full   = wp_get_attachment_image_url( $id, 'full' );
			$alt    = get_post_meta( $id, '_wp_attachment_image_alt', true );
			$active = 0 === $index ? ' is-active' : '';
			echo '<li><button type="button" class="arriva-merch-single__thumb' . esc_attr( $active ) . '" data-src="' . esc_url( $large ? $large : $full ) . '" data-full="' . esc_url( $full ) . '" data-alt="' . esc_attr( $alt ) . '" aria-current="' . ( 0 === $index ? 'true' : 'false' ) . '">';
			echo wp_get_attachment_image( $id, 'thumbnail', false, array( 'class' => 'arriva-merch-single__thumb-img' ) );
			echo '</button></li>';
		}
		echo '</ul>';
	}

	echo '</div>';
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

	$colors   = arriva_merch_color_swatches( $post );
	$specs    = arriva_merch_spec_lines( $post );
	$excerpt  = has_excerpt( $post ) ? get_the_excerpt( $post ) : '';

	ob_start();
	echo '<article class="arriva-merch-single">';

	echo '<div class="arriva-merch-single__layout">';

	arriva_merch_render_gallery( $post );

	echo '<aside class="arriva-merch-single__buy" aria-label="' . esc_attr__( 'Produktdetails', 'arriva' ) . '">';
	echo '<h1 class="arriva-merch-single__title">' . esc_html( get_the_title( $post ) ) . '</h1>';

	$badge = arriva_merch_badge_label( $post );
	if ( $badge ) {
		echo '<p class="arriva-merch-single__badge">' . esc_html( $badge ) . '</p>';
	}

	if ( $excerpt ) {
		echo '<p class="arriva-merch-single__lead">' . esc_html( wp_strip_all_tags( $excerpt ) ) . '</p>';
	}

	echo '<p class="arriva-merch-single__price-row">';
	echo '<span class="arriva-merch-single__price-label">' . esc_html__( 'Preis', 'arriva' ) . '</span>';
	echo '<span class="arriva-merch-single__price">' . esc_html( $price ) . '</span>';
	echo '</p>';

	if ( $colors ) {
		echo '<div class="arriva-merch-single__colors">';
		echo '<h2 class="arriva-merch-single__colors-title">' . esc_html__( 'Farben', 'arriva' ) . '</h2>';
		echo '<ul class="arriva-merch-single__swatches" role="list">';
		foreach ( $colors as $swatch ) {
			$style = $swatch['hex'] ? '--arriva-swatch: ' . $swatch['hex'] : '';
			echo '<li class="arriva-merch-single__swatch" style="' . esc_attr( $style ) . '" title="' . esc_attr( $swatch['label'] ) . '">';
			echo '<span class="arriva-merch-single__swatch-dot" aria-hidden="true"></span>';
			echo '<span class="arriva-merch-single__swatch-label">' . esc_html( $swatch['label'] ) . '</span>';
			echo '</li>';
		}
		echo '</ul>';
		echo '<p class="arriva-merch-single__colors-note">' . esc_html__( 'Farbauswahl bei Bestellung — keine Live-Vorschau.', 'arriva' ) . '</p>';
		echo '</div>';
	}

	if ( $specs ) {
		echo '<div class="arriva-merch-single__specs">';
		echo '<h2 class="arriva-merch-single__specs-title">' . esc_html__( 'Details & Optionen', 'arriva' ) . '</h2>';
		echo '<dl class="arriva-merch-single__spec-list">';
		foreach ( $specs as $line ) {
			if ( preg_match( '/^([^:]+):\s*(.+)$/', $line, $m ) ) {
				echo '<dt>' . esc_html( trim( $m[1] ) ) . '</dt>';
				echo '<dd>' . esc_html( trim( $m[2] ) ) . '</dd>';
			} else {
				echo '<dt class="arriva-merch-single__spec-solo">' . esc_html( $line ) . '</dt>';
			}
		}
		echo '</dl>';
		echo '</div>';
	}

	echo '<p class="arriva-merch-single__order-note">' . esc_html__( 'Kein Online-Warenkorb — Bestellung über den Vorstand.', 'arriva' ) . '</p>';
	echo '<a class="arriva-merch-single__order" href="' . esc_url( home_url( '/mitglieder/vorstand/' ) ) . '">' . esc_html__( 'Beim Vorstand bestellen', 'arriva' ) . '</a>';
	echo '</aside>';

	echo '</div>';

	if ( trim( $content ) ) {
		echo '<div class="arriva-merch-single__details">';
		echo '<h2 class="arriva-merch-single__details-title">' . esc_html__( 'Weitere Informationen', 'arriva' ) . '</h2>';
		echo '<div class="arriva-merch-single__body">';
		echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- filtered content.
		echo '</div>';
		echo '</div>';
	}

	echo '<nav class="arriva-merch-single__actions" aria-label="' . esc_attr__( 'Navigation', 'arriva' ) . '">';
	echo '<a class="arriva-merch-single__back" href="' . esc_url( home_url( '/mitglieder/merch/' ) ) . '">' . esc_html__( '← Zurück zur Übersicht', 'arriva' ) . '</a>';
	echo '</nav>';

	echo '<dialog class="arriva-merch-lightbox" id="arriva-merch-lightbox" aria-label="' . esc_attr__( 'Produktbild', 'arriva' ) . '">';
	echo '<button type="button" class="arriva-merch-lightbox__close" aria-label="' . esc_attr__( 'Schließen', 'arriva' ) . '">×</button>';
	echo '<img class="arriva-merch-lightbox__img" alt="" decoding="async" />';
	echo '</dialog>';

	echo '</article>';

	return ob_get_clean();
}
add_filter( 'the_content', 'arriva_merch_single_content', 9 );
