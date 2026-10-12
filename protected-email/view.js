( function () {
	var COPIED_MS = 1800;

	function addressFromButton( button ) {
		var user = button.getAttribute( 'data-u' );
		var domain = button.getAttribute( 'data-h' );
		if ( ! user || ! domain ) {
			return '';
		}
		return user + '@' + domain;
	}

	/**
	 * Draw the address as pixels (canvas) so it never appears as selectable HTML/SVG text.
	 * Built only in JS from data-u / data-h (same split as the mailto button).
	 */
	function buildAddressCanvas( email, color ) {
		var fontSize = 15;
		var font =
			'600 ' +
			fontSize +
			'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
		var dpr = window.devicePixelRatio || 1;

		var measure = document.createElement( 'canvas' ).getContext( '2d' );
		measure.font = font;
		var textWidth = Math.ceil( measure.measureText( email ).width );
		var width = Math.max( textWidth + 2, 1 );
		var height = Math.ceil( fontSize * 1.55 );

		var canvas = document.createElement( 'canvas' );
		canvas.width = Math.ceil( width * dpr );
		canvas.height = Math.ceil( height * dpr );
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';
		canvas.className = 'arriva-protected-email__graphic';
		canvas.setAttribute( 'aria-hidden', 'true' );
		canvas.setAttribute( 'focusable', 'false' );

		var ctx = canvas.getContext( '2d' );
		ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		ctx.font = font;
		ctx.fillStyle = color || '#1a1a1a';
		ctx.textBaseline = 'alphabetic';
		ctx.fillText( email, 0, fontSize );

		return canvas;
	}

	function setCopyLabel( button, label ) {
		button.textContent = label;
	}

	function copyAddress( email, copyBtn, labels ) {
		var done = function () {
			setCopyLabel( copyBtn, labels.copied );
			copyBtn.classList.add( 'is-copied' );
			window.setTimeout( function () {
				setCopyLabel( copyBtn, labels.copy );
				copyBtn.classList.remove( 'is-copied' );
			}, COPIED_MS );
		};

		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			navigator.clipboard.writeText( email ).then( done ).catch( function () {
				fallbackCopy( email, done );
			} );
			return;
		}

		fallbackCopy( email, done );
	}

	function fallbackCopy( email, done ) {
		var input = document.createElement( 'textarea' );
		input.value = email;
		input.setAttribute( 'readonly', '' );
		input.style.position = 'fixed';
		input.style.left = '-9999px';
		document.body.appendChild( input );
		input.select();
		try {
			document.execCommand( 'copy' );
			done();
		} catch ( e ) {
			// Ignore — user can still use mailto.
		}
		document.body.removeChild( input );
	}

	function ensureAddressRow( root, mailBtn, email ) {
		if ( root.querySelector( '.arriva-protected-email__address' ) ) {
			return;
		}

		var labels = {
			copy: mailBtn.getAttribute( 'data-copy-label' ) || 'Kopieren',
			copied: mailBtn.getAttribute( 'data-copied-label' ) || 'Kopiert',
		};

		var row = document.createElement( 'div' );
		row.className = 'arriva-protected-email__address';

		var visual = document.createElement( 'div' );
		visual.className = 'arriva-protected-email__visual';
		visual.appendChild(
			buildAddressCanvas( email, getComputedStyle( root ).color )
		);

		var copyBtn = document.createElement( 'button' );
		copyBtn.type = 'button';
		copyBtn.className = 'arriva-protected-email__copy';
		copyBtn.setAttribute( 'aria-label', 'E-Mail-Adresse kopieren' );
		setCopyLabel( copyBtn, labels.copy );
		copyBtn.addEventListener( 'click', function () {
			copyAddress( email, copyBtn, labels );
		} );

		row.appendChild( visual );
		row.appendChild( copyBtn );

		mailBtn.insertAdjacentElement( 'afterend', row );
	}

	function initButton( button ) {
		if ( button.dataset.arrivaEmailBound === '1' ) {
			return;
		}
		button.dataset.arrivaEmailBound = '1';

		var email = addressFromButton( button );
		if ( ! email ) {
			return;
		}

		var root = button.closest( '.wp-block-arriva-protected-email' );
		if ( root ) {
			ensureAddressRow( root, button, email );
		}

		button.addEventListener( 'click', function () {
			window.location.href = 'mai' + 'lto:' + email;
		} );
	}

	function init() {
		document
			.querySelectorAll( '.wp-block-arriva-protected-email .arriva-protected-email__btn' )
			.forEach( initButton );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
