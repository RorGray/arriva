( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var el = wp.element.createElement;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/member-nav', {
		edit: function () {
			var blockProps = useBlockProps( {
				className: 'arriva-member-nav-editor',
			} );

			return el(
				'nav',
				blockProps,
				el(
					'p',
					{ className: 'arriva-member-nav-editor__label' },
					__(
						'Mitglieder-Navigation: Übersicht · Termine · Vorstand · Neuigkeiten · Dokumente',
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
