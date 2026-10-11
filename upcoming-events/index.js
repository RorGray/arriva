( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var RangeControl = wp.components.RangeControl;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/upcoming-events', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-upcoming-events-editor alignfull',
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
							label: __( 'Dachzeile', 'arriva' ),
							value: attributes.eyebrow,
							onChange: function ( value ) {
								setAttributes( { eyebrow: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Überschrift', 'arriva' ),
							value: attributes.heading,
							onChange: function ( value ) {
								setAttributes( { heading: value } );
							},
						} ),
						el( TextareaControl, {
							label: __( 'Einleitung', 'arriva' ),
							value: attributes.subtitle,
							onChange: function ( value ) {
								setAttributes( { subtitle: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Link-Text', 'arriva' ),
							help: __( 'Leer lassen, um den Link auszublenden.', 'arriva' ),
							value: attributes.moreLabel,
							onChange: function ( value ) {
								setAttributes( { moreLabel: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Link-URL', 'arriva' ),
							help: __( 'Leer lassen für /mitglieder/termine/.', 'arriva' ),
							value: attributes.moreUrl,
							onChange: function ( value ) {
								setAttributes( { moreUrl: value } );
							},
						} ),
						el( RangeControl, {
							label: __( 'Anzahl', 'arriva' ),
							help: __(
								'Die Zeile unter jedem Titel kommt aus dem Textauszug des Termins, z. B. „Ab 16:00 Uhr · Vereinsgelände“.',
								'arriva'
							),
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
						attributes.heading || __( 'Kommende Veranstaltungen', 'arriva' ),
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
