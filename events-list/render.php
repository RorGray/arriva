<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$year           = isset( $attributes['year'] ) ? (int) $attributes['year'] : 0;
$year           = $year > 0 ? $year : (int) wp_date( 'Y' );
$show_year      = ! isset( $attributes['showYear'] ) || ! empty( $attributes['showYear'] );
$show_calendar  = ! isset( $attributes['showCalendar'] ) || ! empty( $attributes['showCalendar'] );
$eyebrow        = isset( $attributes['eyebrow'] ) ? (string) $attributes['eyebrow'] : '';
$heading        = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : '';
$subtitle       = isset( $attributes['subtitle'] ) ? (string) $attributes['subtitle'] : '';
$empty_text     = isset( $attributes['emptyText'] ) ? (string) $attributes['emptyText'] : '';
$note           = isset( $attributes['note'] ) ? (string) $attributes['note'] : '';
$list_label     = isset( $attributes['listLabel'] ) ? (string) $attributes['listLabel'] : '';
$calendar_label = isset( $attributes['calendarLabel'] ) ? (string) $attributes['calendarLabel'] : '';
$ical_label     = isset( $attributes['icalLabel'] ) ? (string) $attributes['icalLabel'] : '';

$today = wp_date( 'Y-m-d' );
$posts = arriva_query_events(
	array(
		'count' => -1,
		'year'  => $year,
		'order' => 'ASC',
	)
);

$with_calendar = $show_calendar
	&& ! empty( $posts )
	&& arriva_has_rich_text( $list_label )
	&& arriva_has_rich_text( $calendar_label );

$initial_month = 1;
if ( (int) wp_date( 'Y' ) === $year ) {
	$initial_month = (int) wp_date( 'n' );
} elseif ( ! empty( $posts ) ) {
	$first_iso     = (string) get_post_meta( $posts[0]->ID, ARRIVA_EVENT_DATE_META, true );
	$initial_month = $first_iso ? (int) substr( $first_iso, 5, 2 ) : 1;
}

$wrapper_args = array(
	'class' => 'arriva-events alignfull',
	'id'    => 'termine-' . $year,
);
if ( $with_calendar ) {
	$wrapper_args['data-arriva-calendar'] = '';
	$wrapper_args['data-initial-month']   = (string) $initial_month;
}

echo '<section ' . get_block_wrapper_attributes( $wrapper_args ) . '>';
echo '<div class="arriva-events__inner">';

if ( arriva_has_rich_text( $eyebrow ) ) {
	echo '<p class="arriva-events__eyebrow">' . wp_kses_post( $eyebrow ) . '</p>';
}

if ( arriva_has_rich_text( $heading ) ) {
	echo '<h2 class="arriva-events__heading">' . wp_kses_post( $heading );
	if ( $show_year ) {
		echo ' <span class="arriva-events__year">' . esc_html( (string) $year ) . '</span>';
	}
	echo '</h2>';
}

if ( arriva_has_rich_text( $subtitle ) ) {
	echo '<p class="arriva-events__intro">' . wp_kses_post( $subtitle ) . '</p>';
}

if ( $with_calendar ) {
	echo '<div class="arriva-events__toolbar">';
	echo '<div class="arriva-events__switch" role="group">';
	echo '<button type="button" class="arriva-events__switch-btn" data-view="list" aria-pressed="true">' . wp_kses_post( $list_label ) . '</button>';
	echo '<button type="button" class="arriva-events__switch-btn" data-view="calendar" aria-pressed="false">' . wp_kses_post( $calendar_label ) . '</button>';
	echo '</div>';
	echo '<div class="arriva-cal__nav">';
	echo '<button type="button" class="arriva-cal__step" data-step="-1"><span aria-hidden="true">‹</span></button>';
	echo '<span class="arriva-cal__current" aria-live="polite"></span>';
	echo '<button type="button" class="arriva-cal__step" data-step="1"><span aria-hidden="true">›</span></button>';
	echo '</div>';
	echo '</div>';
}

if ( empty( $posts ) ) {
	if ( arriva_has_rich_text( $empty_text ) ) {
		echo '<p class="arriva-events__empty">' . wp_kses_post( $empty_text ) . '</p>';
	}
} else {
	$next_marked   = false;
	$current_month = wp_date( 'Y-m' );

	echo '<div class="arriva-events__months">';

	foreach ( arriva_group_events_by_month( $posts ) as $month_key => $group ) {
		$group_class = 'arriva-events__month-group' . ( $month_key < $current_month ? ' is-past' : '' );

		echo '<div class="' . esc_attr( $group_class ) . '">';
		echo '<h3 class="arriva-events__month-label">' . esc_html( $group['label'] ) . '</h3>';
		echo '<ul class="arriva-events__list">';

		foreach ( $group['posts'] as $post ) {
			$iso     = (string) get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
			$is_next = ! $next_marked && $iso >= $today;
			if ( $is_next ) {
				$next_marked = true;
			}

			arriva_render_event_card(
				$post,
				array(
					'tile'    => 'weekday',
					'today'   => $today,
					'is_next' => $is_next,
				)
			);
		}

		echo '</ul>';
		echo '</div>';
	}

	echo '</div>';

	if ( $with_calendar ) {
		arriva_render_events_calendar( $year, $posts, $today );
	}
}

$ical_url = arriva_has_rich_text( $ical_label ) ? arriva_ical_subscribe_url() : '';
if ( '' !== $ical_url ) {
	echo '<a class="arriva-events__ical" href="' . esc_url( $ical_url, array( 'webcal', 'https', 'http' ) ) . '">' . wp_kses_post( $ical_label ) . '</a>';
}

if ( arriva_has_rich_text( $note ) ) {
	echo '<p class="arriva-events__note">' . wp_kses_post( $note ) . '</p>';
}

echo '</div>';
echo '</section>';
