( function () {
	var STORAGE_KEY = 'arriva-events-view';

	function readSavedView() {
		try {
			return window.localStorage.getItem( STORAGE_KEY );
		} catch ( e ) {
			return null;
		}
	}

	function saveView( view ) {
		try {
			window.localStorage.setItem( STORAGE_KEY, view );
		} catch ( e ) {}
	}

	function initCalendar( root ) {
		var buttons = root.querySelectorAll( '.arriva-events__switch-btn' );
		var months = root.querySelectorAll( '.arriva-cal__month' );
		var prev = root.querySelector( '.arriva-cal__step[data-step="-1"]' );
		var next = root.querySelector( '.arriva-cal__step[data-step="1"]' );
		var current = root.querySelector( '.arriva-cal__current' );
		if ( ! buttons.length || ! months.length || ! prev || ! next || ! current ) {
			return;
		}

		var index = ( parseInt( root.getAttribute( 'data-initial-month' ), 10 ) || 1 ) - 1;

		function showMonth( i ) {
			index = Math.max( 0, Math.min( months.length - 1, i ) );
			months.forEach( function ( month, j ) {
				month.classList.toggle( 'is-active', j === index );
			} );
			current.textContent = months[ index ].getAttribute( 'data-label' );

			prev.disabled = index === 0;
			next.disabled = index === months.length - 1;
			prev.setAttribute( 'aria-label', index > 0 ? months[ index - 1 ].getAttribute( 'data-label' ) : '' );
			next.setAttribute(
				'aria-label',
				index < months.length - 1 ? months[ index + 1 ].getAttribute( 'data-label' ) : ''
			);
		}

		function setView( view ) {
			root.setAttribute( 'data-view', view );
			buttons.forEach( function ( button ) {
				button.setAttribute( 'aria-pressed', String( button.getAttribute( 'data-view' ) === view ) );
			} );
		}

		buttons.forEach( function ( button ) {
			button.addEventListener( 'click', function () {
				var view = button.getAttribute( 'data-view' );
				setView( view );
				saveView( view );
			} );
		} );

		prev.addEventListener( 'click', function () {
			showMonth( index - 1 );
		} );
		next.addEventListener( 'click', function () {
			showMonth( index + 1 );
		} );

		showMonth( index );
		setView( readSavedView() === 'calendar' ? 'calendar' : 'list' );
		root.classList.add( 'is-enhanced' );
	}

	function init() {
		document.querySelectorAll( '.arriva-events[data-arriva-calendar]' ).forEach( initCalendar );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
