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

	function headerStyleVars( attrs ) {
		return {
			'--arriva-hero-bg': attrs.backgroundColor || '#18222a',
			'--arriva-hero-accent': attrs.accentColor || '#1a93a4',
			'--arriva-hero-accent-d': attrs.accentDarkColor || '#117585',
			'--arriva-hero-glow': glowVarValue( attrs.glowColor ),
			'--arriva-hero-min-height': ( attrs.minHeight || 340 ) + 'px',
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
					{ className: 'arriva-hero__content is-centered' },
					richTextField(
						{
							tagName: 'span',
							className: 'arriva-hero__eye',
							value: attrs.eyebrow,
							onChange: function ( value ) {
								setAttributes( { eyebrow: value } );
							},
							placeholder: __( 'Eyebrow text…', 'arriva' ),
						},
						isEditor
					),
					richTextField(
						{
							tagName: 'h1',
							className: 'arriva-hero__title',
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
							className: 'arriva-hero__sub',
							value: attrs.subtitle,
							onChange: function ( value ) {
								setAttributes( { subtitle: value } );
							},
							placeholder: __( 'Subtitle…', 'arriva' ),
						},
						isEditor
					)
				)
			)
		);
	}

	registerBlockType( 'arriva/page-header', {
		edit: function ( props ) {
			var attributes = props.attributes;
			var setAttributes = props.setAttributes;
			var palette = usePaletteGroups();
			var blockProps = useBlockProps( {
				className: 'alignfull',
				style: headerStyleVars( attributes ),
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
						el( RangeControl, {
							label: __( 'Minimum height (px)', 'arriva' ),
							value: attributes.minHeight,
							onChange: function ( value ) {
								setAttributes( { minHeight: value } );
							},
							min: 240,
							max: 520,
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
							{ label: __( 'Glow colour', 'arriva' ) },
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
							)
						)
					)
				),
				el(
					'div',
					blockProps,
					el( 'div', { className: 'arriva-page-header__layer' }, renderInner( attributes, true, setAttributes ) )
				)
			);
		},
		save: function ( props ) {
			var attributes = props.attributes;
			var blockProps = useBlockProps.save( {
				style: headerStyleVars( attributes ),
			} );

			return el(
				'div',
				blockProps,
				el( 'div', { className: 'arriva-page-header__layer' }, renderInner( attributes, false, null ) )
			);
		},
	} );
} )();
