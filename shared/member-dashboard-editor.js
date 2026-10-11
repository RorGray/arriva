( function ( wp ) {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var RangeControl = wp.components.RangeControl;
	var Disabled = wp.components.Disabled;
	var ServerSideRender = wp.serverSideRender;
	var __ = wp.i18n.__;

	var PLACEHOLDER_HELP = __( 'Platzhalter wie %s oder %1$d werden durch Live-Werte ersetzt. Feld leeren = ausblenden.', 'arriva' );

	// Sidebar fields per block: [ attribute, label, control ('text' | 'textarea' | 'range' | 'number'), extra props ].
	var FIELDS = {
		'arriva/member-welcome': [
			{
				title: __( 'Texte', 'arriva' ),
				fields: [
					[ 'greeting', __( 'Begrüßung (%s = Vorname)', 'arriva' ) ],
					[ 'intro', __( 'Einleitung', 'arriva' ), 'textarea' ],
					[ 'nextLabel', __( 'Vor dem nächsten Termin', 'arriva' ) ],
					[ 'noEventText', __( 'Wenn kein Termin ansteht', 'arriva' ) ],
				],
			},
		],
		'arriva/member-tiles': [
			{
				title: __( 'Termine', 'arriva' ),
				fields: [
					[ 'termineTitle', __( 'Titel', 'arriva' ) ],
					[ 'termineText', __( 'Text', 'arriva' ) ],
					[ 'termineLive', __( 'Live-Zeile (%1$d = Anzahl, %2$s = nächstes Datum)', 'arriva' ) ],
				],
			},
			{
				title: __( 'Vorstand', 'arriva' ),
				fields: [
					[ 'vorstandTitle', __( 'Titel', 'arriva' ) ],
					[ 'vorstandText', __( 'Text', 'arriva' ) ],
				],
			},
			{
				title: __( 'Dokumente', 'arriva' ),
				fields: [
					[ 'dokumenteTitle', __( 'Titel', 'arriva' ) ],
					[ 'dokumenteText', __( 'Text', 'arriva' ) ],
				],
			},
			{
				title: __( 'Merch', 'arriva' ),
				fields: [
					[ 'merchTitle', __( 'Titel', 'arriva' ) ],
					[ 'merchText', __( 'Text', 'arriva' ) ],
					[ 'merchLive', __( 'Live-Zeile (%1$d = Anzahl, %2$s = neuester Artikel)', 'arriva' ) ],
				],
			},
		],
		'arriva/member-news': [
			{
				title: __( 'Mitteilungen', 'arriva' ),
				help: __( 'Zeigt Beiträge der Kategorie „Mitglieder“. Diese Beiträge sind nur für angemeldete Mitglieder sichtbar.', 'arriva' ),
				fields: [
					[ 'heading', __( 'Überschrift', 'arriva' ) ],
					[ 'count', __( 'Anzahl', 'arriva' ), 'range', { min: 1, max: 10 } ],
					[ 'emptyText', __( 'Wenn es keine Mitteilungen gibt', 'arriva' ) ],
					[ 'moreLabel', __( 'Link zu allen Mitteilungen', 'arriva' ) ],
					[ 'writeLabel', __( 'Link „Neue Mitteilung“ (nur für Redakteure)', 'arriva' ) ],
				],
			},
		],
		'arriva/calendar-subscribe': [
			{
				title: __( 'Texte', 'arriva' ),
				help: __( 'Jedes Mitglied sieht hier seinen persönlichen Kalender-Link.', 'arriva' ),
				fields: [
					[ 'heading', __( 'Überschrift', 'arriva' ) ],
					[ 'text', __( 'Text', 'arriva' ), 'textarea' ],
					[ 'buttonLabel', __( 'Button „Abonnieren“', 'arriva' ) ],
					[ 'copyLabel', __( 'Button „Kopieren“', 'arriva' ) ],
					[ 'copiedLabel', __( 'Nach dem Kopieren', 'arriva' ) ],
					[ 'note', __( 'Hinweis', 'arriva' ), 'textarea' ],
				],
			},
		],
		'arriva/rhine-level': [
			{
				title: __( 'Pegel', 'arriva' ),
				help: __( 'Daten von pegelonline.wsv.de, alle 15 Minuten aktualisiert.', 'arriva' ),
				fields: [
					[ 'heading', __( 'Überschrift', 'arriva' ) ],
					[ 'station', __( 'Pegel (Kurzname, z. B. SPEYER)', 'arriva' ) ],
					[ 'timeLabel', __( 'Zeitstempel (%s = Uhrzeit)', 'arriva' ) ],
					[ 'sourceLabel', __( 'Quellenangabe', 'arriva' ) ],
					[ 'errorText', __( 'Wenn keine Daten kommen', 'arriva' ) ],
				],
			},
			{
				title: __( 'Beschriftungen', 'arriva' ),
				initialOpen: false,
				fields: [
					[ 'risingLabel', __( 'Steigend', 'arriva' ) ],
					[ 'fallingLabel', __( 'Fallend', 'arriva' ) ],
					[ 'steadyLabel', __( 'Gleichbleibend', 'arriva' ) ],
					[ 'lowLabel', __( 'Unter mittlerem Niedrigwasser', 'arriva' ) ],
					[ 'normalLabel', __( 'Normal', 'arriva' ) ],
					[ 'highLabel', __( 'Über mittlerem Hochwasser', 'arriva' ) ],
				],
			},
		],
		'arriva/weather': [
			{
				title: __( 'Wetter', 'arriva' ),
				help: __( 'Daten von open-meteo.com, stündlich aktualisiert.', 'arriva' ),
				fields: [
					[ 'heading', __( 'Überschrift', 'arriva' ) ],
					[ 'days', __( 'Tage', 'arriva' ), 'range', { min: 1, max: 7 } ],
					[ 'latitude', __( 'Breitengrad', 'arriva' ), 'number' ],
					[ 'longitude', __( 'Längengrad', 'arriva' ), 'number' ],
				],
			},
			{
				title: __( 'Beschriftungen', 'arriva' ),
				initialOpen: false,
				fields: [
					[ 'todayLabel', __( 'Heute', 'arriva' ) ],
					[ 'rainLabel', __( 'Regen (Screenreader)', 'arriva' ) ],
					[ 'windLabel', __( 'Wind', 'arriva' ) ],
					[ 'sourceLabel', __( 'Quellenangabe', 'arriva' ) ],
					[ 'errorText', __( 'Wenn keine Daten kommen', 'arriva' ) ],
				],
			},
		],
	};

	function control( field, attributes, setAttributes ) {
		var key = field[ 0 ];
		var type = field[ 2 ] || 'text';
		var props = Object.assign(
			{
				key: key,
				label: field[ 1 ],
				value: attributes[ key ],
				onChange: function ( value ) {
					var next = {};
					next[ key ] = 'number' === type ? parseFloat( value ) || 0 : value;
					setAttributes( next );
				},
			},
			field[ 3 ] || {}
		);

		if ( 'textarea' === type ) {
			return el( TextareaControl, props );
		}
		if ( 'range' === type ) {
			return el( RangeControl, props );
		}
		if ( 'number' === type ) {
			props.type = 'number';
			props.step = 'any';
		}
		return el( TextControl, props );
	}

	Object.keys( FIELDS ).forEach( function ( name ) {
		registerBlockType( name, {
			edit: function ( props ) {
				var blockProps = useBlockProps();

				return el(
					Fragment,
					{},
					el(
						InspectorControls,
						{},
						FIELDS[ name ].map( function ( panel, index ) {
							return el(
								PanelBody,
								{ key: index, title: panel.title, initialOpen: false !== panel.initialOpen },
								panel.help ? el( 'p', {}, panel.help ) : null,
								panel.fields.map( function ( field ) {
									return control( field, props.attributes, props.setAttributes );
								} ),
								el( 'p', { className: 'components-base-control__help' }, PLACEHOLDER_HELP )
							);
						} )
					),
					el(
						'div',
						blockProps,
						el( Disabled, {}, el( ServerSideRender, { block: name, attributes: props.attributes } ) )
					)
				);
			},
			save: function () {
				return null;
			},
		} );
	} );
} )( window.wp );
