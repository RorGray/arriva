( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var RangeControl = wp.components.RangeControl;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/upcoming-events', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-upcoming-events-editor',
			} );

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Termine', 'arriva' ), initialOpen: true },
						el( TextControl, {
							label: __( 'Überschrift', 'arriva' ),
							value: attributes.heading,
							onChange: function ( value ) {
								setAttributes( { heading: value } );
							},
						} ),
						el( RangeControl, {
							label: __( 'Anzahl', 'arriva' ),
							value: attributes.count,
							onChange: function ( value ) {
								setAttributes( { count: value } );
							},
							min: 1,
							max: 24,
						} )
					)
				),
				el(
					'section',
					blockProps,
					el(
						'p',
						{ className: 'arriva-upcoming-events-editor__label' },
						attributes.heading || __( 'Nächste Termine', 'arriva' ),
						' · ',
						__( 'max.', 'arriva' ),
						' ',
						String( attributes.count )
					)
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )();
