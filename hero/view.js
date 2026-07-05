( function () {
	function setFixedHeight( block ) {
		var layer = block.querySelector( '.arriva-hero__layer' );
		var spacer = block.querySelector( '.arriva-hero__spacer' );
		if ( ! layer ) {
			return;
		}

		var height = layer.offsetHeight;
		block.style.setProperty( '--arriva-fixed-height', height + 'px' );
		document.documentElement.style.setProperty( '--arriva-fixed-height', height + 'px' );

		if ( spacer ) {
			spacer.style.height = height + 'px';
		}
	}

	function observeSpacer( block ) {
		var spacer = block.querySelector( '.arriva-hero__spacer' );
		if ( ! spacer || typeof IntersectionObserver === 'undefined' ) {
			return;
		}

		var observer = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( entry ) {
					block.classList.toggle( 'is-layer-hidden', ! entry.isIntersecting );
				} );
			},
			{ threshold: 0 }
		);

		observer.observe( spacer );
	}

	function initHero( block ) {
		if ( ! block.classList.contains( 'is-fixed-scroll' ) ) {
			return;
		}

		setFixedHeight( block );
		observeSpacer( block );

		if ( typeof ResizeObserver !== 'undefined' ) {
			var layer = block.querySelector( '.arriva-hero__layer' );
			if ( layer ) {
				var observer = new ResizeObserver( function () {
					setFixedHeight( block );
				} );
				observer.observe( layer );
			}
		}
	}

	function init() {
		document.querySelectorAll( '.wp-block-arriva-hero.is-fixed-scroll' ).forEach( initHero );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

	window.addEventListener( 'resize', function () {
		document.querySelectorAll( '.wp-block-arriva-hero.is-fixed-scroll' ).forEach( setFixedHeight );
	} );
} )();
