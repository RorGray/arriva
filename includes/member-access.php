<?php
/**
 * Member-only visibility: Termine CPT + Mitglieder subpages (server-side, not block-only).
 */

defined( 'ABSPATH' ) || exit;

/** Main column width for Mitgliederbereich (matches theme wide size). */
const ARRIVA_MEMBER_CONTENT_SIZE = '1100px';

/**
 * @return bool Front-end Mitglieder hub, subpages, or Termine views.
 */
function arriva_is_mitglied_area_view() {
	if ( is_page( 'mitglieder' ) || arriva_is_mitglied_subpage() ) {
		return true;
	}

	if ( is_singular( ARRIVA_EVENT_POST_TYPE ) || is_post_type_archive( ARRIVA_EVENT_POST_TYPE ) ) {
		return true;
	}

	if ( is_singular( ARRIVA_MERCH_POST_TYPE ) ) {
		return true;
	}

	return false;
}

/**
 * @return int Mitglieder hub page ID (0 if missing).
 */
function arriva_mitglieder_page_id() {
	static $id = null;

	if ( null !== $id ) {
		return $id;
	}

	$page = get_page_by_path( 'mitglieder' );
	$id   = $page ? (int) $page->ID : 0;

	return $id;
}

/**
 * @param int|null $post_id Page ID.
 * @return bool Mitglieder hub or any child/descendant page.
 */
function arriva_is_mitglied_hub_or_subpage( $post_id = null ) {
	$post_id = $post_id ?? get_queried_object_id();
	$hub     = arriva_mitglieder_page_id();

	if ( ! $hub || ! $post_id ) {
		return false;
	}

	if ( (int) $post_id === $hub ) {
		return true;
	}

	return arriva_is_mitglied_subpage( $post_id );
}

/**
 * @param int|null $post_id Page ID.
 * @return bool True when page is a child/descendant of Mitglieder (not the hub itself).
 */
function arriva_is_mitglied_subpage( $post_id = null ) {
	$post_id = $post_id ?? get_queried_object_id();
	$hub     = arriva_mitglieder_page_id();

	if ( ! $hub || ! $post_id ) {
		return false;
	}

	if ( (int) $post_id === $hub ) {
		return false;
	}

	$post = get_post( $post_id );
	if ( ! $post || 'page' !== $post->post_type ) {
		return false;
	}

	$ancestors = get_post_ancestors( $post_id );

	return in_array( $hub, $ancestors, true ) || (int) $post->post_parent === $hub;
}

/**
 * @return bool Whether the current front-end request is member-only content.
 */
function arriva_is_member_only_request() {
	if ( is_singular( ARRIVA_EVENT_POST_TYPE ) ) {
		return true;
	}

	if ( is_post_type_archive( ARRIVA_EVENT_POST_TYPE ) ) {
		return true;
	}

	if ( is_tax( ARRIVA_EVENT_TYPE_TAX ) ) {
		return true;
	}

	if ( is_singular( ARRIVA_MERCH_POST_TYPE ) ) {
		return true;
	}

	if ( is_page() && arriva_is_mitglied_subpage() ) {
		return true;
	}

	return false;
}

/**
 * @return string Current request URL path for redirects.
 */
function arriva_current_request_url() {
	if ( empty( $_SERVER['HTTP_HOST'] ) ) {
		return home_url( '/' );
	}

	$scheme = is_ssl() ? 'https' : 'http';
	$uri    = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : '/';

	return $scheme . '://' . wp_unslash( $_SERVER['HTTP_HOST'] ) . $uri;
}

/**
 * Redirect guests away from member-only URLs (Termine + Mitglieder subpages).
 */
function arriva_redirect_guests_from_member_content() {
	if ( is_user_logged_in() || is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
		return;
	}

	if ( ! arriva_is_member_only_request() ) {
		return;
	}

	$login = home_url( '/mitglieder/' );
	$login = add_query_arg( 'redirect_to', rawurlencode( arriva_current_request_url() ), $login );

	wp_safe_redirect( $login, 302 );
	exit;
}
add_action( 'template_redirect', 'arriva_redirect_guests_from_member_content', 5 );

