<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$webcal = arriva_ical_subscribe_url();
if ( '' === $webcal ) {
	return;
}

$https = (string) preg_replace( '#^webcal://#', 'https://', $webcal );

echo '<section ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-card arriva-dash-calendar' ) ) . ' data-arriva-calendar>';

if ( arriva_has_rich_text( $attributes['heading'] ) ) {
	echo '<h2 class="arriva-dash-card__title">' . wp_kses_post( $attributes['heading'] ) . '</h2>';
}

if ( arriva_has_rich_text( $attributes['text'] ) ) {
	echo '<p class="arriva-dash-calendar__text">' . wp_kses_post( $attributes['text'] ) . '</p>';
}

echo '<div class="arriva-dash-calendar__actions">';
if ( arriva_has_rich_text( $attributes['buttonLabel'] ) ) {
	echo '<a class="arriva-dash-calendar__button" href="' . esc_url( $webcal, array( 'webcal' ) ) . '">' . wp_kses_post( $attributes['buttonLabel'] ) . '</a>';
}
echo '<input class="arriva-dash-calendar__url" type="text" readonly value="' . esc_attr( $https ) . '" aria-label="' . esc_attr( wp_strip_all_tags( $attributes['heading'] ) ) . '" data-arriva-calendar-url />';
if ( arriva_has_rich_text( $attributes['copyLabel'] ) ) {
	echo '<button type="button" class="arriva-dash-calendar__copy" data-arriva-calendar-copy data-copied-label="' . esc_attr( wp_strip_all_tags( $attributes['copiedLabel'] ) ) . '">' . esc_html( wp_strip_all_tags( $attributes['copyLabel'] ) ) . '</button>';
}
echo '</div>';

if ( arriva_has_rich_text( $attributes['note'] ) ) {
	echo '<p class="arriva-dash-card__note">' . wp_kses_post( $attributes['note'] ) . '</p>';
}

echo '</section>';
