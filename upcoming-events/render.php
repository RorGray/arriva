<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$count     = isset( $attributes['count'] ) ? (int) $attributes['count'] : 8;
$eyebrow   = isset( $attributes['eyebrow'] ) ? (string) $attributes['eyebrow'] : __( 'Termine', 'arriva' );
$heading   = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : __( 'Kommende Veranstaltungen', 'arriva' );
$subtitle  = isset( $attributes['subtitle'] ) ? (string) $attributes['subtitle'] : '';
$more_label = isset( $attributes['moreLabel'] ) ? (string) $attributes['moreLabel'] : __( 'Alle Termine im Mitgliederbereich', 'arriva' );
$more_url   = isset( $attributes['moreUrl'] ) ? trim( (string) $attributes['moreUrl'] ) : '';

if ( '' === $more_url ) {
	$more_url = home_url( '/mitglieder/termine/' );
}

$today = wp_date( 'Y-m-d' );
$posts = arriva_query_events(
	array(
		'count'     => $count,
		'from_date' => $today,
		'order'     => 'ASC',
	)
);

$wrapper = get_block_wrapper_attributes( array( 'class' => 'arriva-upcoming-events' ) );

echo '<section ' . $wrapper . '>';
echo '<div class="arriva-upcoming-events__inner">';

if ( $eyebrow ) {
	echo '<p class="arriva-upcoming-events__eyebrow">' . esc_html( $eyebrow ) . '</p>';
}

if ( $heading ) {
	echo '<h2 class="arriva-upcoming-events__heading">' . esc_html( $heading ) . '</h2>';
}

if ( $subtitle ) {
	echo '<p class="arriva-upcoming-events__intro">' . esc_html( $subtitle ) . '</p>';
}

if ( empty( $posts ) ) {
	echo '<p class="arriva-upcoming-events__empty">' . esc_html__( 'Keine bevorstehenden Termine.', 'arriva' ) . '</p>';
} else {
	echo '<ul class="arriva-upcoming-events__list">';

	foreach ( $posts as $post ) {
		$badge   = arriva_event_date_badge( $post );
		$variant = arriva_event_type_variant( $post );
		$type    = arriva_event_type_label( $post );
		$detail  = trim( wp_strip_all_tags( (string) get_post_field( 'post_excerpt', $post ) ) );
		$url     = get_permalink( $post );

		echo '<li class="arriva-upcoming-events__item">';
		echo '<a class="arriva-upcoming-events__card" href="' . esc_url( $url ) . '">';

		if ( $badge ) {
			echo '<time class="arriva-upcoming-events__date" datetime="' . esc_attr( $badge['iso'] ) . '">';
			echo '<span class="arriva-upcoming-events__day">' . esc_html( $badge['day'] ) . '</span>';
			echo '<span class="arriva-upcoming-events__month">' . esc_html( $badge['month'] ) . '</span>';
			echo '</time>';
		}

		echo '<span class="arriva-upcoming-events__body">';
		echo '<span class="arriva-upcoming-events__title">' . esc_html( get_the_title( $post ) ) . '</span>';
		if ( $detail ) {
			echo '<span class="arriva-upcoming-events__detail">' . esc_html( $detail ) . '</span>';
		}
		echo '</span>';

		if ( $type ) {
			$variant_class = $variant ? ' arriva-upcoming-events__type--' . $variant : '';
			echo '<span class="arriva-upcoming-events__type' . esc_attr( $variant_class ) . '">' . esc_html( $type ) . '</span>';
		}

		echo '</a>';
		echo '</li>';
	}

	echo '</ul>';
}

if ( $more_label ) {
	echo '<a class="arriva-upcoming-events__more" href="' . esc_url( $more_url ) . '">' . esc_html( $more_label ) . ' <span aria-hidden="true">→</span></a>';
}

echo '</div>';
echo '</section>';
