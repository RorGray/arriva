( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var PanelColorSettings = wp.components.PanelColorSettings;
	var __ = wp.i18n.__;

	var WAVE_PATH = 'M0 28C180 56 360 0 540 28C720 56 900 0 1080 28C1260 56 1440 0 1440 28L1440 56L0 56Z';

	function waveSvg( bottomColor ) {
		return el(
			'svg',
			{ viewBox: '0 0 1440 56', preserveAspectRatio: 'none', height: 56 },
			el( 'path', { d: WAVE_PATH, fill: bottomColor } )
		);
	}

	registerBlockType( 'arriva/wave-divider', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps( { style: { background: topColor } } );

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Wave Colors', 'arriva' ), initialOpen: true },
						el( PanelColorSettings, {
							title: __( 'Colors', 'arriva' ),
							colorSettings: [
								{
									value: topColor,
									onChange: function ( color ) {
										setAttributes( { topColor: color || '#18222a' } );
									},
									label: __( 'Top background (matches section above)', 'arriva' ),
								},
								{
									value: bottomColor,
									onChange: function ( color ) {
										setAttributes( { bottomColor: color || '#ffffff' } );
									},
									label: __( 'Bottom fill (matches section below)', 'arriva' ),
								},
							],
						} )
					)
				),
				el( 'div', blockProps, waveSvg( bottomColor ) )
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var topColor = attributes.topColor;
			var bottomColor = attributes.bottomColor;
			var blockProps = useBlockProps.save( { style: { background: topColor } } );

			return el( 'div', blockProps, waveSvg( bottomColor ) );
		},
	} );
} )();