/**
 * WP-Members: treat every Termin as blocked (login form on singular if redirect disabled).
 *
 * @param bool $block  Whether the post is blocked.
 * @param int  $post_id Post ID.
 * @return bool
 */
function arriva_wpmem_block_member_cpts( $block, $post_id ) {
	$post = get_post( $post_id );
	if ( ! $post ) {
		return $block;
	}

	if ( in_array( $post->post_type, array( ARRIVA_EVENT_POST_TYPE, ARRIVA_MERCH_POST_TYPE ), true ) ) {
		return true;
	}

	return $block;
}
add_filter( 'wpmem_block', 'arriva_wpmem_block_member_cpts', 10, 2 );

/**
 * Hide Termine from public search results.
 *
 * @param WP_Query $query Main query.
 */
function arriva_hide_events_from_public_search( $query ) {
	if ( is_admin() || ! $query->is_main_query() || is_user_logged_in() ) {
		return;
	}

	if ( $query->is_search() ) {
		$post_types = $query->get( 'post_type' );
		if ( empty( $post_types ) || 'any' === $post_types ) {
			$query->set( 'post_type', array( 'post', 'page' ) );
		} elseif ( is_array( $post_types ) ) {
			$query->set(
				'post_type',
				array_values(
					array_diff( $post_types, array( ARRIVA_EVENT_POST_TYPE, ARRIVA_MERCH_POST_TYPE ) )
				)
			);
		}
	}
}
add_action( 'pre_get_posts', 'arriva_hide_events_from_public_search' );

/**
 * REST: Termine only for logged-in users.
 *
 * Do not mutate rest_endpoints (foreach-by-reference bugs broke the whole REST API in 1.7.0).
 *
 * @param mixed           $result  Response to replace the requested version with.
 * @param WP_REST_Server  $server  Server instance.
 * @param WP_REST_Request $request Request used to generate the response.
 * @return mixed
 */
function arriva_restrict_events_rest_dispatch( $result, $server, $request ) {
	if ( is_user_logged_in() ) {
		return $result;
	}

	if ( ! $request instanceof WP_REST_Request ) {
		return $result;
	}

	$route = $request->get_route();
	if ( preg_match( '#^/wp/v2/(arriva-events|arriva_event_type|arriva-merch)(/|$)#', $route ) ) {
		return new WP_Error(
			'rest_forbidden',
			__( 'Nur für angemeldete Mitglieder verfügbar.', 'arriva' ),
			array( 'status' => 401 )
		);
	}

	return $result;
}
add_filter( 'rest_pre_dispatch', 'arriva_restrict_events_rest_dispatch', 10, 3 );

/**
 * Markup: full-width member sub-nav (Termin templates — outside post content).
 *
 * @return string
 */
function arriva_member_nav_bar_markup() {
	return do_blocks(
		'<!-- wp:group {"align":"full","className":"arriva-member-nav-bar","layout":{"type":"constrained","contentSize":"' . ARRIVA_MEMBER_CONTENT_SIZE . '"}} -->
<!-- wp:arriva/member-nav /-->
<!-- /wp:group -->'
	);
}

/**
 * Inject member nav above the title on Termin singles/archives (not inside post content).
 *
 * @param string   $block_content Block HTML.
 * @param array    $block         Block data.
 * @param WP_Block $instance      Block instance.
 * @return string
 */
