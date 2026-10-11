<?php
/**
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$count       = isset( $attributes['count'] ) ? (int) $attributes['count'] : 8;
$eyebrow     = isset( $attributes['eyebrow'] ) ? (string) $attributes['eyebrow'] : '';
$heading     = isset( $attributes['heading'] ) ? (string) $attributes['heading'] : '';
$subtitle    = isset( $attributes['subtitle'] ) ? (string) $attributes['subtitle'] : '';
$empty_text  = isset( $attributes['emptyText'] ) ? (string) $attributes['emptyText'] : '';
$more_label  = isset( $attributes['moreLabel'] ) ? (string) $attributes['moreLabel'] : '';
$more_url    = isset( $attributes['moreUrl'] ) ? trim( (string) $attributes['moreUrl'] ) : '';
$login_text  = isset( $attributes['loginText'] ) ? (string) $attributes['loginText'] : '';
$login_label = isset( $attributes['loginLabel'] ) ? (string) $attributes['loginLabel'] : '';

$is_member = is_user_logged_in();
$today     = wp_date( 'Y-m-d' );

$query = array(
	'count'     => $count,
	'from_date' => $today,
	'order'     => 'ASC',
);

// Termine are member-only; guests only see events of a public Termin-Typ.
if ( ! $is_member ) {
	$query['type'] = arriva_public_event_type_slugs();
}

$posts = arriva_query_events( $query );

$wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'arriva-events alignfull' . ( $is_member ? '' : ' is-guest' ),
	)
);

echo '<section ' . $wrapper . '>';
echo '<div class="arriva-events__inner">';

if ( arriva_has_rich_text( $eyebrow ) ) {
	echo '<p class="arriva-events__eyebrow">' . wp_kses_post( $eyebrow ) . '</p>';
}

if ( arriva_has_rich_text( $heading ) ) {
	echo '<h2 class="arriva-events__heading">' . wp_kses_post( $heading ) . '</h2>';
}

if ( ! $is_member && empty( $posts ) ) {
	if ( arriva_has_rich_text( $login_text ) ) {
		echo '<p class="arriva-events__intro">' . wp_kses_post( $login_text ) . '</p>';
	}
} else {
	if ( arriva_has_rich_text( $subtitle ) ) {
		echo '<p class="arriva-events__intro">' . wp_kses_post( $subtitle ) . '</p>';
	}

	if ( empty( $posts ) ) {
		if ( arriva_has_rich_text( $empty_text ) ) {
			echo '<p class="arriva-events__empty">' . wp_kses_post( $empty_text ) . '</p>';
		}
	} else {
		echo '<ul class="arriva-events__list">';
		foreach ( $posts as $post ) {
			arriva_render_event_card(
				$post,
				array(
					'today' => $today,
					'link'  => $is_member,
				)
			);
		}
		echo '</ul>';
	}
}

if ( $is_member ) {
	if ( arriva_has_rich_text( $more_label ) && '' !== $more_url ) {
		echo '<a class="arriva-events__more" href="' . esc_url( $more_url ) . '">' . wp_kses_post( $more_label ) . '</a>';
	}
} elseif ( arriva_has_rich_text( $login_label ) ) {
	echo '<a class="arriva-events__more" href="' . esc_url( home_url( '/mitglieder/' ) ) . '">' . wp_kses_post( $login_label ) . '</a>';
}

echo '</div>';
echo '</section>';
