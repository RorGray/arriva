( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var RichText = wp.blockEditor.RichText;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
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

	registerBlockType( 'arriva/events-list', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-events alignfull is-enhanced',
			} );
			var year = attributes.year > 0 ? attributes.year : new Date().getFullYear();

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
						{ title: __( 'Terminliste', 'arriva' ), initialOpen: true },
						el( TextControl, {
							label: __( 'Jahr (0 = aktuelles Jahr)', 'arriva' ),
							type: 'number',
							value: attributes.year,
							onChange: function ( value ) {
								setAttributes( { year: parseInt( value, 10 ) || 0 } );
							},
						} ),
						el( ToggleControl, {
							label: __( 'Jahr an die Überschrift anhängen', 'arriva' ),
							checked: attributes.showYear,
							onChange: bind( 'showYear' ),
						} ),
						el( ToggleControl, {
							label: __( 'Kalenderansicht anbieten', 'arriva' ),
							help: __(
								'Zeigt den Umschalter, sobald beide Beschriftungen ausgefüllt sind. Auf dem Handy bleibt es immer bei der Liste.',
								'arriva'
							),
							checked: attributes.showCalendar,
							onChange: bind( 'showCalendar' ),
						} ),
						el(
							'p',
							{ className: 'components-base-control__help' },
							__(
								'Vergangene Monate werden in der Liste hinter einem Button versteckt, sobald dessen Text ausgefüllt ist. Die Vorschau im Editor zeigt immer alle Monate.',
								'arriva'
							)
						),
						el(
							'p',
							{ className: 'components-base-control__help' },
							__(
								'Der Kalender-Abo-Link ist nur für angemeldete Mitglieder sichtbar und enthält einen persönlichen Schlüssel.',
								'arriva'
							)
						)
					)
				),
				el(
					'section',
					blockProps,
					el(
						'div',
						{ className: 'arriva-events__inner' },
						textField(
							'p',
							'arriva-events__eyebrow',
							attributes.eyebrow,
							bind( 'eyebrow' ),
							__( 'Dachzeile…', 'arriva' )
						),
						el(
							'h2',
							{ className: 'arriva-events__heading' },
							textField(
								'span',
								'',
								attributes.heading,
								bind( 'heading' ),
								__( 'Überschrift…', 'arriva' )
							),
							attributes.showYear
								? el( 'span', { className: 'arriva-events__year' }, ' ' + year )
								: null
						),
						textField(
							'p',
							'arriva-events__intro',
							attributes.subtitle,
							bind( 'subtitle' ),
							__( 'Einleitung…', 'arriva' )
						),
						attributes.showCalendar
							? el(
								'div',
								{ className: 'arriva-events__toolbar' },
								el(
									'div',
									{ className: 'arriva-events__switch' },
									textField(
										'span',
										'arriva-events__switch-btn is-active',
										attributes.listLabel,
										bind( 'listLabel' ),
										__( 'Liste-Beschriftung…', 'arriva' )
									),
									textField(
										'span',
										'arriva-events__switch-btn',
										attributes.calendarLabel,
										bind( 'calendarLabel' ),
										__( 'Kalender-Beschriftung…', 'arriva' )
									)
								)
							)
							: null,
						el(
							'div',
							{ className: 'arriva-events__past-editor' },
							textField(
								'span',
								'arriva-events__past-toggle',
								attributes.pastLabel,
								bind( 'pastLabel' ),
								__( 'Button-Text für vergangene Monate (z. B. „Frühere Termine“)…', 'arriva' )
							)
						),
						el(
							'div',
							{ className: 'arriva-events__preview' },
							el( ServerSideRender, {
								block: 'arriva/events-list',
								attributes: { year: attributes.year, showCalendar: false },
							} )
						),
						props.isSelected
							? textField(
								'p',
								'arriva-events__empty arriva-events__editor-only',
								attributes.emptyText,
								bind( 'emptyText' ),
								__( 'Text, wenn es in diesem Jahr keine Termine gibt…', 'arriva' )
							)
							: null,
						el(
							'div',
							{},
							textField(
								'span',
								'arriva-events__ical',
								attributes.icalLabel,
								bind( 'icalLabel' ),
								__( 'Text für den Kalender-Abo-Link (optional)…', 'arriva' )
							)
						),
						textField(
							'p',
							'arriva-events__note',
							attributes.note,
							bind( 'note' ),
							__( 'Hinweis unter der Liste (optional)…', 'arriva' )
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
