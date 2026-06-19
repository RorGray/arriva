( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useEffect = wp.element.useEffect;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useMultipleOriginColorsAndGradients = wp.blockEditor.__experimentalUseMultipleOriginColorsAndGradients;
	var PanelBody = wp.components.PanelBody;
	var BaseControl = wp.components.BaseControl;
	var Button = wp.components.Button;
	var ColorPalette = wp.components.ColorPalette;
	var useSelect = wp.data.useSelect;
	var __ = wp.i18n.__;

	var TOP_FALLBACK = '#18222a';
	var BOTTOM_FALLBACK = '#ffffff';

	var WAVES = {
		wave: {
			label: __( 'Wave', 'arriva' ),
			height: 56,
			path: 'M0 28C180 56 360 0 540 28C720 56 900 0 1080 28C1260 56 1440 0 1440 28L1440 56L0 56Z',
		},
		'wave-flip': {
			label: __( 'Wave (flipped)', 'arriva' ),
			height: 56,
			path: 'M0 28C180 0 360 56 540 28C720 0 900 56 1080 28C1260 0 1440 56 1440 28L1440 56L0 56Z',
		},
		curve: {
			label: __( 'Curve', 'arriva' ),
			height: 48,
			path: 'M0 24C240 48 480 0 720 24C960 48 1200 0 1440 24L1440 48L0 48Z',
		},
		'curve-flip': {
			label: __( 'Curve (flipped)', 'arriva' ),
			height: 48,
			path: 'M0 24C240 0 480 48 720 24C960 0 1200 48 1440 24L1440 48L0 48Z',
		},
		ripple: {
			label: __( 'Ripple', 'arriva' ),
			height: 48,
			path: 'M0 24C180 0 360 48 540 24C720 0 900 48 1080 24C1260 0 1440 48 1440 24L1440 48L0 48Z',
		},
		'ripple-flip': {
			label: __( 'Ripple (flipped)', 'arriva' ),
			height: 48,
			path: 'M0 24C180 48 360 0 540 24C720 48 900 0 1080 24C1260 48 1440 0 1440 24L1440 48L0 48Z',
		},
	};

	var SHAPE_KEYS = Object.keys( WAVES );

	function randomShape() {
		return SHAPE_KEYS[ Math.floor( Math.random() * SHAPE_KEYS.length ) ];
	}

	function waveSvg( shape, bottomColor ) {
		var wave = WAVES[ shape ] || WAVES.wave;
		return el(
			'svg',
			{ viewBox: '0 0 1440 ' + wave.height, preserveAspectRatio: 'none', height: wave.height },
			el( 'path', { d: wave.path, fill: bottomColor || BOTTOM_FALLBACK } )
		);
	}

	/**
	 * Reads a color from a sibling block, but only if that block uses
	 * WordPress's native color block-support (custom color or a palette slug).
	 * Arbitrary CSS backgrounds (theme classes, gradients, images) aren't
	 * visible to the block editor's data store, so those can't be detected.
	 */
	function detectBlockBackground( block, flatColors ) {
		if ( ! block ) {
			return null;
		}
		var attrs = block.attributes || {};
		if ( attrs.style && attrs.style.color && attrs.style.color.background ) {
			return attrs.style.color.background;
		}
		var slug = attrs.backgroundColor || attrs.overlayColor;
		if ( slug ) {
			var match = flatColors.filter( function ( c ) {
				return c.slug === slug;
			} )[ 0 ];
			if ( match ) {
				return match.color;
			}
		}
		return null;
	}

	registerBlockType( 'arriva/wave-divider', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var clientId = props.clientId;
			var shape = attributes.shape;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps( { style: { background: topColor || TOP_FALLBACK } } );

			var colorGroups = useSelect( function ( select ) {
				if ( useMultipleOriginColorsAndGradients ) {
					return null;
				}
				return select( 'core/block-editor' ).getSettings().colors || [];
			}, [] );
			var multiOrigin = useMultipleOriginColorsAndGradients ? useMultipleOriginColorsAndGradients() : null;
			var paletteGroups = multiOrigin ? multiOrigin.colors : colorGroups;
			var flatColors = [];
			( paletteGroups || [] ).forEach( function ( entry ) {
				if ( entry.colors ) {
					flatColors = flatColors.concat( entry.colors );
				} else {
					flatColors.push( entry );
				}
			} );

			var siblings = useSelect( function ( select ) {
				var editor = select( 'core/block-editor' );
				var rootClientId = editor.getBlockRootClientId( clientId );
				var order = editor.getBlockOrder( rootClientId );
				var index = order.indexOf( clientId );
				return {
					prev: index > 0 ? editor.getBlock( order[ index - 1 ] ) : null,
					next: index < order.length - 1 ? editor.getBlock( order[ index + 1 ] ) : null,
				};
			}, [ clientId ] );

			useEffect( function () {
				if ( ! shape ) {
					setAttributes( { shape: randomShape() } );
				}
				if ( ! topColor ) {
					setAttributes( { topColor: detectBlockBackground( siblings.prev, flatColors ) || TOP_FALLBACK } );
				}
				if ( ! bottomColor ) {
					setAttributes( { bottomColor: detectBlockBackground( siblings.next, flatColors ) || BOTTOM_FALLBACK } );
				}
			}, [] );

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Wave Settings', 'arriva' ), initialOpen: true },
						el(
							BaseControl,
							{ label: __( 'Shape', 'arriva' ) },
							el(
								Button,
								{
									variant: 'secondary',
									onClick: function () {
										setAttributes( { shape: randomShape() } );
									},
								},
								__( 'Randomize shape', 'arriva' )
							)
						),
						el(
							BaseControl,
							{ label: __( 'Top background (matches section above)', 'arriva' ) },
							el( ColorPalette, {
								colors: paletteGroups,
								value: topColor,
								onChange: function ( color ) {
									setAttributes( { topColor: color || TOP_FALLBACK } );
								},
							} )
						),
						el(
							BaseControl,
							{ label: __( 'Bottom fill (matches section below)', 'arriva' ) },
							el( ColorPalette, {
								colors: paletteGroups,
								value: bottomColor,
								onChange: function ( color ) {
									setAttributes( { bottomColor: color || BOTTOM_FALLBACK } );
								},
							} )
						)
					)
				),
				el( 'div', blockProps, waveSvg( shape, bottomColor ) )
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var shape = attributes.shape;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps.save( { style: { background: topColor || TOP_FALLBACK } } );

			return el( 'div', blockProps, waveSvg( shape, bottomColor ) );
		},
	} );
} )();
