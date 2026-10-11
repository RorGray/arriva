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

$forecast = arriva_weather_forecast( $attributes['latitude'], $attributes['longitude'], $attributes['days'] );

echo '<section ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-card arriva-dash-weather' ) ) . '>';

if ( arriva_has_rich_text( $attributes['heading'] ) ) {
	echo '<h2 class="arriva-dash-card__title">' . wp_kses_post( $attributes['heading'] ) . '</h2>';
}

if ( ! $forecast ) {
	echo '<p class="arriva-dash-card__empty">' . wp_kses_post( $attributes['errorText'] ) . '</p>';
	echo '</section>';
	return;
}

$current = $forecast['current'];
if ( isset( $current['temperature_2m'], $current['weather_code'] ) ) {
	$info = arriva_weather_code_info( (int) $current['weather_code'] );
	echo '<p class="arriva-dash-weather__now">';
	echo '<span class="arriva-dash-weather__icon" aria-hidden="true">' . esc_html( $info['icon'] ) . '</span>';
	echo '<span class="arriva-dash-weather__temp">' . esc_html( (string) (int) round( (float) $current['temperature_2m'] ) ) . '°</span>';
	echo '<span class="arriva-dash-weather__label">' . esc_html( $info['label'] );
	if ( isset( $current['wind_speed_10m'] ) && arriva_has_rich_text( $attributes['windLabel'] ) ) {
		echo '<br />' . wp_kses_post( $attributes['windLabel'] ) . ' ' . esc_html( number_format_i18n( round( (float) $current['wind_speed_10m'] ) ) ) . ' km/h';
	}
	echo '</span>';
	echo '</p>';
}

echo '<ul class="arriva-dash-weather__days" role="list">';
foreach ( $forecast['days'] as $index => $day ) {
	$info  = arriva_weather_code_info( $day['code'] );
	$label = 0 === $index && arriva_has_rich_text( $attributes['todayLabel'] )
		? wp_kses_post( $attributes['todayLabel'] )
		: esc_html( wp_date( 'D', strtotime( $day['date'] . ' 12:00:00' ) ) );

	echo '<li class="arriva-dash-weather__day" title="' . esc_attr( $info['label'] ) . '">';
	echo '<span class="arriva-dash-weather__day-name">' . $label . '</span>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
	echo '<span class="arriva-dash-weather__day-icon" aria-hidden="true">' . esc_html( $info['icon'] ) . '</span>';
	echo '<span class="arriva-dash-weather__day-temp">' . esc_html( (string) (int) round( $day['max'] ) ) . '° <span>' . esc_html( (string) (int) round( $day['min'] ) ) . '°</span></span>';
	if ( arriva_has_rich_text( $attributes['rainLabel'] ) ) {
		echo '<span class="arriva-dash-weather__day-rain"><span class="screen-reader-text">' . wp_kses_post( $attributes['rainLabel'] ) . ' </span>💧 ' . esc_html( $day['rain'] ) . ' %</span>';
	}
	echo '</li>';
}
echo '</ul>';

if ( arriva_has_rich_text( $attributes['sourceLabel'] ) ) {
	echo '<p class="arriva-dash-card__note"><a href="https://open-meteo.com/" rel="noopener" target="_blank">' . wp_kses_post( $attributes['sourceLabel'] ) . '</a></p>';
}

echo '</section>';
