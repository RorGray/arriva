( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var RichText = wp.blockEditor.RichText;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
	var PanelBody = wp.components.PanelBody;
	var BaseControl = wp.components.BaseControl;
	var Button = wp.components.Button;
	var ColorPalette = wp.components.ColorPalette;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;
	var RangeControl = wp.components.RangeControl;
	var __ = wp.i18n.__;

	var DEFAULT_ICON = el(
		'svg',
		{
			viewBox: '0 0 200 160',
			width: '260',
			'aria-hidden': 'true',
		},
		el( 'path', { d: 'M20 110 C40 90 60 90 80 100 C100 110 120 110 140 100 C160 90 180 95 200 110' } ),
		el( 'path', { d: 'M80 100 L100 30 L120 100' } ),
		el( 'path', { d: 'M60 100 C80 108 120 108 140 100' } ),
		el( 'line', { x1: '100', y1: '30', x2: '100', y2: '100' } ),
		el( 'path', { d: 'M100 30 C110 35 130 45 140 55 L100 55Z' } )
	);

	function heroStyleVars( attrs ) {
		return {
			'--arriva-hero-bg': attrs.backgroundColor || '#18222a',
			'--arriva-hero-accent': attrs.accentColor || '#1a93a4',
			'--arriva-hero-accent-d': attrs.accentDarkColor || '#117585',
			'--arriva-hero-glow': attrs.glowColor || 'rgba(26,147,164,0.28)',
			'--arriva-hero-min-height': ( attrs.minHeight || 600 ) + 'px',
		};
	}

	function renderIcon( iconUrl, iconAlt ) {
		if ( iconUrl ) {
			return el( 'img', {
				className: 'arriva-hero__icon-img',
				src: iconUrl,
				alt: iconAlt || '',
				'aria-hidden': iconAlt ? undefined : 'true',
			} );
		}
		return DEFAULT_ICON;
	}

	function renderHeroInner( attrs, isEditor, setAttributes ) {
		var titleChildren = isEditor
			? [
				el( RichText, {
					tagName: 'span',
					value: attrs.titleBeforeHighlight,
					onChange: function ( value ) {
						setAttributes( { titleBeforeHighlight: value } );
					},
					placeholder: __( 'Title…', 'arriva' ),
					allowedFormats: [],
				} ),
				' ',
				el( RichText, {
					tagName: 'span',
					className: 'arriva-hero__wkw',
					value: attrs.titleHighlight,
					onChange: function ( value ) {
						setAttributes( { titleHighlight: value } );
					},
					placeholder: __( 'Highlight…', 'arriva' ),
					allowedFormats: [],
				} ),
				el( RichText, {
					tagName: 'span',
					value: attrs.titleAfterHighlight,
					onChange: function ( value ) {
						setAttributes( { titleAfterHighlight: value } );
					},
					allowedFormats: [],
				} ),
				el( 'br', {} ),
				el( RichText, {
					tagName: 'em',
					value: attrs.titleEmphasis,
					onChange: function ( value ) {
						setAttributes( { titleEmphasis: value } );
					},
					placeholder: __( 'Emphasis…', 'arriva' ),
					allowedFormats: [],
				} ),
			]
			: [
				attrs.titleBeforeHighlight ? el( 'span', {}, attrs.titleBeforeHighlight ) : null,
				' ',
				attrs.titleHighlight
					? el( 'span', { className: 'arriva-hero__wkw' }, attrs.titleHighlight )
					: null,
				attrs.titleAfterHighlight ? el( 'span', {}, attrs.titleAfterHighlight ) : null,
				el( 'br', {} ),
				attrs.titleEmphasis ? el( 'em', {}, attrs.titleEmphasis ) : null,
			];

		return el(
			'section',
			{
				className: 'arriva-hero__inner',
				style: attrs.backgroundImageUrl
					? { backgroundImage: 'url(' + attrs.backgroundImageUrl + ')' }
					: undefined,
			},
			attrs.showGlow
				? el( 'div', { className: 'arriva-hero__glow', 'aria-hidden': 'true' } )
				: null,
			attrs.showIcon
				? el(
					'div',
					{ className: 'arriva-hero__icon fl', 'aria-hidden': 'true' },
					renderIcon( attrs.iconUrl, attrs.iconAlt )
				)
				: null,
			el(
				'div',
				{ className: 'arriva-hero__wrap' },
				el(
					'div',
					{ className: 'arriva-hero__content' },
					isEditor
						? el( RichText, {
							tagName: 'span',
							className: 'arriva-hero__eye',
							value: attrs.eyebrow,
							onChange: function ( value ) {
								setAttributes( { eyebrow: value } );
							},
							placeholder: __( 'Eyebrow text…', 'arriva' ),
							allowedFormats: [],
						} )
						: attrs.eyebrow
							? el( 'span', { className: 'arriva-hero__eye' }, attrs.eyebrow )
							: null,
					el( 'h1', { className: 'arriva-hero__title' }, titleChildren ),
					isEditor
						? el( RichText, {
							tagName: 'p',
							className: 'arriva-hero__sub',
							value: attrs.subtitle,
							onChange: function ( value ) {
								setAttributes( { subtitle: value } );
							},
							placeholder: __( 'Subtitle…', 'arriva' ),
							allowedFormats: [],
						} )
						: attrs.subtitle
							? el( 'p', { className: 'arriva-hero__sub' }, attrs.subtitle )
							: null,
					el(
						'div',
						{ className: 'arriva-hero__btns' },
						el(
							'a',
							{
								className: 'arriva-hero__btn arriva-hero__btn--main',
								href: isEditor ? undefined : attrs.primaryBtnUrl || '#',
								onClick: isEditor
									? function ( event ) {
										event.preventDefault();
									}
									: undefined,
							},
							isEditor
								? el( RichText, {
									tagName: 'span',
									value: attrs.primaryBtnText,
									onChange: function ( value ) {
										setAttributes( { primaryBtnText: value } );
									},
									placeholder: __( 'Primary button…', 'arriva' ),
									allowedFormats: [],
								} )
								: attrs.primaryBtnText || null
						),
						el(
							'a',
							{
								className: 'arriva-hero__btn arriva-hero__btn--ghost',
								href: isEditor ? undefined : attrs.secondaryBtnUrl || '#',
								onClick: isEditor
									? function ( event ) {
										event.preventDefault();
									}
									: undefined,
							},
							isEditor
								? el( RichText, {
									tagName: 'span',
									value: attrs.secondaryBtnText,
									onChange: function ( value ) {
										setAttributes( { secondaryBtnText: value } );
									},
									placeholder: __( 'Secondary button…', 'arriva' ),
									allowedFormats: [],
								} )
								: attrs.secondaryBtnText || null
						)
					)
				)
			)
		);
	}

	registerBlockType( 'arriva/hero', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var blockProps = useBlockProps( {
				className:
					( attributes.fixedScroll ? 'is-fixed-scroll' : '' ) +
					( props.isSelected ? ' is-selected' : '' ),
				style: heroStyleVars( attributes ),
			} );

			return el(
				Fragment,
				{},
				el(
					InspectorControls,
					{},
					el(
						PanelBody,
						{ title: __( 'Layout', 'arriva' ), initialOpen: true },
						el( ToggleControl, {
							label: __( 'Fixed scroll-over effect', 'arriva' ),
							help: __(
								'Keeps the hero fixed while content below scrolls over it. Add a Wave Divider block after this hero and set its position mode to “Overlay fixed section”.',
								'arriva'
							),
							checked: attributes.fixedScroll,
							onChange: function ( value ) {
								setAttributes( { fixedScroll: value } );
							},
						} ),
						el( RangeControl, {
							label: __( 'Minimum height (px)', 'arriva' ),
							value: attributes.minHeight,
							onChange: function ( value ) {
								setAttributes( { minHeight: value } );
							},
							min: 400,
							max: 1200,
							step: 10,
						} ),
						el( ToggleControl, {
							label: __( 'Show glow', 'arriva' ),
							checked: attributes.showGlow,
							onChange: function ( value ) {
								setAttributes( { showGlow: value } );
							},
						} ),
						el( ToggleControl, {
							label: __( 'Show decorative icon', 'arriva' ),
							checked: attributes.showIcon,
							onChange: function ( value ) {
								setAttributes( { showIcon: value } );
							},
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Colours', 'arriva' ), initialOpen: false },
						el(
							BaseControl,
							{ label: __( 'Background', 'arriva' ) },
							el( ColorPalette, {
								value: attributes.backgroundColor,
								onChange: function ( color ) {
									setAttributes( { backgroundColor: color } );
								},
							} )
						),
						el(
							BaseControl,
							{ label: __( 'Accent', 'arriva' ) },
							el( ColorPalette, {
								value: attributes.accentColor,
								onChange: function ( color ) {
									setAttributes( { accentColor: color } );
								},
							} )
						),
						el(
							BaseControl,
							{ label: __( 'Accent (dark)', 'arriva' ) },
							el( ColorPalette, {
								value: attributes.accentDarkColor,
								onChange: function ( color ) {
									setAttributes( { accentDarkColor: color } );
								},
							} )
						),
						el( TextControl, {
							label: __( 'Glow colour (CSS)', 'arriva' ),
							value: attributes.glowColor,
							onChange: function ( value ) {
								setAttributes( { glowColor: value } );
							},
							help: __( 'Radial glow overlay, e.g. rgba(26,147,164,0.28)', 'arriva' ),
						} )
					),
					el(
						PanelBody,
						{ title: __( 'Images', 'arriva' ), initialOpen: false },
						el(
							BaseControl,
							{ label: __( 'Background image', 'arriva' ) },
							el(
								MediaUploadCheck,
								{},
								el( MediaUpload, {
									onSelect: function ( media ) {
										setAttributes( { backgroundImageUrl: media.url } );
									},
									allowedTypes: [ 'image' ],
									render: function ( obj ) {
										return el(
											Fragment,
											{},
											el(
												Button,
												{
													variant: 'secondary',
													onClick: obj.open,
												},
												attributes.backgroundImageUrl
													? __( 'Replace background', 'arriva' )
													: __( 'Choose background', 'arriva' )
											),
											attributes.backgroundImageUrl
												? el(
													Button,
													{
														variant: 'link',
														isDestructive: true,
														onClick: function () {
															setAttributes( { backgroundImageUrl: '' } );
														},
													},
													__( 'Remove', 'arriva' )
												)
												: null
										);
									},
								} )
							)
						),
						el(
							BaseControl,
							{ label: __( 'Decorative icon', 'arriva' ) },
							el(
								MediaUploadCheck,
								{},
								el( MediaUpload, {
									onSelect: function ( media ) {
										setAttributes( {
											iconUrl: media.url,
											iconAlt: media.alt || '',
										} );
									},
									allowedTypes: [ 'image' ],
									render: function ( obj ) {
										return el(
											Fragment,
											{},
											el(
												Button,
												{
													variant: 'secondary',
													onClick: obj.open,
												},
												attributes.iconUrl
													? __( 'Replace icon', 'arriva' )
													: __( 'Choose icon', 'arriva' )
											),
											attributes.iconUrl
												? el(
													Button,
													{
														variant: 'link',
														isDestructive: true,
														onClick: function () {
															setAttributes( { iconUrl: '', iconAlt: '' } );
														},
													},
													__( 'Use default icon', 'arriva' )
												)
												: null
										);
									},
								} )
							),
							attributes.iconUrl
								? el( TextControl, {
									label: __( 'Icon alt text', 'arriva' ),
									value: attributes.iconAlt,
									onChange: function ( value ) {
										setAttributes( { iconAlt: value } );
									},
								} )
								: null
						)
					),
					el(
						PanelBody,
						{ title: __( 'Buttons', 'arriva' ), initialOpen: false },
						el( TextControl, {
							label: __( 'Primary button URL', 'arriva' ),
							value: attributes.primaryBtnUrl,
							onChange: function ( value ) {
								setAttributes( { primaryBtnUrl: value } );
							},
						} ),
						el( TextControl, {
							label: __( 'Secondary button URL', 'arriva' ),
							value: attributes.secondaryBtnUrl,
							onChange: function ( value ) {
								setAttributes( { secondaryBtnUrl: value } );
							},
						} )
					)
				),
				el(
					'div',
					blockProps,
					el(
						'div',
						{ className: 'arriva-hero__layer' },
						renderHeroInner( attributes, true, setAttributes )
					),
					attributes.fixedScroll
						? el( 'div', {
							className: 'arriva-hero__spacer',
							'aria-hidden': 'true',
						} )
						: null
				)
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var blockProps = useBlockProps.save( {
				className: attributes.fixedScroll ? 'is-fixed-scroll' : '',
				style: heroStyleVars( attributes ),
			} );

			return el(
				'div',
				blockProps,
				el(
					'div',
					{ className: 'arriva-hero__layer' },
					renderHeroInner( attributes, false, null )
				),
				attributes.fixedScroll
					? el( 'div', {
						className: 'arriva-hero__spacer',
						'aria-hidden': 'true',
					} )
					: null
			);
		},
	} );
} )();
