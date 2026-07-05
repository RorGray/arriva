( function () {
	var useSelect = wp.data.useSelect;
	var useMultipleOriginColorsAndGradients =
		wp.blockEditor.__experimentalUseMultipleOriginColorsAndGradients;

	function flattenPaletteGroups( paletteGroups ) {
		var flatColors = [];

		( paletteGroups || [] ).forEach( function ( entry ) {
			if ( entry.colors ) {
				flatColors = flatColors.concat( entry.colors );
			} else {
				flatColors.push( entry );
			}
		} );

		return flatColors;
	}

	function usePaletteGroups( extraGroups ) {
		var colorGroups = useSelect( function ( select ) {
			if ( useMultipleOriginColorsAndGradients ) {
				return null;
			}
			return select( 'core/block-editor' ).getSettings().colors || [];
		}, [] );
		var multiOrigin = useMultipleOriginColorsAndGradients
			? useMultipleOriginColorsAndGradients()
			: null;
		var paletteGroups = ( extraGroups || [] ).concat(
			multiOrigin ? multiOrigin.colors : colorGroups
		);

		return {
			paletteGroups: paletteGroups,
			flatColors: flattenPaletteGroups( paletteGroups ),
		};
	}

	wp.arriva = wp.arriva || {};
	wp.arriva.usePaletteGroups = usePaletteGroups;
	wp.arriva.flattenPaletteGroups = flattenPaletteGroups;
} )();
