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

$posts  = arriva_query_member_news( isset( $attributes['count'] ) ? (int) $attributes['count'] : 3 );
$cat_id = arriva_member_news_category_id();

echo '<section ' . get_block_wrapper_attributes( array( 'class' => 'arriva-dash-card arriva-dash-news' ) ) . '>';

if ( arriva_has_rich_text( $attributes['heading'] ) ) {
	echo '<h2 class="arriva-dash-card__title">' . wp_kses_post( $attributes['heading'] ) . '</h2>';
}

if ( $posts ) {
	echo '<ul class="arriva-dash-news__list" role="list">';
	foreach ( $posts as $post ) {
		$excerpt = wp_trim_words( wp_strip_all_tags( get_the_excerpt( $post ) ), 24 );
		echo '<li class="arriva-dash-news__item">';
		echo '<time class="arriva-dash-news__date" datetime="' . esc_attr( get_the_date( 'Y-m-d', $post ) ) . '">' . esc_html( get_the_date( 'j. F Y', $post ) ) . '</time>';
		echo '<a class="arriva-dash-news__title" href="' . esc_url( get_permalink( $post ) ) . '">' . esc_html( get_the_title( $post ) ) . '</a>';
		if ( '' !== $excerpt ) {
			echo '<p class="arriva-dash-news__excerpt">' . esc_html( $excerpt ) . '</p>';
		}
		echo '</li>';
	}
	echo '</ul>';
} elseif ( arriva_has_rich_text( $attributes['emptyText'] ) ) {
	echo '<p class="arriva-dash-card__empty">' . wp_kses_post( $attributes['emptyText'] ) . '</p>';
}

$links = array();
if ( $posts && $cat_id && arriva_has_rich_text( $attributes['moreLabel'] ) ) {
	$links[] = '<a class="arriva-dash-card__link" href="' . esc_url( get_category_link( $cat_id ) ) . '">' . wp_kses_post( $attributes['moreLabel'] ) . '</a>';
}
if ( $cat_id && current_user_can( 'publish_posts' ) && arriva_has_rich_text( $attributes['writeLabel'] ) ) {
	$links[] = '<a class="arriva-dash-card__link arriva-dash-card__link--muted" href="' . esc_url( add_query_arg( 'arriva_news', '1', admin_url( 'post-new.php' ) ) ) . '">' . wp_kses_post( $attributes['writeLabel'] ) . '</a>';
}
if ( $links ) {
	echo '<p class="arriva-dash-card__links">' . implode( '', $links ) . '</p>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
}

echo '</section>';
