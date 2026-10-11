( function ( wp ) {
	var registerPlugin = wp.plugins.registerPlugin;
	var PluginDocumentSettingPanel =
		( wp.editor && wp.editor.PluginDocumentSettingPanel ) ||
		( wp.editPost && wp.editPost.PluginDocumentSettingPanel );
	var el = wp.element.createElement;
	var useSelect = wp.data.useSelect;
	var useDispatch = wp.data.useDispatch;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var SelectControl = wp.components.SelectControl;
	var Button = wp.components.Button;
	var BaseControl = wp.components.BaseControl;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var __ = wp.i18n.__;

	var META_PRICE = 'arriva_merch_price';
	var META_OPTIONS = 'arriva_merch_options';
	var META_GROUP = 'arriva_merch_group';
	var META_BADGE = 'arriva_merch_badge';
	var META_GALLERY = 'arriva_merch_gallery';
	var META_COLORS = 'arriva_merch_colors';
	var META_DETAILS = 'arriva_merch_details';

	function useMerchMeta() {
		var meta = useSelect( function ( select ) {
			return select( 'core/editor' ).getEditedPostAttribute( 'meta' ) || {};
		}, [] );

		var editPost = useDispatch( 'core/editor' ).editPost;

		function setMeta( key, value ) {
			editPost( {
				meta: Object.assign( {}, meta, { [ key ]: value } ),
			} );
		}

		return { meta: meta, setMeta: setMeta };
	}

	function GalleryItem( props ) {
		var id = props.id;
		var onRemove = props.onRemove;
		var media = useSelect(
			function ( select ) {
				return select( 'core' ).getMedia( id );
			},
			[ id ]
		);

		var src =
			media &&
			media.media_details &&
			media.media_details.sizes &&
			media.media_details.sizes.thumbnail
				? media.media_details.sizes.thumbnail.source_url
				: media
					? media.source_url
					: '';

		return el(
			'li',
			{ className: 'arriva-merch-editor-gallery__item' },
			src
				? el( 'img', {
						className: 'arriva-merch-editor-gallery__thumb',
						src: src,
						alt: media.alt_text || '',
				  } )
				: el( 'span', { className: 'arriva-merch-editor-gallery__placeholder' }, '#' + id ),
			el(
				Button,
				{
					className: 'arriva-merch-editor-gallery__remove',
					variant: 'link',
					isDestructive: true,
					onClick: onRemove,
				},
				__( 'Entfernen', 'arriva' )
			)
		);
	}

	function GalleryControl( props ) {
		var ids = props.ids;
		var onChange = props.onChange;

		function addMedia( selection ) {
			var list = Array.isArray( selection ) ? selection : [ selection ];
			var next = ids.slice();
			list.forEach( function ( item ) {
				if ( item && item.id && next.indexOf( item.id ) === -1 ) {
					next.push( item.id );
				}
			} );
			onChange( next );
		}

		return el(
			BaseControl,
			{
				className: 'arriva-merch-editor-gallery',
				help: __(
					'Zusätzliche Produktbilder. Das Beitragsbild (rechts) ist immer das Hauptbild.',
					'arriva'
				),
			},
			el(
				'ul',
				{ className: 'arriva-merch-editor-gallery__list' },
				ids.map( function ( id ) {
					return el( GalleryItem, {
						key: id,
						id: id,
						onRemove: function () {
							onChange( ids.filter( function ( x ) {
								return x !== id;
							} ) );
						},
					} );
				} )
			),
			el( MediaUpload, {
				onSelect: addMedia,
				allowedTypes: [ 'image' ],
				multiple: true,
				gallery: true,
				render: function ( renderProps ) {
					return el(
						Button,
						{
							variant: 'secondary',
							onClick: renderProps.open,
						},
						__( 'Galerie-Bilder hinzufügen', 'arriva' )
					);
				},
			} )
		);
	}

	function MerchDocumentPanel() {
		if ( ! PluginDocumentSettingPanel ) {
			return null;
		}

		var postType = useSelect( function ( select ) {
			return select( 'core/editor' ).getCurrentPostType();
		}, [] );

		if ( 'arriva_merch' !== postType ) {
			return null;
		}

		var metaState = useMerchMeta();
		var meta = metaState.meta;
		var setMeta = metaState.setMeta;

		var gallery = Array.isArray( meta[ META_GALLERY ] ) ? meta[ META_GALLERY ] : [];

		return el(
			PluginDocumentSettingPanel,
			{
				name: 'arriva-merch-product',
				title: __( 'Produktdaten', 'arriva' ),
				className: 'arriva-merch-editor-panel',
			},
			el( TextControl, {
				label: __( 'Preis', 'arriva' ),
				help: __( 'z. B. „89,00 €“ oder „auf Anfrage“', 'arriva' ),
				value: meta[ META_PRICE ] || '',
				onChange: function ( value ) {
					setMeta( META_PRICE, value );
				},
			} ),
			el( SelectControl, {
				label: __( 'Gruppe (Shop)', 'arriva' ),
				help: __(
					'In welchem Abschnitt der Merch-Seite das Produkt erscheint — unabhängig vom Badge.',
					'arriva'
				),
				value: meta[ META_GROUP ] || 'featured',
				options: [
					{ label: __( 'Aktuelle Artikel', 'arriva' ), value: 'featured' },
					{ label: __( 'Weitere Textilien & Farben', 'arriva' ), value: 'catalog' },
				],
				onChange: function ( value ) {
					setMeta( META_GROUP, value );
				},
			} ),
			el( TextControl, {
				label: __( 'Badge (optional)', 'arriva' ),
				help: __(
					'Kurzer Hinweis auf der Karte und Produktdetailseite, z. B. „NEU“ oder „Korrekturabzug“. Leer lassen = kein Badge.',
					'arriva'
				),
				value: meta[ META_BADGE ] || '',
				onChange: function ( value ) {
					setMeta( META_BADGE, value );
				},
			} ),
			el( TextareaControl, {
				label: __( 'Optionen', 'arriva' ),
				help: __(
					'Eine Zeile pro Option, z. B. „Farben: Navy, Schwarz“ oder „Größen: nach Absprache“.',
					'arriva'
				),
				value: meta[ META_OPTIONS ] || '',
				onChange: function ( value ) {
					setMeta( META_OPTIONS, value );
				},
				rows: 5,
			} ),
			el( TextareaControl, {
				label: __( 'Farben (Swatches)', 'arriva' ),
				help: __(
					'Eine Farbe pro Zeile. Optional mit Hex: „Navy #1e2a4a“. Leer lassen = aus „Farben:“ in Optionen.',
					'arriva'
				),
				value: meta[ META_COLORS ] || '',
				onChange: function ( value ) {
					setMeta( META_COLORS, value );
				},
				rows: 4,
			} ),
			el( TextareaControl, {
				label: __( 'Zusätzliche Details', 'arriva' ),
				help: __( 'Extra Zeilen für die Detailseite (unter „Details & Optionen“).', 'arriva' ),
				value: meta[ META_DETAILS ] || '',
				onChange: function ( value ) {
					setMeta( META_DETAILS, value );
				},
				rows: 4,
			} ),
			el( GalleryControl, {
				ids: gallery,
				onChange: function ( next ) {
					setMeta( META_GALLERY, next );
				},
			} ),
			el(
				'p',
				{ className: 'arriva-merch-editor-panel__hint' },
				__(
					'Kurztext = Auszug (Sidebar). Beitragsbild = Hauptfoto. Inhalt = längere Beschreibung unten auf der Produktseite.',
					'arriva'
				)
			)
		);
	}

	registerPlugin( 'arriva-merch-document-panel', {
		render: MerchDocumentPanel,
		icon: 'tag',
	} );
} )( window.wp );
