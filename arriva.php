<?php
/**
 * Plugin Name: Arriva
 * Description: Custom Gutenberg blocks for Arriva Speyer e.V.
 * Version: 1.3.2
 * Author: Arriva Speyer e.V.
 * License: GPL-2.0-or-later
 * Text Domain: arriva
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'ARRIVA_VERSION' ) ) {
	$arriva_plugin = get_file_data( __FILE__, array( 'Version' => 'Version' ) );
	define( 'ARRIVA_VERSION', $arriva_plugin['Version'] ?: '1.0.0' );
}

add_action( 'init', function () {
	register_block_type( __DIR__ . '/wave-divider' );
	register_block_type( __DIR__ . '/hero' );

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
