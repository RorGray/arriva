<?php
/**
 * Plugin Name: Arriva
 * Description: Custom Gutenberg blocks for Arriva Speyer e.V.
 * Version: 1.1.1
 * Author: Arriva Speyer e.V.
 * License: GPL-2.0-or-later
 * Text Domain: arriva
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	register_block_type( __DIR__ );
} );
