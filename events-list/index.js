( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/events-list', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-events-list-editor',
			} );
			var yearLabel =
				attributes.year > 0
					? String( attributes.year )
					: __( 'aktuelles Jahr', 'arriva' );

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Terminliste', 'arriva' ), initialOpen: true },
						el( TextControl, {
							label: __( 'Überschrift', 'arriva' ),
							value: attributes.heading,
							onChange: function ( value ) {
								setAttributes( { heading: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Jahr (0 = aktuelles Jahr)', 'arriva' ),
							type: 'number',
							value: attributes.year,
							onChange: function ( value ) {
								setAttributes( { year: parseInt( value, 10 ) || 0 } );
							},
						} ),
						el( ToggleControl, {
							label: __( 'Hinweis „unter Vorbehalt“ anzeigen', 'arriva' ),
							checked: attributes.showDisclaimer,
							onChange: function ( value ) {
								setAttributes( { showDisclaimer: value } );
							},
						} )
					)
				),
				el(
					'section',
					blockProps,
					el(
						'p',
						{ className: 'arriva-events-list-editor__label' },
						( attributes.heading || __( 'Termine', 'arriva' ) ) + ' ' + yearLabel
					)
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )();
