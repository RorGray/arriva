<?php
/**
 * Plugin Name: Arriva
 * Description: Custom Gutenberg blocks for Arriva Speyer e.V. Currently includes the "Wave Divider" block — a wave-shaped section divider with two configurable colors (top background, bottom fill).
 * Version: 1.0.3
 * Author: Arriva Speyer e.V.
 * License: GPL-2.0-or-later
 * Text Domain: arriva
 */

defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
	register_block_type( __DIR__ );
} );
