( function () {
	var gallery = document.querySelector( '.arriva-merch-single__gallery[data-arriva-merch-gallery]' );
	if ( ! gallery ) {
		return;
	}

	var mainImg = gallery.querySelector( '.arriva-merch-single__image' );
	var mainLink = gallery.querySelector( '.arriva-merch-single__zoom' );
	var dialog = document.querySelector( '#arriva-merch-lightbox' );
	var dialogImg = dialog ? dialog.querySelector( '.arriva-merch-lightbox__img' ) : null;
	var closeBtn = dialog ? dialog.querySelector( '.arriva-merch-lightbox__close' ) : null;
	var thumbs = gallery.querySelectorAll( '.arriva-merch-single__thumb' );

	function setMain( btn ) {
		if ( ! mainImg || ! btn ) {
			return;
		}
		var full = btn.getAttribute( 'data-full' ) || '';
		var src = btn.getAttribute( 'data-src' ) || full;
		var alt = btn.getAttribute( 'data-alt' ) || '';
		var srcset = btn.getAttribute( 'data-srcset' ) || '';
		// srcset wins over src, so it must be swapped (or dropped) too.
		if ( srcset ) {
			mainImg.srcset = srcset;
		} else {
			mainImg.removeAttribute( 'srcset' );
			mainImg.removeAttribute( 'sizes' );
		}
		mainImg.src = src;
		mainImg.alt = alt;
		if ( mainLink ) {
			mainLink.setAttribute( 'data-full', full || src );
		}
		thumbs.forEach( function ( t ) {
			t.classList.toggle( 'is-active', t === btn );
			t.setAttribute( 'aria-current', t === btn ? 'true' : 'false' );
		} );
	}

	thumbs.forEach( function ( btn ) {
		btn.addEventListener( 'click', function () {
			setMain( btn );
		} );
	} );

	var scrollLockClass = 'arriva-merch-lightbox-open';

	function lockPageScroll() {
		document.documentElement.classList.add( scrollLockClass );
	}

	function unlockPageScroll() {
		document.documentElement.classList.remove( scrollLockClass );
	}

	function openLightbox() {
		if ( ! dialog || ! dialogImg || ! mainImg ) {
			return;
		}
		var full =
			( mainLink && mainLink.getAttribute( 'data-full' ) ) ||
			mainImg.currentSrc ||
			mainImg.src;
		dialogImg.src = full;
		dialogImg.alt = mainImg.alt;
		if ( typeof dialog.showModal === 'function' ) {
			dialog.showModal();
			lockPageScroll();
		}
	}

	function closeLightbox() {
		if ( dialog && dialog.open ) {
			dialog.close();
		}
	}

	if ( mainLink ) {
		mainLink.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			openLightbox();
		} );
	}

	if ( closeBtn ) {
		closeBtn.addEventListener( 'click', closeLightbox );
	}

	if ( dialog ) {
		dialog.addEventListener( 'click', function ( e ) {
			if ( e.target === dialog ) {
				closeLightbox();
			}
		} );
		dialog.addEventListener( 'close', function () {
			unlockPageScroll();
			if ( dialogImg ) {
				dialogImg.removeAttribute( 'src' );
			}
		} );
	}
} )();
