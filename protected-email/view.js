( function () {
	function initButton( button ) {
		if ( button.dataset.arrivaEmailBound === '1' ) {
			return;
		}
		button.dataset.arrivaEmailBound = '1';

		button.addEventListener( 'click', function () {
			var user = button.getAttribute( 'data-u' );
			var domain = button.getAttribute( 'data-h' );
			if ( ! user || ! domain ) {
				return;
			}
			window.location.href = 'mai' + 'lto:' + user + '@' + domain;
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
