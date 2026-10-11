<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
	return;
}

/**
 * @param WP_Post[] $posts Products.
 */
$render_grid = static function ( array $posts ) {
	if ( empty( $posts ) ) {
		return;
	}

	echo '<ul class="arriva-merch-shop__grid">';

	foreach ( $posts as $post ) {
		$price = get_post_meta( $post->ID, ARRIVA_MERCH_PRICE_META, true );
		$price = $price ? $price : __( 'Preis auf Anfrage', 'arriva' );
		$url   = get_permalink( $post );
		$thumb = get_the_post_thumbnail( $post, 'medium_large', array( 'class' => 'arriva-merch-shop__image' ) );
		$excerpt = has_excerpt( $post ) ? get_the_excerpt( $post ) : '';

		echo '<li class="arriva-merch-shop__item">';
		echo '<a class="arriva-merch-shop__card" href="' . esc_url( $url ) . '">';

		echo '<div class="arriva-merch-shop__media">';
		if ( $thumb ) {
			echo $thumb; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		} else {
			echo '<div class="arriva-merch-shop__media-placeholder" aria-hidden="true"></div>';
		}
		echo '</div>';

		echo '<div class="arriva-merch-shop__body">';
		echo '<h3 class="arriva-merch-shop__title">' . esc_html( get_the_title( $post ) ) . '</h3>';
		echo '<p class="arriva-merch-shop__price">' . esc_html( $price ) . '</p>';
		if ( $excerpt ) {
			echo '<p class="arriva-merch-shop__excerpt">' . esc_html( wp_strip_all_tags( $excerpt ) ) . '</p>';
		}
		echo '<span class="arriva-merch-shop__cta">' . esc_html__( 'Details ansehen', 'arriva' ) . '</span>';
		echo '</div>';

		echo '</a></li>';
	}

	echo '</ul>';
};

$wrapper = get_block_wrapper_attributes( array( 'class' => 'arriva-merch-shop' ) );

echo '<div ' . $wrapper . '>';

$featured = arriva_query_merch( 'featured' );
$catalog  = arriva_query_merch( 'catalog' );

if ( $featured ) {
	echo '<h2 class="arriva-merch-shop__heading">' . esc_html__( 'Aktuelle Artikel', 'arriva' ) . '</h2>';
	$render_grid( $featured );
}

if ( $catalog ) {
	echo '<h2 class="arriva-merch-shop__heading">' . esc_html__( 'Weitere Textilien & Farben', 'arriva' ) . '</h2>';
	$render_grid( $catalog );
}

if ( empty( $featured ) && empty( $catalog ) ) {
	echo '<p class="arriva-merch-shop__empty">' . esc_html__( 'Noch keine Produkte. Legen Sie welche unter Vereinsprodukte an.', 'arriva' ) . '</p>';
}

echo '</div>';
