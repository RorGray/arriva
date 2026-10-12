<?php
/**
 * Soften Global Styles so Elements → Links do not restyle header/footer menus.
 */

defined( 'ABSPATH' ) || exit;

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

	return $theme_json->update_with(
		array(
			'version' => 3,
			'styles'  => array(
				'blocks' => array(
					'core/navigation' => array(
						'elements' => array(
							'link' => array(
								'typography' => array(
									'textDecoration' => 'none',
								),
								'color'      => array(
									'text' => 'inherit',
								),
								':hover'     => array(
									'typography' => array(
										'textDecoration' => 'none',
									),
									'color'      => array(
										'text' => 'inherit',
									),
								),
								':focus'     => array(
									'typography' => array(
										'textDecoration' => 'none',
									),
								),
							),
						),
					),
				),
			),
		)
	);
}
add_filter( 'wp_theme_json_data_theme', 'arriva_navigation_link_element_styles' );