function arriva_inject_member_nav_before_termine_title( $block_content, $block, $instance ) {
	if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin() ) {
		return $block_content;
	}

	if ( ! is_user_logged_in() ) {
		return $block_content;
	}

	$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
	$inject     = false;

	if ( 'core/post-title' === $block_name && is_singular( ARRIVA_EVENT_POST_TYPE ) ) {
		$inject = true;
	}

	if ( 'core/query-title' === $block_name && is_post_type_archive( ARRIVA_EVENT_POST_TYPE ) ) {
		$inject = true;
	}

	if ( ! $inject ) {
		return $block_content;
	}

	static $done = false;
	if ( $done || ! empty( $GLOBALS['arriva_member_nav_rendered'] ) ) {
		return $block_content;
	}
	$done = true;

	return arriva_member_nav_bar_markup() . $block_content;
}
add_filter( 'render_block', 'arriva_inject_member_nav_before_termine_title', 10, 3 );

/**
 * Product singles: title and date are rendered in the PDP (plugin), not the theme template.
 *
 * @param string   $block_content Block HTML.
 * @param array    $block         Block data.
 * @param WP_Block $instance      Block instance.
 * @return string
 */
function arriva_hide_merch_template_blocks( $block_content, $block, $instance ) {
	if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin() ) {
		return $block_content;
	}

	if ( ! is_singular( ARRIVA_MERCH_POST_TYPE ) ) {
		return $block_content;
	}

	$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';
	$hide       = array(
		'core/post-date',
		'core/post-title',
		'core/post-excerpt',
		'core/post-featured-image',
		'core/post-terms',
		'core/separator',
		'core/spacer',
		'core/comments',
		'core/post-navigation',
	);

	if ( in_array( $block_name, $hide, true ) ) {
		return '';
	}

	if ( 'core/template-part' === $block_name && isset( $block['attrs']['slug'] ) && 'post-meta' === $block['attrs']['slug'] ) {
		return '';
	}

	// Theme wrapper groups left empty after the removals above still add padding/margins.
	if ( 'core/group' === $block_name
		&& '' === trim( wp_strip_all_tags( $block_content ) )
		&& ! preg_match( '/<(img|svg|iframe|form|input|video)\b/i', $block_content ) ) {
		return '';
	}

	return $block_content;
}
add_filter( 'render_block', 'arriva_hide_merch_template_blocks', 10, 3 );

/**
 * Body class for member-area layout CSS.
 *
 * @param string[] $classes Body classes.
 * @return string[]
 */
function arriva_mitglied_area_body_class( $classes ) {
	if ( arriva_is_mitglied_area_view() ) {
		$classes[] = 'arriva-mitglied-area';
	}

	if ( is_singular( 'page' ) && arriva_page_has_block( 'arriva/page-header' ) ) {
		$classes[] = 'arriva-has-page-header';
	}

	return $classes;
}
add_filter( 'body_class', 'arriva_mitglied_area_body_class' );

/**
 * @param int|null $post_id Post ID.
 * @param string   $block   Block name (e.g. arriva/page-header).
 * @return bool
 */
function arriva_page_has_block( $block, $post_id = null ) {
	$post_id = $post_id ?? get_queried_object_id();
	if ( ! $post_id ) {
		return false;
	}

	$content = get_post_field( 'post_content', $post_id );
	if ( ! is_string( $content ) || '' === $content ) {
		return false;
	}

	return false !== strpos( $content, 'wp:' . $block );
}

/**
 * Editor body classes for Mitglieder page editing.
 *
 * @param string $classes Space-separated admin body classes.
 * @return string
 */
function arriva_member_editor_admin_body_class( $classes ) {
	$post_id = get_the_ID();
	if ( ! $post_id || 'page' !== get_post_type( $post_id ) ) {
		return $classes;
	}

	if ( ! arriva_is_mitglied_hub_or_subpage( $post_id ) ) {
		return $classes;
	}

	$classes .= ' arriva-member-editor';

	if ( arriva_page_has_block( 'arriva/page-header', $post_id ) ) {
		$classes .= ' arriva-member-editor-has-page-header';
	}

	return $classes;
}
add_filter( 'admin_body_class', 'arriva_member_editor_admin_body_class' );
