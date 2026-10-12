<?php
/**
 * Soften Global Styles so Elements → Links do not restyle header/footer menus.
 */

defined( 'ABSPATH' ) || exit;

/**
 * Typography reset for Navigation links (undo global `elements.link`).
 *
 * @return array<string, string>
 */
function arriva_navigation_link_typography_reset() {
	return array(
		'fontFamily'     => 'inherit',
		'fontSize'       => 'inherit',
		'fontStyle'      => 'inherit',
		'fontWeight'     => 'inherit',
		'lineHeight'     => 'inherit',
		'textDecoration' => 'none',
	);
}

/**
 * Scope Navigation block links away from the global `a:where(:not(.wp-element-button))` rules.
 *
 * @param WP_Theme_JSON_Data $theme_json Theme JSON data object.
 * @return WP_Theme_JSON_Data
 */
function arriva_navigation_link_element_styles( $theme_json ) {
	if ( ! is_object( $theme_json ) || ! method_exists( $theme_json, 'update_with' ) ) {
		return $theme_json;
	}

	$link = array(
		'typography' => arriva_navigation_link_typography_reset(),
		'color'      => array(
			'text' => 'inherit',
		),
		':hover'     => array(
			'typography' => arriva_navigation_link_typography_reset(),
			'color'      => array(
				'text' => 'inherit',
			),
		),
		':focus'     => array(
			'typography' => arriva_navigation_link_typography_reset(),
			'color'      => array(
				'text' => 'inherit',
			),
		),
	);

	return $theme_json->update_with(
		array(
			'version' => 3,
			'styles'  => array(
				'blocks' => array(
					'core/navigation' => array(
						'elements' => array(
							'link' => $link,
						),
					),
				),
			),
		)
	);
}
add_filter( 'wp_theme_json_data_theme', 'arriva_navigation_link_element_styles' );
