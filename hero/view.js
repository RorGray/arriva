( function () {
	function readCachedHeight( block ) {
		var inline = block.style.getPropertyValue( '--arriva-fixed-height' );
		if ( inline ) {
			return parseFloat( inline );
		}

		var computed = getComputedStyle( block ).getPropertyValue( '--arriva-fixed-height' );
		if ( computed ) {
			return parseFloat( computed );
		}

		var minHeight = getComputedStyle( block ).getPropertyValue( '--arriva-hero-min-height' );
		if ( minHeight ) {
			return parseFloat( minHeight );
		}

		return 0;
	}

	function setFixedHeight( block ) {
		var layer = block.querySelector( '.arriva-hero__layer' );
		var spacer = block.querySelector( '.arriva-hero__spacer' );
		if ( ! layer ) {
			return;
		}

		var height = layer.offsetHeight;

		if ( ! height ) {
			height = readCachedHeight( block );
		}

		if ( ! height ) {
			return;
		}

		block.style.setProperty( '--arriva-fixed-height', height + 'px' );
		document.documentElement.style.setProperty( '--arriva-fixed-height', height + 'px' );

		if ( spacer ) {
			spacer.style.height = height + 'px';
		}
	}

	function observeSpacer( block ) {
		var spacer = block.querySelector( '.arriva-hero__spacer' );
		var layer = block.querySelector( '.arriva-hero__layer' );
		if ( ! spacer || ! layer || typeof IntersectionObserver === 'undefined' ) {
			return;
		}

		var observer = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( entry ) {
					var hidden = ! entry.isIntersecting;
					block.classList.toggle( 'is-layer-hidden', hidden );
					layer.setAttribute( 'aria-hidden', hidden ? 'true' : 'false' );
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
					if ( block.classList.contains( 'is-layer-hidden' ) ) {
						return;
					}
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
