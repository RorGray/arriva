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

$level = arriva_rhine_level( $attributes['station'] );

echo '<section ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-card arriva-dash-level' ) ) . '>';

if ( arriva_has_rich_text( $attributes['heading'] ) ) {
	echo '<h2 class="arriva-dash-card__title">' . wp_kses_post( $attributes['heading'] ) . '</h2>';
}

if ( ! $level ) {
	echo '<p class="arriva-dash-card__empty">' . wp_kses_post( $attributes['errorText'] ) . '</p>';
	echo '</section>';
	return;
}

$trend = array(
	1  => array( '↑', $attributes['risingLabel'], 'rising' ),
	-1 => array( '↓', $attributes['fallingLabel'], 'falling' ),
	0  => array( '→', $attributes['steadyLabel'], 'steady' ),
);
$trend = $trend[ $level['trend'] ];

$states = array(
	'low'    => $attributes['lowLabel'],
	'normal' => $attributes['normalLabel'],
	'high'   => $attributes['highLabel'],
);

echo '<p class="arriva-dash-level__reading">';
echo '<span class="arriva-dash-level__value">' . esc_html( number_format_i18n( $level['value'] ) ) . '</span>';
echo '<span class="arriva-dash-level__unit">cm</span>';
echo '<span class="arriva-dash-level__trend is-' . esc_attr( $trend[2] ) . '"><span aria-hidden="true">' . esc_html( $trend[0] ) . '</span> ' . wp_kses_post( $trend[1] ) . '</span>';
echo '</p>';

if ( isset( $states[ $level['state'] ] ) && arriva_has_rich_text( $states[ $level['state'] ] ) ) {
	echo '<p class="arriva-dash-level__state is-' . esc_attr( $level['state'] ) . '">' . wp_kses_post( $states[ $level['state'] ] ) . '</p>';
}

$meta = array();
if ( $level['time'] && arriva_has_rich_text( $attributes['timeLabel'] ) ) {
	$meta[] = arriva_fill_template( wp_kses_post( $attributes['timeLabel'] ), array( esc_html( wp_date( 'j.n., H:i', $level['time'] ) ) ) );
}
if ( arriva_has_rich_text( $attributes['sourceLabel'] ) ) {
	$meta[] = '<a href="https://www.pegelonline.wsv.de/" rel="noopener" target="_blank">' . wp_kses_post( $attributes['sourceLabel'] ) . '</a>';
}
if ( $meta ) {
	echo '<p class="arriva-dash-card__note">' . implode( ' · ', $meta ) . '</p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
}

echo '</section>';
