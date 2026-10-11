<?php
/**
 * Plugin Name: Arriva
 * Description: Custom Gutenberg blocks for Arriva Speyer e.V.
 * Version: 1.10.6
 * Author: Arriva Speyer e.V.
 * License: GPL-2.0-or-later
 * Text Domain: arriva
 */

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/includes/events.php';
require_once __DIR__ . '/includes/ical.php';
require_once __DIR__ . '/includes/merch.php';
require_once __DIR__ . '/includes/member-access.php';

register_activation_hook(
	__FILE__,
	static function () {
		arriva_register_events_content_types();
		arriva_register_merch_content_type();
		flush_rewrite_rules();
	}
);

if ( ! defined( 'ARRIVA_VERSION' ) ) {
	$arriva_plugin = get_file_data( __FILE__, array( 'Version' => 'Version' ) );
	define( 'ARRIVA_VERSION', $arriva_plugin['Version'] ?: '1.0.0' );
}

add_action( 'init', function () {
	$formats_asset = require __DIR__ . '/shared/formats.asset.php';
	$color_palette_asset = require __DIR__ . '/shared/color-palette.asset.php';

	wp_register_script(
		'arriva-color-palette',
		plugins_url( 'shared/color-palette.js', __FILE__ ),
		$color_palette_asset['dependencies'],
		$color_palette_asset['version'],
		true
	);

	wp_register_script(
		'arriva-formats',
		plugins_url( 'shared/formats.js', __FILE__ ),
		$formats_asset['dependencies'],
		$formats_asset['version'],
		true
	);

	wp_register_style(
		'arriva-events',
		plugins_url( 'shared/events.css', __FILE__ ),
		array(),
		ARRIVA_VERSION
	);

	register_block_type( __DIR__ . '/wave-divider' );
	register_block_type( __DIR__ . '/hero' );
	register_block_type( __DIR__ . '/page-header' );
	register_block_type( __DIR__ . '/protected-email' );
	register_block_type( __DIR__ . '/upcoming-events' );
	register_block_type( __DIR__ . '/events-list' );
	register_block_type( __DIR__ . '/member-nav' );
	register_block_type( __DIR__ . '/merch-catalog' );

	wp_register_style(
		'arriva-merch-single',
		plugins_url( 'shared/merch-single.css', __FILE__ ),
		array(),
		ARRIVA_VERSION
	);
	register_block_type( __DIR__ . '/merch-product' );

	register_block_pattern(
		'arriva/hero-full-width',
		array(
			'title'       => __( 'Full-width hero with wave', 'arriva' ),
			'description' => _x(
				'Dark full-width hero with eyebrow, highlighted title, buttons, and wave transition.',
				'Block pattern description',
				'arriva'
			),
			'categories'  => array( 'banner', 'header' ),
			'keywords'    => array( 'hero', 'banner', 'cover', 'wave' ),
			'content'     => "<!-- wp:arriva/hero {\"align\":\"full\"} /-->\n<!-- wp:arriva/wave-divider {\"align\":\"full\",\"overlapPrevious\":true,\"topColor\":\"transparent\",\"bottomColor\":\"#ffffff\"} /-->",
		)
	);
} );

add_action( 'enqueue_block_assets', function () {
	wp_enqueue_style(
		'arriva-formats',
		plugins_url( 'shared/formats.css', __FILE__ ),
		array(),
		ARRIVA_VERSION
	);
} );

add_action( 'wp_enqueue_scripts', function () {
	if ( function_exists( 'arriva_is_mitglied_area_view' ) && arriva_is_mitglied_area_view() ) {
		wp_enqueue_style(
			'arriva-member-area',
			plugins_url( 'shared/member-area.css', __FILE__ ),
			array(),
			ARRIVA_VERSION
		);
	}

	if ( is_page( 'vorstand' ) ) {
		wp_enqueue_style(
			'arriva-member-vorstand',
			plugins_url( 'shared/member-vorstand.css', __FILE__ ),
			array( 'arriva-member-area' ),
			ARRIVA_VERSION
		);
	}

	if ( is_page( 'merch' ) || is_singular( ARRIVA_MERCH_POST_TYPE ) ) {
		wp_enqueue_style(
			'arriva-merch-catalog',
			plugins_url( 'merch-catalog/style.css', __FILE__ ),
			array( 'arriva-member-area' ),
			ARRIVA_VERSION
		);
	}

	if ( is_page( 'mitglieder' ) ) {
		wp_enqueue_style(
			'arriva-member-login',
			plugins_url( 'shared/member-login.css', __FILE__ ),
			array(),
			ARRIVA_VERSION
		);
	}
} );

add_action( 'enqueue_block_editor_assets', function () {
	wp_enqueue_script( 'arriva-formats' );

	$post_id = get_the_ID();
	if ( ! $post_id || 'page' !== get_post_type( $post_id ) ) {
		return;
	}

	if ( ! function_exists( 'arriva_is_mitglied_hub_or_subpage' ) || ! arriva_is_mitglied_hub_or_subpage( $post_id ) ) {
		return;
	}

	wp_enqueue_style(
		'arriva-member-editor',
		plugins_url( 'shared/member-editor.css', __FILE__ ),
		array(),
		ARRIVA_VERSION
	);

	wp_enqueue_style(
		'arriva-member-nav',
		plugins_url( 'member-nav/style.css', __FILE__ ),
		array( 'arriva-member-editor' ),
		ARRIVA_VERSION
	);

	$page = get_post( $post_id );
	$slug = $page ? $page->post_name : '';

	if ( 'vorstand' === $slug ) {
		wp_enqueue_style(
			'arriva-member-vorstand',
			plugins_url( 'shared/member-vorstand.css', __FILE__ ),
			array( 'arriva-member-editor' ),
			ARRIVA_VERSION
		);
	}

	if ( 'merch' === $slug ) {
		wp_enqueue_style(
			'arriva-merch-catalog',
			plugins_url( 'merch-catalog/style.css', __FILE__ ),
			array( 'arriva-member-editor' ),
			ARRIVA_VERSION
		);
	}
} );
