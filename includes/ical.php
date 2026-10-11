<?php
/**
 * Private iCal feed of Termine. Each member gets a personal token URL, since
 * calendar apps can't log in and Termine are member-only.
 */

defined( 'ABSPATH' ) || exit;

const ARRIVA_ICAL_QUERY_VAR  = 'arriva-ical';
const ARRIVA_ICAL_TOKEN_META = 'arriva_ical_token';

/**
 * @param int $user_id User ID.
 * @return string
 */
function arriva_ical_token_for_user( $user_id ) {
	$token = (string) get_user_meta( $user_id, ARRIVA_ICAL_TOKEN_META, true );
	if ( '' === $token ) {
		$token = wp_generate_password( 32, false, false );
		update_user_meta( $user_id, ARRIVA_ICAL_TOKEN_META, $token );
	}
	return $token;
}

/**
 * Subscription URL for the current user (webcal:// opens the calendar app directly).
 *
 * @return string Empty for guests.
 */
function arriva_ical_subscribe_url() {
	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return '';
	}

	$url = add_query_arg( ARRIVA_ICAL_QUERY_VAR, arriva_ical_token_for_user( $user_id ), home_url( '/' ) );
	return (string) preg_replace( '#^https?://#', 'webcal://', $url );
}

/**
 * RFC 5545 text escaping.
 *
 * @param string $text Plain text.
 * @return string
 */
function arriva_ical_escape( $text ) {
	$text = wp_strip_all_tags( html_entity_decode( (string) $text, ENT_QUOTES, 'UTF-8' ) );
	$text = str_replace( array( '\\', ';', ',' ), array( '\\\\', '\\;', '\\,' ), $text );
	return str_replace( array( "\r\n", "\n", "\r" ), '\\n', $text );
}

/**
 * Fold a content line to 75 octets without splitting UTF-8 characters.
 *
 * @param string $line Content line.
 * @return string
 */
function arriva_ical_fold( $line ) {
	$out   = '';
	$chunk = '';
	foreach ( preg_split( '//u', $line, -1, PREG_SPLIT_NO_EMPTY ) as $char ) {
		if ( strlen( $chunk . $char ) > 75 ) {
			$out  .= $chunk . "\r\n ";
			$chunk = '';
		}
		$chunk .= $char;
	}
	return $out . $chunk . "\r\n";
}

function arriva_ical_maybe_serve_feed() {
	if ( empty( $_GET[ ARRIVA_ICAL_QUERY_VAR ] ) ) {
		return;
	}

	$token = preg_replace( '/[^A-Za-z0-9]/', '', (string) wp_unslash( $_GET[ ARRIVA_ICAL_QUERY_VAR ] ) );
	$users = strlen( $token ) >= 20
		? get_users(
			array(
				'meta_key'   => ARRIVA_ICAL_TOKEN_META,
				'meta_value' => $token,
				'number'     => 1,
				'fields'     => 'ID',
			)
		)
		: array();

	if ( empty( $users ) ) {
		status_header( 403 );
		exit;
	}

	$posts = arriva_query_events(
		array(
			'count'     => -1,
			'from_date' => wp_date( 'Y-m-d', strtotime( '-1 year' ) ),
			'order'     => 'ASC',
		)
	);

	$host  = (string) wp_parse_url( home_url(), PHP_URL_HOST );
	$lines = array(
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//' . $host . '//Arriva Termine//DE',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'X-WR-CALNAME:' . arriva_ical_escape( get_bloginfo( 'name' ) ),
		'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
	);

	foreach ( $posts as $post ) {
		$iso = (string) get_post_meta( $post->ID, ARRIVA_EVENT_DATE_META, true );
		$ts  = $iso ? strtotime( $iso . ' 12:00:00 UTC' ) : false;
		if ( ! $ts ) {
			continue;
		}

		$detail = trim( (string) get_post_field( 'post_excerpt', $post ) );
		$type   = arriva_event_type_label( $post );

		$lines[] = 'BEGIN:VEVENT';
		$lines[] = 'UID:arriva-event-' . $post->ID . '@' . $host;
		$lines[] = 'DTSTAMP:' . gmdate( 'Ymd\THis\Z', strtotime( $post->post_modified_gmt . ' UTC' ) );
		$lines[] = 'DTSTART;VALUE=DATE:' . gmdate( 'Ymd', $ts );
		$lines[] = 'DTEND;VALUE=DATE:' . gmdate( 'Ymd', $ts + DAY_IN_SECONDS );
		$lines[] = 'SUMMARY:' . arriva_ical_escape( get_the_title( $post ) );
		if ( '' !== $detail ) {
			$lines[] = 'DESCRIPTION:' . arriva_ical_escape( $detail );
		}
		if ( '' !== $type ) {
			$lines[] = 'CATEGORIES:' . arriva_ical_escape( $type );
		}
		$lines[] = 'URL:' . esc_url_raw( get_permalink( $post ) );
		$lines[] = 'END:VEVENT';
	}

	$lines[] = 'END:VCALENDAR';

	nocache_headers();
	header( 'Content-Type: text/calendar; charset=utf-8' );
	header( 'Content-Disposition: inline; filename="termine.ics"' );
	header( 'X-Robots-Tag: noindex' );

	foreach ( $lines as $line ) {
		echo arriva_ical_fold( $line ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- iCal text, escaped above.
	}
	exit;
}
add_action( 'init', 'arriva_ical_maybe_serve_feed', 20 );
