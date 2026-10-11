( function () {
	document.querySelectorAll( '[data-arriva-calendar]' ).forEach( function ( box ) {
		var input = box.querySelector( '[data-arriva-calendar-url]' );
		var button = box.querySelector( '[data-arriva-calendar-copy]' );
		if ( ! input || ! button ) {
			return;
		}

		var label = button.textContent;
		var copied = button.getAttribute( 'data-copied-label' ) || label;

		function done() {
			button.textContent = copied;
			window.setTimeout( function () {
				button.textContent = label;
			}, 2000 );
		}

		function fallback() {
			input.select();
			try {
				document.execCommand( 'copy' );
				done();
			} catch ( e ) {}
		}

		button.addEventListener( 'click', function () {
			if ( navigator.clipboard && window.isSecureContext ) {
				navigator.clipboard.writeText( input.value ).then( done, fallback );
			} else {
				fallback();
			}
		} );

		input.addEventListener( 'focus', function () {
			input.select();
		} );
	} );
} )();
