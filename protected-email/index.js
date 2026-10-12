( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;
	var TextareaControl = wp.components.TextareaControl;
	var __ = wp.i18n.__;

	registerBlockType( 'arriva/protected-email', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className: 'arriva-protected-email',
			} );
			var ready = attributes.emailUser && attributes.emailDomain;

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Email', 'arriva' ), initialOpen: true },
						el( TextControl, {
							label: __( 'Local part (before @)', 'arriva' ),
							value: attributes.emailUser,
							onChange: function ( value ) {
								setAttributes( { emailUser: value.replace( /@|\s/g, '' ) } );
							},
						} ),
						el( TextControl, {
							label: __( 'Domain (after @)', 'arriva' ),
							value: attributes.emailDomain,
							onChange: function ( value ) {
								setAttributes( { emailDomain: value.replace( /@|\s/g, '' ) } );
							},
						} ),
						el( TextControl, {
							label: __( 'Button label', 'arriva' ),
							value: attributes.buttonLabel,
							onChange: function ( value ) {
								setAttributes( { buttonLabel: value } );
							},
						} ),
						el( TextareaControl, {
							label: __( 'Helper text', 'arriva' ),
							value: attributes.helperText,
							onChange: function ( value ) {
								setAttributes( { helperText: value } );
							},
						} ),
						el( TextareaControl, {
							label: __( 'No-JavaScript message', 'arriva' ),
							value: attributes.noscriptText,
							onChange: function ( value ) {
								setAttributes( { noscriptText: value } );
							},
						} )
					)
				),
				el(
					'div',
					blockProps,
					el(
						'button',
						{
							type: 'button',
							className: 'arriva-protected-email__btn',
							disabled: ! ready,
						},
						attributes.buttonLabel || __( 'Nachricht schreiben', 'arriva' )
					),
					ready
						? el(
							'div',
							{ className: 'arriva-protected-email__address' },
							el(
								'div',
								{ className: 'arriva-protected-email__visual' },
								el(
									'span',
									{
										style: {
											fontFamily:
												'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
											fontWeight: 600,
											fontSize: '13px',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
											display: 'block',
											maxWidth: '100%',
										},
									},
									attributes.emailUser + '@' + attributes.emailDomain
								)
							),
							el(
								'button',
								{
									type: 'button',
									className: 'arriva-protected-email__copy',
									disabled: true,
								},
								__( 'Kopieren', 'arriva' )
							)
						)
						: null,
					attributes.helperText
						? el( 'p', { className: 'arriva-protected-email__note' }, attributes.helperText )
						: null,
					! ready
						? el(
							'p',
							{ className: 'arriva-protected-email__warning' },
							__( 'Set local part and domain in the block sidebar.', 'arriva' )
						)
						: null
				)
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var blockProps = useBlockProps.save( {
				className: 'arriva-protected-email',
			} );

			if ( ! attributes.emailUser || ! attributes.emailDomain ) {
				return el( 'div', blockProps );
			}

			return el(
				'div',
				blockProps,
				el(
					'button',
					{
						type: 'button',
						className: 'arriva-protected-email__btn',
						'data-u': attributes.emailUser,
						'data-h': attributes.emailDomain,
					},
					attributes.buttonLabel || 'Nachricht schreiben'
				),
				attributes.helperText
					? el( 'p', { className: 'arriva-protected-email__note' }, attributes.helperText )
					: null,
				el(
					'noscript',
					{},
					el( 'p', { className: 'arriva-protected-email__note' }, attributes.noscriptText )
				)
			);
		},
	} );
} )();
