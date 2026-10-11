<?php
/**
 * Member-only visibility: Termine CPT + Mitglieder subpages (server-side, not block-only).
 */

defined( 'ABSPATH' ) || exit;

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
function arriva_wpmem_block_events( $block, $post_id ) {
	$post = get_post( $post_id );
	if ( $post && ARRIVA_EVENT_POST_TYPE === $post->post_type ) {
		return true;
	}

	return $block;
}
add_filter( 'wpmem_block', 'arriva_wpmem_block_events', 10, 2 );

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
	if ( preg_match( '#^/wp/v2/(arriva-events|arriva_event_type)(/|$)#', $route ) ) {
		return new WP_Error(
			'rest_forbidden',
			__( 'Termine sind nur für angemeldete Mitglieder verfügbar.', 'arriva' ),
			array( 'status' => 401 )
		);
	}

	return $result;
}
add_filter( 'rest_pre_dispatch', 'arriva_restrict_events_rest_dispatch', 10, 3 );

/**
 * Show member sub-nav on single Termin views (theme has no CPT template).
 *
 * @param string $content Post content.
 * @return string
 */
function arriva_prepend_member_nav_on_event_singular( $content ) {
	if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || is_admin() ) {
		return $content;
	}

	if ( ! is_singular( ARRIVA_EVENT_POST_TYPE ) || ! is_user_logged_in() ) {
		return $content;
	}

	if ( ! in_the_loop() || ! is_main_query() ) {
		return $content;
	}

	static $done = false;
	if ( $done ) {
		return $content;
	}
	$done = true;

	return do_blocks( '<!-- wp:arriva/member-nav /-->' ) . $content;
}
add_filter( 'the_content', 'arriva_prepend_member_nav_on_event_singular', 8 );
