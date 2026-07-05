( function () {
	var registerFormatType = wp.richText.registerFormatType;
	var toggleFormat = wp.richText.toggleFormat;
	var RichTextToolbarButton = wp.blockEditor.RichTextToolbarButton;
	var el = wp.element.createElement;
	var __ = wp.i18n.__;

	registerFormatType( 'arriva/wavy-underline', {
		title: __( 'Wavy underline', 'arriva' ),
		tagName: 'span',
		className: 'arriva-wkw',
		edit: function ( props ) {
			return el( RichTextToolbarButton, {
				icon: 'marker',
				title: __( 'Wavy underline', 'arriva' ),
				onClick: function () {
					props.onChange(
						toggleFormat( props.value, {
							type: 'arriva/wavy-underline',
						} )
					);
				},
				isActive: props.isActive,
			} );
		},
	} );
} )();
