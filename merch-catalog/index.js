( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var el = wp.element.createElement;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/merch-catalog', {
		edit: function () {
			var blockProps = useBlockProps( {
				className: 'arriva-merch-shop-editor',
			} );

			return el(
				'div',
				blockProps,
				el(
					'p',
					null,
					__(
						'Produkt-Übersicht (Vereinsprodukte) — Klickbare Karten, Details pro Produkt.',
						'arriva'
					)
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )();
