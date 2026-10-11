<?php
/**
 * Server render for page-header (supports self-closing block comments in page content).
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$eyebrow  = isset( $attributes['eyebrow'] ) ? (string) $attributes['eyebrow'] : '';
$title    = isset( $attributes['title'] ) ? (string) $attributes['title'] : '';
$subtitle = isset( $attributes['subtitle'] ) ? (string) $attributes['subtitle'] : '';

$has_eyebrow  = '' !== trim( wp_strip_all_tags( $eyebrow ) );
$has_title    = '' !== trim( wp_strip_all_tags( $title ) );
$has_subtitle = '' !== trim( wp_strip_all_tags( $subtitle ) );

if ( ! $has_title && ! $has_subtitle && ! $has_eyebrow ) {
	return;
}

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'alignfull',
	)
);

echo '<div ' . $wrapper . '>';
echo '<div class="arriva-page-header__inner">';

if ( $has_eyebrow ) {
	echo '<p class="arriva-page-header__eyebrow">' . wp_kses_post( $eyebrow ) . '</p>';
}

if ( $has_title ) {
	echo '<h1 class="arriva-page-header__title">' . wp_kses_post( $title ) . '</h1>';
}

if ( $has_subtitle ) {
	echo '<p class="arriva-page-header__subtitle">' . wp_kses_post( $subtitle ) . '</p>';
}

echo '</div></div>';
