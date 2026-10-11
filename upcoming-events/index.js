( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var RichText = wp.blockEditor.RichText;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var RangeControl = wp.components.RangeControl;
	var ServerSideRender = wp.serverSideRender;
	var __ = wp.i18n.__;

	function textField( tagName, className, value, onChange, placeholder ) {
		return el( RichText, {
			tagName: tagName,
			className: className,
			value: value,
			onChange: onChange,
			placeholder: placeholder,
			allowedFormats: [ 'core/bold', 'core/italic', 'core/link', 'arriva/wavy-underline' ],
		} );
	}

	registerBlockType( 'arriva/upcoming-events', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-upcoming-events alignfull',
			} );

			function bind( key ) {
				return function ( value ) {
					var next = {};
					next[ key ] = value;
					setAttributes( next );
				};
			}

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Termine', 'arriva' ), initialOpen: true },
						el( RangeControl, {
							label: __( 'Anzahl', 'arriva' ),
							help: __(
								'Die Zeile unter jedem Titel kommt aus dem Textauszug des Termins.',
								'arriva'
							),
							value: attributes.count,
							onChange: bind( 'count' ),
							min: 1,
							max: 24,
						} ),
						el( TextControl, {
							label: __( 'Link-URL', 'arriva' ),
							help: __( 'Der Link wird nur mit Text und URL angezeigt.', 'arriva' ),
							value: attributes.moreUrl,
							onChange: bind( 'moreUrl' ),
						} )
					)
				),
				el(
					'section',
					blockProps,
					el(
						'div',
						{ className: 'arriva-upcoming-events__inner' },
						textField(
							'p',
							'arriva-upcoming-events__eyebrow',
							attributes.eyebrow,
							bind( 'eyebrow' ),
							__( 'Dachzeile…', 'arriva' )
						),
						textField(
							'h2',
							'arriva-upcoming-events__heading',
							attributes.heading,
							bind( 'heading' ),
							__( 'Überschrift…', 'arriva' )
						),
						textField(
							'p',
							'arriva-upcoming-events__intro',
							attributes.subtitle,
							bind( 'subtitle' ),
							__( 'Einleitung…', 'arriva' )
						),
						el(
							'div',
							{ className: 'arriva-upcoming-events__preview' },
							el( ServerSideRender, {
								block: 'arriva/upcoming-events',
								attributes: { count: attributes.count },
							} )
						),
						props.isSelected
							? textField(
								'p',
								'arriva-upcoming-events__empty arriva-upcoming-events__empty--editor',
								attributes.emptyText,
								bind( 'emptyText' ),
								__( 'Text, wenn keine Termine anstehen…', 'arriva' )
							)
							: null,
						el(
							'div',
							{},
							textField(
								'span',
								'arriva-upcoming-events__more',
								attributes.moreLabel,
								bind( 'moreLabel' ),
								__( 'Link-Text…', 'arriva' )
							)
						)
					)
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )();
