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
	var SelectControl = wp.components.SelectControl;
	var ToggleControl = wp.components.ToggleControl;
	var useSelect = wp.data.useSelect;
	var __ = wp.i18n.__;

	var TRANSPARENT = 'transparent';

	var WAVES = {
		wave: {
			height: 56,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 28C180 56 360 0 540 28C720 56 900 0 1080 28L1080 56L0 56Z',
		},
		'wave-flip': {
			height: 56,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 28C180 0 360 56 540 28C720 0 900 56 1080 28L1080 56L0 56Z',
		},
		curve: {
			height: 48,
			pathWidth: 1440,
			tileWidth: 1920,
			tilePath: 'M0 24C240 48 480 0 720 24C960 48 1200 0 1440 24L1440 48L0 48Z',
		},
		'curve-flip': {
			height: 48,
			pathWidth: 1440,
			tileWidth: 1920,
			tilePath: 'M0 24C240 0 480 48 720 24C960 0 1200 48 1440 24L1440 48L0 48Z',
		},
		ripple: {
			height: 48,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 24C180 0 360 48 540 24C720 0 900 48 1080 24L1080 48L0 48Z',
		},
		'ripple-flip': {
			height: 48,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 24C180 48 360 0 540 24C720 48 900 0 1080 24L1080 48L0 48Z',
		},
	};

	var SHAPE_KEYS = Object.keys( WAVES );

	function randomShape() {
		return SHAPE_KEYS[ Math.floor( Math.random() * SHAPE_KEYS.length ) ];
	}

	function randomOffset( shape ) {
		var wave = WAVES[ shape ] || WAVES.wave;
		return Math.floor( Math.random() * wave.tileWidth );
	}

	function randomizeWave( currentShape ) {
		var keepShape = currentShape && Math.random() < 0.4;
		var shape = keepShape ? currentShape : randomShape();
		return {
			shape: shape,
			offset: randomOffset( shape ),
		};
	}

	function patternId( shape, bottomColor, offset, unique ) {
		var colorPart = ( bottomColor || 'transparent' ).replace( /[^a-zA-Z0-9]/g, '' );
		return 'arriva-' + shape + '-' + colorPart + '-' + offset + ( unique ? '-' + unique : '' );
	}

	function waveHeight( shape ) {
		return ( WAVES[ shape ] || WAVES.wave ).height;
	}

	function waveSvg( shape, bottomColor, offset, id ) {
		var wave = WAVES[ shape ] || WAVES.wave;
		var fill = bottomColor || TRANSPARENT;
		var phase = ( offset || 0 ) % wave.tileWidth;
		var scaleX = wave.tileWidth / wave.pathWidth;

		return el(
			'svg',
			{
				xmlns: 'http://www.w3.org/2000/svg',
				width: '100%',
				height: wave.height,
			},
			el(
				'defs',
				{},
				el(
					'pattern',
					{
						id: id,
						width: wave.tileWidth,
						height: wave.height,
						patternUnits: 'userSpaceOnUse',
						patternTransform: 'translate(' + -phase + ', 0)',
					},
					el( 'path', {
						d: wave.tilePath,
						fill: fill,
						transform: 'scale(' + scaleX + ', 1)',
					} )
				)
			),
			el( 'rect', {
				width: '100%',
				height: wave.height,
				fill: 'url(#' + id + ')',
			} )
		);
	}

	var TRANSPARENT_GROUP = [
		{
			name: __( 'Special', 'arriva' ),
			colors: [ { name: __( 'Transparent', 'arriva' ), color: TRANSPARENT, slug: 'transparent' } ],
		},
	];

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
		if ( attrs.backgroundColor && attrs.backgroundColor.indexOf( '#' ) === 0 ) {
			return attrs.backgroundColor;
		}
		return null;
	}

	function isFixedOverlayCandidate( block ) {
		if ( ! block ) {
			return false;
		}
		if ( block.name === 'arriva/hero' ) {
			return block.attributes.fixedScroll !== false;
		}
		return false;
	}

	function isOverlayMode( overlayMode ) {
		return overlayMode === 'overlay';
	}

	function renderWaveMarkup( shape, bottomColor, offset, unique, overlayMode ) {
		var svg = waveSvg(
			shape,
			bottomColor,
			offset,
			patternId( shape, bottomColor, offset, unique )
		);

		if ( isOverlayMode( overlayMode ) ) {
			return el(
				Fragment,
				{},
				el( 'div', { className: 'arriva-wave-divider__fixed' }, svg ),
				el( 'div', {
					className: 'arriva-wave-divider__spacer',
					'aria-hidden': 'true',
					style: { height: waveHeight( shape ) + 'px' },
				} )
			);
		}

		return svg;
	}

	registerBlockType( 'arriva/wave-divider', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var clientId = props.clientId;
			var shape = attributes.shape;
			var offset = attributes.offset;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var overlayMode = attributes.overlayMode || 'none';
			var isOverlay = isOverlayMode( overlayMode );
			var blockProps = useBlockProps( {
				className: isOverlay ? 'is-fixed-overlay' : '',
				style: {
					background: isOverlay ? TRANSPARENT : topColor || TRANSPARENT,
					'--arriva-wave-height': waveHeight( shape ) + 'px',
				},
			} );

			var colorGroups = useSelect( function ( select ) {
				if ( useMultipleOriginColorsAndGradients ) {
					return null;
				}
				return select( 'core/block-editor' ).getSettings().colors || [];
			}, [] );
			var multiOrigin = useMultipleOriginColorsAndGradients ? useMultipleOriginColorsAndGradients() : null;
			var paletteGroups = TRANSPARENT_GROUP.concat( multiOrigin ? multiOrigin.colors : colorGroups );
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
					var initial = randomizeWave( null );
					setAttributes( {
						shape: initial.shape,
						offset: initial.offset,
					} );
				}
				if ( ! topColor ) {
					setAttributes( { topColor: detectBlockBackground( siblings.prev, flatColors ) || TRANSPARENT } );
				}
				if ( ! bottomColor ) {
					setAttributes( { bottomColor: detectBlockBackground( siblings.next, flatColors ) || TRANSPARENT } );
				}
				if ( isFixedOverlayCandidate( siblings.prev ) && ! isOverlayMode( overlayMode ) ) {
					setAttributes( { overlayMode: 'overlay', topColor: TRANSPARENT } );
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
						el( SelectControl, {
							label: __( 'Position mode', 'arriva' ),
							value: overlayMode,
							options: [
								{ label: __( 'Default (between sections)', 'arriva' ), value: 'none' },
								{
									label: __( 'Overlay fixed section (transparent top)', 'arriva' ),
									value: 'overlay',
								},
							],
							onChange: function ( value ) {
								var next = { overlayMode: value };
								if ( value === 'overlay' ) {
									next.topColor = TRANSPARENT;
								}
								setAttributes( next );
							},
							help: __(
								'Place after a fixed Hero block (or other fixed section). The wave overlays the bottom edge with a transparent top so no gap appears before scrolling.',
								'arriva'
							),
						} ),
						el(
							BaseControl,
							{ label: __( 'Shape', 'arriva' ) },
							el(
								Button,
								{
									variant: 'secondary',
									onClick: function () {
										setAttributes( randomizeWave( shape ) );
									},
								},
								__( 'Randomize shape', 'arriva' )
							)
						),
						el(
							BaseControl,
							{ label: __( 'Top background (matches section above)', 'arriva' ) },
							el( ToggleControl, {
								label: __( 'Transparent top', 'arriva' ),
								checked: topColor === TRANSPARENT,
								disabled: isOverlay,
								onChange: function ( isTransparent ) {
									setAttributes( {
										topColor: isTransparent ? TRANSPARENT : detectBlockBackground( siblings.prev, flatColors ) || '#ffffff',
									} );
								},
							} ),
							topColor !== TRANSPARENT
								? el( ColorPalette, {
									colors: paletteGroups,
									value: topColor,
									onChange: function ( color ) {
										setAttributes( { topColor: color || TRANSPARENT } );
									},
								} )
								: null
						),
						el(
							BaseControl,
							{ label: __( 'Bottom fill (matches section below)', 'arriva' ) },
							el( ColorPalette, {
								colors: paletteGroups,
								value: bottomColor,
								onChange: function ( color ) {
									setAttributes( { bottomColor: color || TRANSPARENT } );
								},
							} )
						)
					)
				),
				el(
					'div',
					blockProps,
					renderWaveMarkup( shape, bottomColor, offset, clientId, overlayMode )
				)
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var shape = attributes.shape;
			var offset = attributes.offset;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var overlayMode = attributes.overlayMode || 'none';
			var isOverlay = isOverlayMode( overlayMode );
			var blockProps = useBlockProps.save( {
				className: isOverlay ? 'is-fixed-overlay' : '',
				style: {
					background: isOverlay ? TRANSPARENT : topColor || TRANSPARENT,
					'--arriva-wave-height': waveHeight( shape ) + 'px',
				},
			} );

			return el(
				'div',
				blockProps,
				renderWaveMarkup( shape, bottomColor, offset, '', overlayMode )
			);
		},
	} );
} )();
