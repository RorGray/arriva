<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$count   = isset( $attributes['count'] ) ? (int) $attributes['count'] : 8;
$heading = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : __( 'Nächste Termine', 'arriva' );

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

if ( $heading ) {
	echo '<h2 class="arriva-upcoming-events__heading">' . esc_html( $heading ) . '</h2>';
}

if ( empty( $posts ) ) {
	echo '<p class="arriva-upcoming-events__empty">' . esc_html__( 'Keine bevorstehenden Termine.', 'arriva' ) . '</p>';
	echo '</section>';
	return;
}

echo '<ul class="arriva-upcoming-events__list">';

foreach ( $posts as $post ) {
	$date_label = arriva_format_event_date( $post );
	$type_label = arriva_event_type_label( $post );
	$url        = get_permalink( $post );
	echo '<li class="arriva-upcoming-events__item">';
	echo '<time class="arriva-upcoming-events__date" datetime="' . esc_attr( get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true ) ) . '">' . esc_html( $date_label ) . '</time>';
	if ( $type_label ) {
		echo ' <span class="arriva-upcoming-events__type">' . esc_html( $type_label ) . '</span>';
	}
	echo ' — <a class="arriva-upcoming-events__link" href="' . esc_url( $url ) . '">' . esc_html( get_the_title( $post ) ) . '</a>';
	echo '</li>';
}

echo '</ul>';
echo '</section>';
