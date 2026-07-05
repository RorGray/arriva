( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useEffect = wp.element.useEffect;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var BaseControl = wp.components.BaseControl;
	var Button = wp.components.Button;
	var ColorPalette = wp.components.ColorPalette;
	var ToggleControl = wp.components.ToggleControl;
	var useSelect = wp.data.useSelect;
	var __ = wp.i18n.__;
	var usePaletteGroups = wp.arriva.usePaletteGroups;

	var TRANSPARENT = 'transparent';

	var WAVES = {
		wave: {
			height: 54,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 28C180 56 360 0 540 28C720 56 900 0 1080 28L1080 56L0 56Z',
		},
		'wave-flip': {
			height: 54,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 28C180 0 360 56 540 28C720 0 900 56 1080 28L1080 56L0 56Z',
		},
		curve: {
			height: 46,
			pathWidth: 1440,
			tileWidth: 1920,
			tilePath: 'M0 24C240 48 480 0 720 24C960 48 1200 0 1440 24L1440 48L0 48Z',
		},
		'curve-flip': {
			height: 46,
			pathWidth: 1440,
			tileWidth: 1920,
			tilePath: 'M0 24C240 0 480 48 720 24C960 0 1200 48 1440 24L1440 48L0 48Z',
		},
		ripple: {
			height: 46,
			pathWidth: 1080,
			tileWidth: 1440,
			tilePath: 'M0 24C180 0 360 48 540 24C720 0 900 48 1080 24L1080 48L0 48Z',
		},
		'ripple-flip': {
			height: 46,
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

	function isFixedHeroBefore( block ) {
		return block && block.name === 'arriva/hero' && block.attributes.fixedScroll !== false;
	}

	function blockPropsFor( attributes, shape ) {
		return {
			className: attributes.overlapPrevious ? 'is-overlap-previous' : '',
			style: {
				background: attributes.topColor || TRANSPARENT,
				'--arriva-wave-height': waveHeight( shape ) + 'px',
			},
		};
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
			var blockProps = useBlockProps( blockPropsFor( attributes, shape ) );
			var palette = usePaletteGroups( TRANSPARENT_GROUP );
			var paletteGroups = palette.paletteGroups;
			var flatColors = palette.flatColors;

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
				var updates = {};

				if ( ! shape ) {
					var initial = randomizeWave( null );
					updates.shape = initial.shape;
					updates.offset = initial.offset;
				}
				if ( ! topColor ) {
					updates.topColor = detectBlockBackground( siblings.prev, flatColors ) || TRANSPARENT;
				}
				if ( ! bottomColor ) {
					updates.bottomColor = detectBlockBackground( siblings.next, flatColors ) || TRANSPARENT;
				}
				if ( isFixedHeroBefore( siblings.prev ) && ! attributes.overlapPrevious ) {
					updates.overlapPrevious = true;
					updates.topColor = TRANSPARENT;
				}

				if ( Object.keys( updates ).length ) {
					setAttributes( updates );
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
						el( ToggleControl, {
							label: __( 'Overlap previous section', 'arriva' ),
							help: __(
								'Pulls the wave up by its height so a transparent top reveals the section above instead of the page background. The next section starts flush with no extra gap.',
								'arriva'
							),
							checked: attributes.overlapPrevious,
							onChange: function ( value ) {
								setAttributes( { overlapPrevious: value } );
							},
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
							el( ColorPalette, {
								colors: paletteGroups,
								value: topColor,
								onChange: function ( color ) {
									setAttributes( { topColor: color || TRANSPARENT } );
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
									setAttributes( { bottomColor: color || TRANSPARENT } );
								},
							} )
						)
					)
				),
				el(
					'div',
					blockProps,
					waveSvg(
						shape,
						bottomColor,
						offset,
						patternId( shape, bottomColor, offset, clientId )
					)
				)
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var shape = attributes.shape;
			var offset = attributes.offset;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps.save( blockPropsFor( attributes, shape ) );

			return el(
				'div',
				blockProps,
				waveSvg(
					shape,
					bottomColor,
					offset,
					patternId( shape, bottomColor, offset, '' )
				)
			);
		},
	} );
} )();
