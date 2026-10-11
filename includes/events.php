<?php
/**
 * Termine — post-like entries (not pages). Date meta + Termin-Typ taxonomy (editable in WP admin).
 */

defined( 'ABSPATH' ) || exit;

const ARRIVA_EVENT_DATE_META = 'arriva_event_date';
const ARRIVA_EVENT_TYPE_TAX  = 'arriva_event_type';

add_action( 'init', function () {
	register_post_type(
		'arriva_event',
		array(
			'labels'              => array(
				'name'               => __( 'Termine', 'arriva' ),
				'singular_name'      => __( 'Termin', 'arriva' ),
				'add_new'            => __( 'Termin hinzufügen', 'arriva' ),
				'add_new_item'       => __( 'Neuen Termin hinzufügen', 'arriva' ),
				'edit_item'          => __( 'Termin bearbeiten', 'arriva' ),
				'new_item'           => __( 'Neuer Termin', 'arriva' ),
				'view_item'          => __( 'Termin ansehen', 'arriva' ),
				'search_items'       => __( 'Termine suchen', 'arriva' ),
				'not_found'          => __( 'Keine Termine gefunden', 'arriva' ),
				'not_found_in_trash' => __( 'Keine Termine im Papierkorb', 'arriva' ),
				'menu_name'          => __( 'Termine', 'arriva' ),
			),
			'public'              => true,
			'has_archive'         => true,
			'rewrite'             => array( 'slug' => 'termine' ),
			'show_in_rest'        => true,
			'rest_base'           => 'arriva-events',
			'menu_icon'           => 'dashicons-calendar-alt',
			'supports'            => array( 'title', 'editor', 'excerpt', 'custom-fields' ),
			'capability_type'     => 'post',
			'exclude_from_search' => false,
			'taxonomies'          => array( ARRIVA_EVENT_TYPE_TAX ),
		)
	);

	register_taxonomy(
		ARRIVA_EVENT_TYPE_TAX,
		array( 'arriva_event' ),
		array(
			'labels'            => array(
				'name'          => __( 'Termin-Typen', 'arriva' ),
				'singular_name' => __( 'Termin-Typ', 'arriva' ),
				'search_items'  => __( 'Termin-Typen suchen', 'arriva' ),
				'all_items'     => __( 'Alle Termin-Typen', 'arriva' ),
				'edit_item'     => __( 'Termin-Typ bearbeiten', 'arriva' ),
				'update_item'   => __( 'Termin-Typ aktualisieren', 'arriva' ),
				'add_new_item'  => __( 'Neuen Termin-Typ hinzufügen', 'arriva' ),
				'new_item_name' => __( 'Neuer Termin-Typ', 'arriva' ),
				'menu_name'     => __( 'Termin-Typen', 'arriva' ),
			),
			'public'            => true,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'hierarchical'      => true,
			'rewrite'           => array( 'slug' => 'termin-typ' ),
		)
	);

	register_post_meta(
		'arriva_event',
		ARRIVA_EVENT_DATE_META,
		array(
			'type'              => 'string',
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'arriva_sanitize_event_date',
			'auth_callback'     => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
} );

/**
 * @param mixed $value Meta value.
 * @return string
 */
function arriva_sanitize_event_date( $value ) {
	$value = is_string( $value ) ? trim( $value ) : '';
	if ( preg_match( '/^\d{4}-\d{2}-\d{2}$/', $value ) ) {
		return $value;
	}
	return '';
}

/**
 * Query events by date meta.
 *
 * @param array<string, mixed> $args count, year, from_date, to_date, type (term slug), order.
 * @return WP_Post[]
 */
function arriva_query_events( array $args = array() ) {
	$defaults = array(
		'count'     => 10,
		'year'      => 0,
		'from_date' => '',
		'to_date'   => '',
		'type'      => '',
		'order'     => 'ASC',
	);
	$args     = wp_parse_args( $args, $defaults );

	$meta_query = array(
		'relation'    => 'AND',
		'date_clause' => array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'compare' => 'EXISTS',
			'type'    => 'DATE',
		),
	);

	if ( $args['year'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => array( $args['year'] . '-01-01', $args['year'] . '-12-31' ),
			'compare' => 'BETWEEN',
			'type'    => 'DATE',
		);
	}

	if ( $args['from_date'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => $args['from_date'],
			'compare' => '>=',
			'type'    => 'DATE',
		);
	}

	if ( $args['to_date'] ) {
		$meta_query[] = array(
			'key'     => ARRIVA_EVENT_DATE_META,
			'value'   => $args['to_date'],
			'compare' => '<=',
			'type'    => 'DATE',
		);
	}

	$tax_query = array();
	if ( $args['type'] ) {
		$tax_query[] = array(
			'taxonomy' => ARRIVA_EVENT_TYPE_TAX,
			'field'    => 'slug',
			'terms'    => sanitize_key( $args['type'] ),
		);
	}

	$query_args = array(
		'post_type'      => 'arriva_event',
		'post_status'    => 'publish',
		'posts_per_page' => (int) $args['count'] > 0 ? (int) $args['count'] : -1,
		'meta_query'     => $meta_query,
		'orderby'        => 'date_clause',
		'order'          => 'ASC' === strtoupper( (string) $args['order'] ) ? 'ASC' : 'DESC',
	);

	if ( $tax_query ) {
		$query_args['tax_query'] = $tax_query;
	}

	$query = new WP_Query( $query_args );

	return $query->posts;
}

/**
 * Primary Termin-Typ term for an event (first assigned term).
 *
 * @param WP_Post $post Event post.
 * @return WP_Term|null
 */
function arriva_get_event_type_term( WP_Post $post ) {
	$terms = get_the_terms( $post->ID, ARRIVA_EVENT_TYPE_TAX );
	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return null;
	}
	return $terms[0];
}

/**
 * @param WP_Post $post Event post.
 * @return string
 */
function arriva_format_event_date( WP_Post $post ) {
	$iso = get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
	if ( ! $iso ) {
		return '';
	}
	$ts = strtotime( $iso . ' 12:00:00' );
	if ( ! $ts ) {
		return esc_html( $iso );
	}
	return wp_date( 'j. F Y', $ts );
}

/**
 * @param WP_Post $post Event post.
 * @return string
 */
function arriva_event_type_label( WP_Post $post ) {
	$term = arriva_get_event_type_term( $post );
	return $term ? $term->name : '';
}

/**
 * Group event posts by Termin-Typ term (term order: name ASC). Posts without a type go last.
 *
 * @param WP_Post[] $posts Event posts.
 * @return array<int, array{term: WP_Term|null, posts: WP_Post[]}>
 */
function arriva_group_events_by_type( array $posts ) {
	$groups   = array();
	$ungrouped = array();

	foreach ( $posts as $post ) {
		$term = arriva_get_event_type_term( $post );
		if ( ! $term ) {
			$ungrouped[] = $post;
			continue;
		}
		if ( ! isset( $groups[ $term->term_id ] ) ) {
			$groups[ $term->term_id ] = array(
				'term'  => $term,
				'posts' => array(),
			);
		}
		$groups[ $term->term_id ]['posts'][] = $post;
	}

	uasort(
		$groups,
		function ( $a, $b ) {
			return strcasecmp( $a['term']->name, $b['term']->name );
		}
	);

	if ( $ungrouped ) {
		$groups[] = array(
			'term'  => null,
			'posts' => $ungrouped,
		);
	}

	return $groups;
}
