<?php
/**
 * Server render for wave-divider (supports self-closing block comments in page content).
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

require_once dirname( __DIR__ ) . '/includes/wave-divider.php';

echo arriva_render_wave_divider( $attributes );
