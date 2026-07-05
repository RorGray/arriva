( function () {
	var registerBlockType = wp.blocks.registerBlockType;
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var RichText = wp.blockEditor.RichText;
	var RichTextContent = RichText.Content;
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
	var usePaletteGroups = wp.arriva.usePaletteGroups;

	var DEFAULT_GLOW = 'rgba(26,147,164,0.28)';

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

	function hasRichTextContent( value ) {
		if ( ! value ) {
			return false;
		}
		return value
			.replace( /<[^>]+>/g, '' )
			.replace( /&nbsp;/g, ' ' )
			.trim().length > 0;
	}

	function getTitleValue( attrs ) {
		if ( attrs.title ) {
			return attrs.title;
		}

		var parts = [];

		if ( hasRichTextContent( attrs.titleBeforeHighlight ) ) {
			parts.push( attrs.titleBeforeHighlight );
		}
		if ( hasRichTextContent( attrs.titleHighlight ) ) {
			parts.push( attrs.titleHighlight );
		}
		if ( hasRichTextContent( attrs.titleAfterHighlight ) ) {
			parts.push( attrs.titleAfterHighlight );
		}

		var lineOne = parts.join( ' ' );

		if ( hasRichTextContent( attrs.titleEmphasis ) ) {
			var emphasis = attrs.titleEmphasis;
			if ( emphasis.indexOf( '<em' ) !== 0 ) {
				emphasis = '<em>' + emphasis + '</em>';
			}
			return lineOne ? lineOne + '<br>' + emphasis : emphasis;
		}

		return lineOne;
	}

	function renderTitle( attrs, isEditor, setAttributes ) {
		var titleValue = getTitleValue( attrs );

		if ( isEditor ) {
			return editRichText( {
				tagName: 'h1',
				className: 'arriva-hero__title',
				value: titleValue,
				onChange: function ( value ) {
					setAttributes( { title: value } );
				},
				placeholder: __( 'Title…', 'arriva' ),
			} );
		}

		return saveRichText( {
			tagName: 'h1',
			className: 'arriva-hero__title',
			value: titleValue,
		} );
	}

	function glowVarValue( color ) {
		if ( ! color ) {
			return DEFAULT_GLOW;
		}
		if ( color.indexOf( 'rgba' ) === 0 || color.indexOf( 'hsla' ) === 0 ) {
			return color;
		}
		if ( color === 'transparent' ) {
			return 'transparent';
		}
		var hex = color.replace( '#', '' );
		if ( hex.length === 3 ) {
			hex = hex
				.split( '' )
				.map( function ( ch ) {
					return ch + ch;
				} )
				.join( '' );
		}
		if ( hex.length !== 6 ) {
			return color;
		}
		var r = parseInt( hex.slice( 0, 2 ), 16 );
		var g = parseInt( hex.slice( 2, 4 ), 16 );
		var b = parseInt( hex.slice( 4, 6 ), 16 );
		return 'rgba(' + r + ',' + g + ',' + b + ',0.28)';
	}

	function heroStyleVars( attrs ) {
		return {
			'--arriva-hero-bg': attrs.backgroundColor || '#18222a',
			'--arriva-hero-accent': attrs.accentColor || '#1a93a4',
			'--arriva-hero-accent-d': attrs.accentDarkColor || '#117585',
			'--arriva-hero-glow': glowVarValue( attrs.glowColor ),
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

	function editRichText( config ) {
		return el( RichText, {
			tagName: config.tagName,
			className: config.className,
			value: config.value,
			onChange: config.onChange,
			placeholder: config.placeholder,
		} );
	}

	function saveRichText( config ) {
		if ( ! hasRichTextContent( config.value ) ) {
			return null;
		}
		return el( RichTextContent, {
			tagName: config.tagName,
			className: config.className,
			value: config.value,
		} );
	}

	function renderButton( attrs, isEditor, setAttributes, variant, textKey, urlKey, placeholder ) {
		var text = attrs[ textKey ];
		var url = attrs[ urlKey ];
		var className = 'arriva-hero__btn arriva-hero__btn--' + variant;

		if ( isEditor ) {
			return editRichText( {
				tagName: 'span',
				value: text,
				onChange: function ( value ) {
					var update = {};
					update[ textKey ] = value;
					setAttributes( update );
				},
				placeholder: placeholder,
			} );
		}

		if ( ! hasRichTextContent( text ) ) {
			return null;
		}

		return el(
			'a',
			{
				className: className,
				href: url || '#',
			},
			saveRichText( { tagName: 'span', value: text } )
		);
	}

	function renderHeroInner( attrs, isEditor, setAttributes ) {
		var title = renderTitle( attrs, isEditor, setAttributes );
		var primaryBtn = renderButton(
			attrs,
			isEditor,
			setAttributes,
			'main',
			'primaryBtnText',
			'primaryBtnUrl',
			__( 'Primary button…', 'arriva' )
		);
		var secondaryBtn = renderButton(
			attrs,
			isEditor,
			setAttributes,
			'ghost',
			'secondaryBtnText',
			'secondaryBtnUrl',
			__( 'Secondary button…', 'arriva' )
		);

		var buttons = null;
		if ( isEditor ) {
			buttons = el(
				'div',
				{ className: 'arriva-hero__btns' },
				el(
					'a',
					{
						className: 'arriva-hero__btn arriva-hero__btn--main',
						href: '#',
						onClick: function ( event ) {
							event.preventDefault();
						},
					},
					primaryBtn
				),
				el(
					'a',
					{
						className: 'arriva-hero__btn arriva-hero__btn--ghost',
						href: '#',
						onClick: function ( event ) {
							event.preventDefault();
						},
					},
					secondaryBtn
				)
			);
		} else {
			var savedButtons = [ primaryBtn, secondaryBtn ].filter( Boolean );
			if ( savedButtons.length ) {
				buttons = el( 'div', { className: 'arriva-hero__btns' }, savedButtons );
			}
		}

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
					{ className: 'arriva-hero__icon', 'aria-hidden': 'true' },
					el(
						'div',
						{ className: 'arriva-hero__icon-motion' },
						renderIcon( attrs.iconUrl, attrs.iconAlt )
					)
				)
				: null,
			el(
				'div',
				{ className: 'arriva-hero__wrap' },
				el(
					'div',
					{ className: 'arriva-hero__content' },
					isEditor
						? editRichText( {
							tagName: 'span',
							className: 'arriva-hero__eye',
							value: attrs.eyebrow,
							onChange: function ( value ) {
								setAttributes( { eyebrow: value } );
							},
							placeholder: __( 'Eyebrow text…', 'arriva' ),
						} )
						: saveRichText( {
							tagName: 'span',
							className: 'arriva-hero__eye',
							value: attrs.eyebrow,
						} ),
					title,
					isEditor
						? editRichText( {
							tagName: 'p',
							className: 'arriva-hero__sub',
							value: attrs.subtitle,
							onChange: function ( value ) {
								setAttributes( { subtitle: value } );
							},
							placeholder: __( 'Subtitle…', 'arriva' ),
						} )
						: saveRichText( {
							tagName: 'p',
							className: 'arriva-hero__sub',
							value: attrs.subtitle,
						} ),
					buttons
				)
			)
		);
	}

	registerBlockType( 'arriva/hero', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var palette = usePaletteGroups();
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
								'Keeps the hero fixed while content below scrolls over it. Place a Wave Divider after this block with “Overlap previous section” enabled and a transparent top colour.',
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
								colors: palette.paletteGroups,
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
								colors: palette.paletteGroups,
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
								colors: palette.paletteGroups,
								value: attributes.accentDarkColor,
								onChange: function ( color ) {
									setAttributes( { accentDarkColor: color } );
								},
							} )
						),
						el(
							BaseControl,
							{
								label: __( 'Glow colour', 'arriva' ),
								help: __(
									'Theme preset colours are applied at 28% opacity for the radial glow.',
									'arriva'
								),
							},
							el( ColorPalette, {
								colors: palette.paletteGroups,
								value: attributes.glowColor,
								onChange: function ( color ) {
									setAttributes( { glowColor: color } );
								},
							} )
						)
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
