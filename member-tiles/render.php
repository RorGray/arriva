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

$events = arriva_query_events(
	array(
		'count'     => -1,
		'from_date' => wp_date( 'Y-m-d' ),
		'order'     => 'ASC',
	)
);
$termine_live = '';
if ( $events ) {
	$badge        = arriva_event_date_badge( $events[0] );
	$next_date    = $badge ? wp_date( 'j. F', strtotime( $badge['iso'] . ' 12:00:00' ) ) : '';
	$termine_live = arriva_fill_template( wp_kses_post( $attributes['termineLive'] ), array( (string) count( $events ), esc_html( $next_date ) ) );
}

$merch_live = '';
$products   = arriva_query_merch();
if ( $products ) {
	$newest     = get_posts(
		array(
			'post_type'      => ARRIVA_MERCH_POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'orderby'        => 'date',
			'order'          => 'DESC',
		)
	);
	$merch_live = arriva_fill_template(
		wp_kses_post( $attributes['merchLive'] ),
		array( (string) count( $products ), $newest ? esc_html( get_the_title( $newest[0] ) ) : '' )
	);
}

$icons = array(
	'termine'   => '<path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
	'vorstand'  => '<path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14a6.5 6.5 0 0 1 3.5 6"/>',
	'dokumente' => '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5ZM14 3v5h5M9 13h6M9 17h6"/>',
	'merch'     => '<path d="m8 3-5 3 2 4 2-1v12h10V9l2 1 2-4-5-3a4 4 0 0 1-8 0Z"/>',
);

$tiles = array(
	'termine'   => array( '/mitglieder/termine/', $termine_live ),
	'vorstand'  => array( '/mitglieder/vorstand/', '' ),
	'dokumente' => array( '/mitglieder/dokumente/', '' ),
	'merch'     => array( '/mitglieder/merch/', $merch_live ),
);

echo '<nav ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-tiles' ) ) . '>';
echo '<ul class="arriva-dash-tiles__list" role="list">';

foreach ( $tiles as $key => $tile ) {
	$title = isset( $attributes[ $key . 'Title' ] ) ? $attributes[ $key . 'Title' ] : '';
	$text  = isset( $attributes[ $key . 'Text' ] ) ? $attributes[ $key . 'Text' ] : '';
	if ( ! arriva_has_rich_text( $title ) ) {
		continue;
	}

	echo '<li><a class="arriva-dash-tiles__tile" href="' . esc_url( home_url( $tile[0] ) ) . '">';
	echo '<svg class="arriva-dash-tiles__icon" viewBox="0 0 24 24" aria-hidden="true">' . $icons[ $key ] . '</svg>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- static SVG.
	echo '<span class="arriva-dash-tiles__title">' . wp_kses_post( $title ) . '</span>';
	if ( arriva_has_rich_text( $text ) ) {
		echo '<span class="arriva-dash-tiles__text">' . wp_kses_post( $text ) . '</span>';
	}
	if ( '' !== $tile[1] ) {
		echo '<span class="arriva-dash-tiles__live">' . $tile[1] . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
	}
	echo '</a></li>';
}

echo '</ul></nav>';
