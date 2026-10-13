( function () {
	var COPIED_MS = 1800;
	var MIN_FONT = 12;
	var MAX_FONT = 15;

	function addressFromButton( button ) {
		var user = button.getAttribute( 'data-u' );
		var domain = button.getAttribute( 'data-h' );
		if ( ! user || ! domain ) {
			return '';
		}
		return user + '@' + domain;
	}

	function measureTextWidth( email, fontSize ) {
		var ctx = document.createElement( 'canvas' ).getContext( '2d' );
		ctx.font =
			'600 ' +
			fontSize +
			'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
		return ctx.measureText( email ).width;
	}

	function fontSizeForWidth( email, maxWidth ) {
		var size = MAX_FONT;
		while ( size > MIN_FONT && measureTextWidth( email, size ) > maxWidth ) {
			size -= 0.5;
		}
		return size;
	}

	/**
	 * Draw the address as pixels (canvas) so it never appears as selectable HTML text.
	 */
	function paintAddressCanvas( canvas, email, color, maxWidth ) {
		var fontSize = fontSizeForWidth( email, Math.max( maxWidth - 2, 40 ) );
		var font =
			'600 ' +
			fontSize +
			'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
		var dpr = window.devicePixelRatio || 1;
		var textWidth = measureTextWidth( email, fontSize );
		var width = Math.max( Math.ceil( textWidth + 2 ), 1 );
		var height = Math.ceil( fontSize * 1.45 );

		canvas.width = Math.ceil( width * dpr );
		canvas.height = Math.ceil( height * dpr );
		canvas.style.width = width + 'px';
		canvas.style.height = height + 'px';

		var ctx = canvas.getContext( '2d' );
		ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		ctx.clearRect( 0, 0, width, height );
		ctx.font = font;
		// Canvas cannot use CSS variables — resolve the theme contrast preset when needed.
		if ( ! color ) {
			var probe = document.createElement( 'span' );
			probe.style.color = 'var(--wp--preset--color--contrast)';
			document.body.appendChild( probe );
			color = getComputedStyle( probe ).color;
			document.body.removeChild( probe );
		}
		ctx.fillStyle = color;
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

	function redraw( visual, canvas, email, color ) {
		var maxWidth = visual.clientWidth || 200;
		paintAddressCanvas( canvas, email, color, maxWidth );
	}

	function ensureAddressRow( root, mailBtn, email ) {
		if ( root.querySelector( '.arriva-protected-email__address' ) ) {
			return;
		}

		// Disclaimer was for the old “assemble on click” UX — drop it once JS is active.
		root.querySelectorAll( '.arriva-protected-email__note' ).forEach( function ( note ) {
			note.remove();
		} );

		var labels = {
			copy: mailBtn.getAttribute( 'data-copy-label' ) || 'Kopieren',
			copied: mailBtn.getAttribute( 'data-copied-label' ) || 'Kopiert',
		};
		var color = getComputedStyle( root ).color;

		var row = document.createElement( 'div' );
		row.className = 'arriva-protected-email__address';

		var visual = document.createElement( 'div' );
		visual.className = 'arriva-protected-email__visual';

		var canvas = document.createElement( 'canvas' );
		canvas.className = 'arriva-protected-email__graphic';
		canvas.setAttribute( 'aria-hidden', 'true' );
		canvas.setAttribute( 'focusable', 'false' );
		visual.appendChild( canvas );

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

		var paint = function () {
			redraw( visual, canvas, email, color );
		};

		// Layout must settle before measuring available width.
		requestAnimationFrame( function () {
			paint();
			if ( typeof ResizeObserver !== 'undefined' ) {
				var ro = new ResizeObserver( paint );
				ro.observe( visual );
			}
		} );
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
