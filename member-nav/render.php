<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

if ( ! is_user_logged_in() ) {
	return;
}

$hub = arriva_mitglieder_page_id();
$hub = $hub ? get_permalink( $hub ) : home_url( '/mitglieder/' );

$links = array(
	array(
		'label' => __( 'Übersicht', 'arriva' ),
		'url'   => $hub,
		'key'   => 'overview',
	),
	array(
		'label' => __( 'Termine', 'arriva' ),
		'url'   => home_url( '/mitglieder/termine/' ),
		'key'   => 'termine',
	),
	array(
		'label' => __( 'Vorstand', 'arriva' ),
		'url'   => home_url( '/mitglieder/vorstand/' ),
		'key'   => 'vorstand',
	),
	array(
		'label' => __( 'Dokumente', 'arriva' ),
		'url'   => home_url( '/mitglieder/dokumente/' ),
		'key'   => 'dokumente',
	),
	array(
		'label' => __( 'Merch', 'arriva' ),
		'url'   => home_url( '/mitglieder/merch/' ),
		'key'   => 'merch',
	),
);

$current_path = trim( (string) parse_url( arriva_current_request_url(), PHP_URL_PATH ), '/' );

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'arriva-member-nav',
	)
);

echo '<nav ' . $wrapper . ' aria-label="' . esc_attr__( 'Mitgliederbereich', 'arriva' ) . '">';
echo '<ul class="arriva-member-nav__list">';

foreach ( $links as $link ) {
	$link_path = trim( (string) parse_url( $link['url'], PHP_URL_PATH ), '/' );
	$active    = $link_path === $current_path;

	if ( ! $active && 'termine' === $link['key'] ) {
		$active = is_singular( ARRIVA_EVENT_POST_TYPE ) || is_post_type_archive( ARRIVA_EVENT_POST_TYPE );
	}

	$classes = 'arriva-member-nav__link';
	if ( $active ) {
		$classes .= ' is-active';
	}

	printf(
		'<li class="arriva-member-nav__item"><a class="%s" href="%s"%s>%s</a></li>',
		esc_attr( $classes ),
		esc_url( $link['url'] ),
		$active ? ' aria-current="page"' : '',
		esc_html( $link['label'] )
	);
}

echo '</ul></nav>';
