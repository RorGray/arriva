( function ( wp ) {
	var registerPlugin = wp.plugins.registerPlugin;
	var PluginDocumentSettingPanel =
		( wp.editor && wp.editor.PluginDocumentSettingPanel ) ||
		( wp.editPost && wp.editPost.PluginDocumentSettingPanel );
	var el = wp.element.createElement;
	var useSelect = wp.data.useSelect;
	var useDispatch = wp.data.useDispatch;
	var SelectControl = wp.components.SelectControl;
	var __ = wp.i18n.__;

	var META_GROUP = 'arriva_merch_group';

	function MerchDocumentPanel() {
		if ( ! PluginDocumentSettingPanel ) {
			return null;
		}

		var data = useSelect( function ( select ) {
			var editor = select( 'core/editor' );
			return {
				postType: editor.getCurrentPostType(),
				meta: editor.getEditedPostAttribute( 'meta' ) || {},
			};
		}, [] );
		var editPost = useDispatch( 'core/editor' ).editPost;

		if ( 'arriva_merch' !== data.postType ) {
			return null;
		}

		return el(
			PluginDocumentSettingPanel,
			{
				name: 'arriva-merch-product',
				title: __( 'Produktdaten', 'arriva' ),
				className: 'arriva-merch-editor-panel',
			},
			el( SelectControl, {
				label: __( 'Gruppe (Shop)', 'arriva' ),
				help: __( 'In welchem Abschnitt der Merch-Seite das Produkt erscheint.', 'arriva' ),
				value: data.meta[ META_GROUP ] || 'featured',
				options: [
					{ label: __( 'Aktuelle Artikel', 'arriva' ), value: 'featured' },
					{ label: __( 'Weitere Textilien & Farben', 'arriva' ), value: 'catalog' },
				],
				onChange: function ( value ) {
					editPost( { meta: Object.assign( {}, data.meta, { [ META_GROUP ]: value } ) } );
				},
			} ),
			el(
				'p',
				{ className: 'arriva-merch-editor-panel__hint' },
				__(
					'Name, Badge, Kurztext, Preis, Farben, Details und Bilder bearbeitest du direkt in der Produktvorschau.',
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
