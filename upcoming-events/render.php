<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$count      = isset( $attributes['count'] ) ? (int) $attributes['count'] : 8;
$eyebrow    = isset( $attributes['eyebrow'] ) ? (string) $attributes['eyebrow'] : '';
$heading    = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : '';
$subtitle   = isset( $attributes['subtitle'] ) ? (string) $attributes['subtitle'] : '';
$empty_text = isset( $attributes['emptyText'] ) ? (string) $attributes['emptyText'] : '';
$more_label = isset( $attributes['moreLabel'] ) ? (string) $attributes['moreLabel'] : '';
$more_url   = isset( $attributes['moreUrl'] ) ? trim( (string) $attributes['moreUrl'] ) : '';

$today = wp_date( 'Y-m-d' );
$posts = arriva_query_events(
	array(
		'count'     => $count,
		'from_date' => $today,
		'order'     => 'ASC',
	)
);

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'arriva-events alignfull',
	)
);

echo '<section ' . $wrapper . '>';
echo '<div class="arriva-events__inner">';

if ( arriva_has_rich_text( $eyebrow ) ) {
	echo '<p class="arriva-events__eyebrow">' . wp_kses_post( $eyebrow ) . '</p>';
}

if ( arriva_has_rich_text( $heading ) ) {
	echo '<h2 class="arriva-events__heading">' . wp_kses_post( $heading ) . '</h2>';
}

if ( arriva_has_rich_text( $subtitle ) ) {
	echo '<p class="arriva-events__intro">' . wp_kses_post( $subtitle ) . '</p>';
}

if ( empty( $posts ) ) {
	if ( arriva_has_rich_text( $empty_text ) ) {
		echo '<p class="arriva-events__empty">' . wp_kses_post( $empty_text ) . '</p>';
	}
} else {
	echo '<ul class="arriva-events__list">';
	foreach ( $posts as $post ) {
		arriva_render_event_card( $post, array( 'today' => $today ) );
	}
	echo '</ul>';
}

if ( arriva_has_rich_text( $more_label ) && '' !== $more_url ) {
	echo '<a class="arriva-events__more" href="' . esc_url( $more_url ) . '">' . wp_kses_post( $more_label ) . '</a>';
}

echo '</div>';
echo '</section>';
