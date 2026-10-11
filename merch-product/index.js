( function ( wp ) {
	var registerBlockType = wp.blocks.registerBlockType;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var useInnerBlocksProps = wp.blockEditor.useInnerBlocksProps;
	var InnerBlocks = wp.blockEditor.InnerBlocks;
	var PlainText = wp.blockEditor.PlainText;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
	var Button = wp.components.Button;
	var Dropdown = wp.components.Dropdown;
	var TextControl = wp.components.TextControl;
	var ColorPicker = wp.components.ColorPicker;
	var el = wp.element.createElement;
	var useState = wp.element.useState;
	var useSelect = wp.data.useSelect;
	var useEntityProp = wp.coreData.useEntityProp;
	var __ = wp.i18n.__;

	var META_PRICE = 'arriva_merch_price';
	var META_OPTIONS = 'arriva_merch_options';
	var META_BADGE = 'arriva_merch_badge';
	var META_GALLERY = 'arriva_merch_gallery';
	var META_COLORS = 'arriva_merch_colors';
	var META_DETAILS = 'arriva_merch_details';

	// Keep in sync with arriva_merch_color_name_to_hex().
	var COLOR_NAMES = {
		navy: '#1e2a4a',
		schwarz: '#1a1a1a',
		'weiß': '#f5f5f2',
		weiss: '#f5f5f2',
		royalblau: '#1e4d8c',
		royal: '#1e4d8c',
		'bright royal': '#2563eb',
		'convoy grey': '#6b7280',
		'carolina blue': '#6cb4d8',
		'forest green': '#2d5a3d',
		'military green': '#4a5d3f',
		'heather saphir': '#3d5a80',
		orange: '#e87722',
		charcoal: '#36454f',
		pink: '#e8a0bf',
		mint: '#98d4bb',
	};

	function splitLines( raw ) {
		return String( raw || '' )
			.split( /\r\n|\r|\n/ )
			.map( function ( line ) {
				return line.trim();
			} )
			.filter( Boolean );
	}

	function parseColorLine( line ) {
		var m = line.match( /^([^#]+?)\s+(#[0-9a-fA-F]{3,8})$/ );
		if ( m ) {
			return { label: m[ 1 ].trim(), hex: m[ 2 ] };
		}
		if ( /^#[0-9a-fA-F]{3,8}$/.test( line ) ) {
			return { label: line, hex: line };
		}
		return { label: line, hex: COLOR_NAMES[ line.toLowerCase() ] || '' };
	}

	function parseColors( colorsRaw, optionsRaw ) {
		var list = splitLines( colorsRaw ).map( parseColorLine );
		if ( list.length ) {
			return list;
		}

		var line = splitLines( optionsRaw ).find( function ( l ) {
			return /^Farben?:\s*/i.test( l );
		} );
		if ( ! line ) {
			return [];
		}

		return line
			.replace( /^Farben?:\s*/i, '' )
			.split( /\s*[·,—–-]\s*/ )
			.map( function ( part ) {
				return part.replace( /\s*druck.*$/i, '' ).trim();
			} )
			.filter( Boolean )
			.map( parseColorLine );
	}

	function serializeColors( list ) {
		return list
			.map( function ( swatch ) {
				var label = ( swatch.label || '' ).trim();
				if ( ! swatch.hex ) {
					return label;
				}
				return label && label !== swatch.hex ? label + ' ' + swatch.hex : swatch.hex;
			} )
			.filter( Boolean )
			.join( '\n' );
	}

	function imageUrl( media, size ) {
		if ( ! media ) {
			return '';
		}
		var sizes = media.media_details && media.media_details.sizes;
		return sizes && sizes[ size ] ? sizes[ size ].source_url : media.source_url;
	}

	function Gallery( props ) {
		var featuredId = props.featuredId;
		var gallery = props.gallery;
		var ids = [];
		if ( featuredId ) {
			ids.push( featuredId );
		}
		gallery.forEach( function ( id ) {
			if ( ids.indexOf( id ) === -1 ) {
				ids.push( id );
			}
		} );

		var activeState = useState( 0 );
		var active = Math.min( activeState[ 0 ], Math.max( ids.length - 1, 0 ) );
		var setActive = activeState[ 1 ];

		var media = useSelect(
			function ( select ) {
				return ids.map( function ( id ) {
					return select( 'core' ).getMedia( id );
				} );
			},
			[ ids.join( ',' ) ]
		);

		function addImages( selection ) {
			var next = gallery.slice();
			( Array.isArray( selection ) ? selection : [ selection ] ).forEach( function ( item ) {
				if ( item && item.id && item.id !== featuredId && next.indexOf( item.id ) === -1 ) {
					next.push( item.id );
				}
			} );
			props.onGalleryChange( next );
		}

		function remove( id ) {
			if ( id === featuredId ) {
				props.onFeaturedChange( 0 );
			}
			props.onGalleryChange(
				gallery.filter( function ( x ) {
					return x !== id;
				} )
			);
		}

		var main = media[ active ];

		var stage = el(
			MediaUpload,
			{
				onSelect: function ( item ) {
					props.onFeaturedChange( item.id );
					setActive( 0 );
				},
				allowedTypes: [ 'image' ],
				value: featuredId,
				render: function ( upload ) {
					if ( ! ids.length ) {
						return el(
							'div',
							{ className: 'arriva-merch-single__stage arriva-merch-single__stage--empty arriva-merch-product-editor__stage-empty' },
							el( Button, { variant: 'secondary', onClick: upload.open }, __( 'Hauptbild wählen', 'arriva' ) )
						);
					}

					return el(
						'div',
						{ className: 'arriva-merch-single__stage arriva-merch-product-editor__stage' },
						main
							? el( 'img', { className: 'arriva-merch-single__image', src: imageUrl( main, 'large' ), alt: main.alt_text || '' } )
							: el( 'div', { className: 'arriva-merch-product-editor__loading' } ),
						el(
							Button,
							{ className: 'arriva-merch-product-editor__stage-action', variant: 'secondary', onClick: upload.open },
							__( 'Hauptbild ändern', 'arriva' )
						)
					);
				},
			}
		);

		var thumbs = el(
			'ul',
			{ className: 'arriva-merch-single__thumbs', role: 'list' },
			ids.map( function ( id, index ) {
				var item = media[ index ];
				return el(
					'li',
					{ key: id, className: 'arriva-merch-product-editor__thumb-item' },
					el(
						'button',
						{
							type: 'button',
							className: 'arriva-merch-single__thumb' + ( index === active ? ' is-active' : '' ),
							onClick: function () {
								setActive( index );
							},
						},
						item
							? el( 'img', { className: 'arriva-merch-single__thumb-img', src: imageUrl( item, 'thumbnail' ), alt: item.alt_text || '' } )
							: el( 'span', { className: 'arriva-merch-single__thumb-img' } )
					),
					el(
						'button',
						{
							type: 'button',
							className: 'arriva-merch-product-editor__thumb-remove',
							'aria-label': __( 'Bild entfernen', 'arriva' ),
							onClick: function () {
								remove( id );
								setActive( 0 );
							},
						},
						'×'
					)
				);
			} ),
			el(
				'li',
				{ key: 'add' },
				el( MediaUpload, {
					onSelect: addImages,
					allowedTypes: [ 'image' ],
					multiple: true,
					gallery: true,
					render: function ( upload ) {
						return el(
							'button',
							{
								type: 'button',
								className: 'arriva-merch-single__thumb arriva-merch-product-editor__thumb-add',
								onClick: upload.open,
							},
							__( '+ Bilder', 'arriva' )
						);
					},
				} )
			)
		);

		return el(
			'div',
			{ className: 'arriva-merch-single__gallery' },
			el( MediaUploadCheck, null, stage, thumbs )
		);
	}

	function Swatch( props ) {
		var swatch = props.swatch;

		return el( Dropdown, {
			className: 'arriva-merch-product-editor__swatch-dropdown',
			popoverProps: { placement: 'bottom-start' },
			renderToggle: function ( toggle ) {
				return el(
					'button',
					{
						type: 'button',
						className: 'arriva-merch-single__swatch arriva-merch-product-editor__swatch',
						style: swatch.hex ? { '--arriva-swatch': swatch.hex } : undefined,
						'aria-expanded': toggle.isOpen,
						onClick: toggle.onToggle,
					},
					el( 'span', { className: 'arriva-merch-single__swatch-dot', 'aria-hidden': true } ),
					el( 'span', { className: 'arriva-merch-single__swatch-label' }, swatch.label || __( 'Ohne Name', 'arriva' ) )
				);
			},
			renderContent: function ( dropdown ) {
				return el(
					'div',
					{ className: 'arriva-merch-product-editor__swatch-popover' },
					el( TextControl, {
						label: __( 'Name', 'arriva' ),
						value: swatch.label,
						onChange: function ( label ) {
							props.onChange( { label: label, hex: swatch.hex } );
						},
					} ),
					el( ColorPicker, {
						color: swatch.hex || '#888888',
						enableAlpha: false,
						onChange: function ( hex ) {
							props.onChange( { label: swatch.label, hex: hex } );
						},
					} ),
					el(
						Button,
						{
							variant: 'link',
							isDestructive: true,
							onClick: function () {
								dropdown.onClose();
								props.onRemove();
							},
						},
						__( 'Farbe entfernen', 'arriva' )
					)
				);
			},
		} );
	}

	function Colors( props ) {
		var list = props.list;

		function update( index, swatch ) {
			var next = list.slice();
			next[ index ] = swatch;
			props.onChange( next );
		}

		return el(
			'div',
			{ className: 'arriva-merch-single__colors' },
			el( 'h2', { className: 'arriva-merch-single__colors-title' }, __( 'Farben', 'arriva' ) ),
			el(
				'ul',
				{ className: 'arriva-merch-single__swatches', role: 'list' },
				list.map( function ( swatch, index ) {
					return el(
						'li',
						{ key: index },
						el( Swatch, {
							swatch: swatch,
							onChange: function ( next ) {
								update( index, next );
							},
							onRemove: function () {
								props.onChange(
									list.filter( function ( _, i ) {
										return i !== index;
									} )
								);
							},
						} )
					);
				} ),
				el(
					'li',
					{ key: 'add' },
					el(
						'button',
						{
							type: 'button',
							className: 'arriva-merch-single__swatch arriva-merch-product-editor__swatch-add',
							onClick: function () {
								props.onChange( list.concat( [ { label: __( 'Neue Farbe', 'arriva' ), hex: '#888888' } ] ) );
							},
						},
						__( '+ Farbe', 'arriva' )
					)
				)
			),
			el(
				'p',
				{ className: 'arriva-merch-single__colors-note' },
				__( 'Farbauswahl bei Bestellung — keine Live-Vorschau.', 'arriva' )
			)
		);
	}

	function Specs( props ) {
		var editingState = useState( false );
		var editing = editingState[ 0 ];
		var setEditing = editingState[ 1 ];
		var lines = splitLines( props.value ).filter( function ( line ) {
			return ! /^Farben?:\s*/i.test( line );
		} );

		var body;
		if ( editing ) {
			body = el( PlainText, {
				className: 'arriva-merch-product-editor__field arriva-merch-product-editor__specs-field',
				value: props.value,
				autoFocus: true,
				placeholder: __( 'Eine Zeile pro Angabe, z. B. „Größen: S–XXL“', 'arriva' ),
				onChange: props.onChange,
				onBlur: function () {
					setEditing( false );
				},
			} );
		} else {
			body = el(
				'div',
				{
					className: 'arriva-merch-product-editor__specs-preview',
					role: 'button',
					tabIndex: 0,
					'aria-label': __( 'Details bearbeiten', 'arriva' ),
					onClick: function () {
						setEditing( true );
					},
					onKeyDown: function ( event ) {
						if ( 'Enter' === event.key ) {
							setEditing( true );
						}
					},
				},
				lines.length
					? el(
							'dl',
							{ className: 'arriva-merch-single__spec-list' },
							lines.map( function ( line, index ) {
								var m = line.match( /^([^:]+):\s*(.+)$/ );
								return m
									? [ el( 'dt', { key: index + 'k' }, m[ 1 ].trim() ), el( 'dd', { key: index + 'v' }, m[ 2 ].trim() ) ]
									: el( 'dt', { key: index, className: 'arriva-merch-single__spec-solo' }, line );
							} )
					  )
					: el(
							'p',
							{ className: 'arriva-merch-product-editor__placeholder' },
							__( 'Details hinzufügen, z. B. „Material: 80 % Baumwolle“', 'arriva' )
					  )
			);
		}

		return el(
			'div',
			{ className: 'arriva-merch-single__specs' },
			el( 'h2', { className: 'arriva-merch-single__specs-title' }, __( 'Details & Optionen', 'arriva' ) ),
			body
		);
	}

	function Edit( props ) {
		var postType = props.context.postType;
		var postId = props.context.postId;

		var metaProp = useEntityProp( 'postType', postType, 'meta', postId );
		var titleProp = useEntityProp( 'postType', postType, 'title', postId );
		var excerptProp = useEntityProp( 'postType', postType, 'excerpt', postId );
		var featuredProp = useEntityProp( 'postType', postType, 'featured_media', postId );

		var meta = metaProp[ 0 ] || {};
		function setMeta( patch ) {
			metaProp[ 1 ]( Object.assign( {}, meta, patch ) );
		}

		var gallery = Array.isArray( meta[ META_GALLERY ] ) ? meta[ META_GALLERY ] : [];
		var badge = meta[ META_BADGE ] || '';
		var details = meta[ META_DETAILS ] || '';
		var specsValue = [ meta[ META_OPTIONS ] || '', details ].filter( Boolean ).join( '\n' );

		var blockProps = useBlockProps( { className: 'arriva-merch-single arriva-merch-product-editor' } );
		var innerBlocksProps = useInnerBlocksProps(
			{ className: 'arriva-merch-single__body' },
			{
				template: [
					[ 'core/paragraph', { placeholder: __( 'Längere Beschreibung (optional) …', 'arriva' ) } ],
				],
			}
		);

		if ( 'arriva_merch' !== postType ) {
			return el( 'div', blockProps, __( 'Die Produktseite ist nur in Vereinsprodukten verfügbar.', 'arriva' ) );
		}

		return el(
			'article',
			blockProps,
			el(
				'div',
				{ className: 'arriva-merch-single__layout' },
				el( Gallery, {
					featuredId: featuredProp[ 0 ] || 0,
					gallery: gallery,
					onFeaturedChange: featuredProp[ 1 ],
					onGalleryChange: function ( next ) {
						setMeta( { [ META_GALLERY ]: next } );
					},
				} ),
				el(
					'aside',
					{ className: 'arriva-merch-single__buy' },
					el(
						'h1',
						{ className: 'arriva-merch-single__title' },
						el( PlainText, {
							className: 'arriva-merch-product-editor__field',
							value: titleProp[ 0 ] || '',
							placeholder: __( 'Produktname', 'arriva' ),
							onChange: titleProp[ 1 ],
						} )
					),
					el(
						'p',
						{ className: 'arriva-merch-single__badge' + ( badge ? '' : ' is-empty' ) },
						el( 'input', {
							type: 'text',
							className: 'arriva-merch-product-editor__field',
							value: badge,
							size: Math.max( badge.length, 6 ),
							placeholder: __( '+ Badge', 'arriva' ),
							'aria-label': __( 'Badge (optional, leer = kein Badge)', 'arriva' ),
							onChange: function ( event ) {
								setMeta( { [ META_BADGE ]: event.target.value } );
							},
						} )
					),
					el(
						'p',
						{ className: 'arriva-merch-single__lead' },
						el( PlainText, {
							className: 'arriva-merch-product-editor__field',
							value: excerptProp[ 0 ] || '',
							placeholder: __( 'Kurztext (optional)', 'arriva' ),
							onChange: excerptProp[ 1 ],
						} )
					),
					el(
						'p',
						{ className: 'arriva-merch-single__price-row' },
						el( 'span', { className: 'arriva-merch-single__price-label' }, __( 'Preis', 'arriva' ) ),
						el( 'input', {
							type: 'text',
							className: 'arriva-merch-single__price arriva-merch-product-editor__field',
							value: meta[ META_PRICE ] || '',
							placeholder: __( 'Preis auf Anfrage', 'arriva' ),
							'aria-label': __( 'Preis', 'arriva' ),
							onChange: function ( event ) {
								setMeta( { [ META_PRICE ]: event.target.value } );
							},
						} )
					),
					el( Colors, {
						list: parseColors( meta[ META_COLORS ], meta[ META_OPTIONS ] ),
						onChange: function ( list ) {
							setMeta( { [ META_COLORS ]: serializeColors( list ) } );
						},
					} ),
					el( Specs, {
						value: specsValue,
						onChange: function ( value ) {
							setMeta( { [ META_OPTIONS ]: value, [ META_DETAILS ]: '' } );
						},
					} ),
					el(
						'p',
						{ className: 'arriva-merch-single__order-note' },
						__( 'Kein Online-Warenkorb — Bestellung über den Vorstand.', 'arriva' )
					),
					el( 'span', { className: 'arriva-merch-single__order', 'aria-hidden': true }, __( 'Beim Vorstand bestellen', 'arriva' ) )
				)
			),
			el(
				'div',
				{ className: 'arriva-merch-single__details' },
				el( 'h2', { className: 'arriva-merch-single__details-title' }, __( 'Weitere Informationen', 'arriva' ) ),
				el( 'div', innerBlocksProps )
			)
		);
	}

	registerBlockType( 'arriva/merch-product', {
		edit: Edit,
		save: function () {
			return el( InnerBlocks.Content );
		},
	} );
} )( window.wp );
