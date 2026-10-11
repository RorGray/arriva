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

$user = wp_get_current_user();
$name = '' !== trim( (string) $user->first_name ) ? $user->first_name : $user->display_name;

$next  = arriva_query_events(
	array(
		'count'     => 1,
		'from_date' => wp_date( 'Y-m-d' ),
		'order'     => 'ASC',
	)
);
$event = $next ? $next[0] : null;

echo '<section ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-welcome' ) ) . '>';

if ( arriva_has_rich_text( $attributes['greeting'] ) ) {
	echo '<h2 class="arriva-dash-welcome__greeting">' . arriva_fill_template( wp_kses_post( $attributes['greeting'] ), array( esc_html( $name ) ) ) . '</h2>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- parts escaped.
}

if ( arriva_has_rich_text( $attributes['intro'] ) ) {
	echo '<p class="arriva-dash-welcome__intro">' . wp_kses_post( $attributes['intro'] ) . '</p>';
}

if ( $event ) {
	$badge = arriva_event_date_badge( $event );
	$date  = $badge ? wp_date( 'D, j. F', strtotime( $badge['iso'] . ' 12:00:00' ) ) : '';

	echo '<p class="arriva-dash-welcome__next">';
	if ( arriva_has_rich_text( $attributes['nextLabel'] ) ) {
		echo '<span class="arriva-dash-welcome__next-label">' . wp_kses_post( $attributes['nextLabel'] ) . '</span> ';
	}
	echo '<a href="' . esc_url( get_permalink( $event ) ) . '">' . esc_html( get_the_title( $event ) ) . '</a>';
	if ( $date ) {
		echo ' <time datetime="' . esc_attr( $badge['iso'] ) . '">' . esc_html( $date ) . '</time>';
	}
	echo '</p>';
} elseif ( arriva_has_rich_text( $attributes['noEventText'] ) ) {
	echo '<p class="arriva-dash-welcome__next">' . wp_kses_post( $attributes['noEventText'] ) . '</p>';
}

echo '</section>';
