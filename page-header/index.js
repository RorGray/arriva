( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var RichText = wp.blockEditor.RichText;
	var RichTextContent = RichText.Content;
	var __ = wp.i18n.__;

	function hasRichTextContent( value ) {
		if ( ! value ) {
			return false;
		}
		return value
			.replace( /<[^>]+>/g, '' )
			.replace( /&nbsp;/g, ' ' )
			.trim().length > 0;
	}

	function richTextField( config, isEditor ) {
		if ( isEditor ) {
			return el( RichText, {
				tagName: config.tagName,
				className: config.className,
				value: config.value,
				onChange: config.onChange,
				placeholder: config.placeholder,
			} );
		}
		if ( ! hasRichTextContent( config.value ) ) {
			return null;
		}
		return el( RichTextContent, {
			tagName: config.tagName,
			className: config.className,
			value: config.value,
		} );
	}

	function renderInner( attrs, isEditor, setAttributes ) {
		return el(
			'div',
			{ className: 'arriva-page-header__inner' },
			richTextField(
				{
					tagName: 'p',
					className: 'arriva-page-header__eyebrow',
					value: attrs.eyebrow,
					onChange: function ( value ) {
						setAttributes( { eyebrow: value } );
					},
					placeholder: __( 'Eyebrow (optional)…', 'arriva' ),
				},
				isEditor
			),
			richTextField(
				{
					tagName: 'h1',
					className: 'arriva-page-header__title',
					value: attrs.title,
					onChange: function ( value ) {
						setAttributes( { title: value } );
					},
					placeholder: __( 'Page title…', 'arriva' ),
				},
				isEditor
			),
			richTextField(
				{
					tagName: 'p',
					className: 'arriva-page-header__subtitle',
					value: attrs.subtitle,
					onChange: function ( value ) {
						setAttributes( { subtitle: value } );
					},
					placeholder: __( 'Subtitle (optional)…', 'arriva' ),
				},
				isEditor
			)
		);
	}

	registerBlockType( 'arriva/page-header', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'alignfull',
			} );

			return el(
				'div',
				blockProps,
				renderInner( attributes, true, setAttributes )
			);
		},
		save: function ( props ) {
			var blockProps = useBlockProps.save();
			return el(
				'div',
				blockProps,
				renderInner( props.attributes, false, null )
			);
		},
	} );
} )();
