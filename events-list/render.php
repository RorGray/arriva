<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$year            = isset( $attributes['year'] ) ? (int) $attributes['year'] : 0;
$year            = $year > 0 ? $year : (int) wp_date( 'Y' );
$heading         = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : __( 'Termine', 'arriva' );
$show_disclaimer = ! empty( $attributes['showDisclaimer'] );

$posts = arriva_query_events(
	array(
		'count' => -1,
		'year'  => $year,
		'order' => 'ASC',
	)
);

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'arriva-events-list',
		'id'    => 'termine-' . $year,
	)
);

echo '<section ' . $wrapper . '>';

if ( $heading ) {
	echo '<h2 class="arriva-events-list__heading">' . esc_html( trim( $heading . ' ' . $year ) ) . '</h2>';
}

if ( empty( $posts ) ) {
	echo '<p class="arriva-events-list__empty">' . esc_html__( 'Keine Termine für dieses Jahr.', 'arriva' ) . '</p>';
	echo '</section>';
	return;
}

foreach ( arriva_group_events_by_type( $posts ) as $group ) {
	$type_label = $group['term'] ? $group['term']->name : __( 'Ohne Termin-Typ', 'arriva' );
	echo '<h3 class="arriva-events-list__type">' . esc_html( $type_label ) . '</h3>';
	echo '<ul class="arriva-events-list__list">';
	foreach ( $group['posts'] as $post ) {
		$date_label = arriva_format_event_date( $post );
		$url        = get_permalink( $post );
		echo '<li><time datetime="' . esc_attr( get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true ) ) . '">' . esc_html( $date_label ) . '</time>';
		echo ' — <a href="' . esc_url( $url ) . '">' . esc_html( get_the_title( $post ) ) . '</a></li>';
	}
	echo '</ul>';
}

if ( $show_disclaimer ) {
	echo '<p class="arriva-events-list__note">' . esc_html__( 'Alle Termine sind unter Vorbehalt.', 'arriva' ) . '</p>';
}

echo '</section>';
