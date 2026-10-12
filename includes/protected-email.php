<?php
/**
 * Protected email block helpers.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Drop the old “assembled on click” helper note from saved markup (Kontakt + Vorstand).
 * Keeps the <noscript> fallback.
 *
 * @param string $block_content Block HTML.
 * @return string
 */
function arriva_strip_protected_email_helper_note( $block_content ) {
	if ( ! is_string( $block_content ) || '' === $block_content ) {
		return $block_content;
	}

	// Visible helper only — leave the noscript copy intact.
	return (string) preg_replace(
		'#<p class="arriva-protected-email__note">Die Adresse wird erst beim Klick zusammengesetzt, um automatisches Auslesen zu erschweren\.</p>#u',
		'',
		$block_content
	);
}
add_filter( 'render_block_arriva/protected-email', 'arriva_strip_protected_email_helper_note' );
