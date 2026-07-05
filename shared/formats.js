( function () {
	var registerFormatType = wp.richText.registerFormatType;
	var toggleFormat = wp.richText.toggleFormat;
	var RichTextToolbarButton = wp.blockEditor.RichTextToolbarButton;
	var addFilter = wp.hooks.addFilter;
	var createElement = wp.element.createElement;
	var __ = wp.i18n.__;

	var FORMAT = 'arriva/wavy-underline';

	registerFormatType( FORMAT, {
		title: __( 'Wavy underline', 'arriva' ),
		tagName: 'span',
		className: 'arriva-wkw',
		edit: function ( props ) {
			return createElement( RichTextToolbarButton, {
				icon: 'marker',
				title: __( 'Wavy underline', 'arriva' ),
				onClick: function () {
					props.onChange(
						toggleFormat( props.value, {
							type: FORMAT,
						} )
					);
				},
				isActive: props.isActive,
			} );
		},
	} );

	/* Make wavy underline available in every RichText field (including core blocks). */
	addFilter( 'editor.RichText', 'arriva/allow-wavy-underline', function ( Original ) {
		return function ( props ) {
			var allowedFormats = props.allowedFormats;

			if ( allowedFormats === undefined ) {
				return createElement( Original, props );
			}

			if ( Array.isArray( allowedFormats ) && allowedFormats.indexOf( FORMAT ) === -1 ) {
				allowedFormats = allowedFormats.concat( FORMAT );
			}

			return createElement( Original, Object.assign( {}, props, {
				allowedFormats: allowedFormats,
			} ) );
		};
	} );
} )();
