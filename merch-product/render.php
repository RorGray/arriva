<?php
/**
 * Product detail page; inner blocks are the description.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner blocks HTML.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$arriva_post = isset( $block->context['postId'] ) ? get_post( (int) $block->context['postId'] ) : get_post();

if ( ! $arriva_post instanceof WP_Post || ARRIVA_MERCH_POST_TYPE !== $arriva_post->post_type ) {
	echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- rendered inner blocks.
	return;
}

echo arriva_merch_render_single( $arriva_post, $content ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
