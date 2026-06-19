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
	var useSelect = wp.data.useSelect;
	var __ = wp.i18n.__;

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
			el( 'path', { d: wave.path, fill: bottomColor } )
		);
	}

	registerBlockType( 'arriva/wave-divider', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var shape = attributes.shape;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps( { style: { background: topColor } } );
			var themeColors = useSelect( function ( select ) {
				return select( 'core/block-editor' ).getSettings().colors || [];
			}, [] );

			useEffect( function () {
				if ( ! shape ) {
					setAttributes( { shape: randomShape() } );
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
								colors: themeColors,
								value: topColor,
								onChange: function ( color ) {
									setAttributes( { topColor: color || '#18222a' } );
								},
							} )
						),
						el(
							BaseControl,
							{ label: __( 'Bottom fill (matches section below)', 'arriva' ) },
							el( ColorPalette, {
								colors: themeColors,
								value: bottomColor,
								onChange: function ( color ) {
									setAttributes( { bottomColor: color || '#ffffff' } );
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
			var blockProps = useBlockProps.save( { style: { background: topColor } } );

			return el( 'div', blockProps, waveSvg( shape, bottomColor ) );
		},
	} );
} )();
