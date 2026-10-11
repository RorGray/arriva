<?php
/**
 * Wave divider SVG markup (shared by block render).
 */

defined( 'ABSPATH' ) || exit;

/**
 * @return array<string, array{height:int, pathWidth:int, tileWidth:int, tilePath:string}>
 */
function arriva_wave_divider_shapes() {
	return array(
		'wave'         => array(
			'height'    => 54,
			'pathWidth' => 1080,
			'tileWidth' => 1440,
			'tilePath'  => 'M0 28C180 56 360 0 540 28C720 56 900 0 1080 28L1080 56L0 56Z',
		),
		'wave-flip'    => array(
			'height'    => 54,
			'pathWidth' => 1080,
			'tileWidth' => 1440,
			'tilePath'  => 'M0 28C180 0 360 56 540 28C720 0 900 56 1080 28L1080 56L0 56Z',
		),
		'curve'        => array(
			'height'    => 46,
			'pathWidth' => 1440,
			'tileWidth' => 1920,
			'tilePath'  => 'M0 24C240 48 480 0 720 24C960 48 1200 0 1440 24L1440 48L0 48Z',
		),
		'curve-flip'   => array(
			'height'    => 46,
			'pathWidth' => 1440,
			'tileWidth' => 1920,
			'tilePath'  => 'M0 24C240 0 480 48 720 24C960 0 1200 48 1440 24L1440 48L0 48Z',
		),
		'ripple'       => array(
			'height'    => 46,
			'pathWidth' => 1080,
			'tileWidth' => 1440,
			'tilePath'  => 'M0 24C180 0 360 48 540 24C720 0 900 48 1080 24L1080 48L0 48Z',
		),
		'ripple-flip'  => array(
			'height'    => 46,
			'pathWidth' => 1080,
			'tileWidth' => 1440,
			'tilePath'  => 'M0 24C180 48 360 0 540 24C720 48 900 0 1080 24L1080 48L0 48Z',
		),
	);
}

/**
 * @param string $shape        Shape key.
 * @param string $bottom_color Fill color.
 * @param int    $offset       Pattern phase offset.
 * @param string $pattern_id   Unique pattern id.
 * @return string SVG markup.
 */
function arriva_wave_divider_svg( $shape, $bottom_color, $offset, $pattern_id ) {
	$waves = arriva_wave_divider_shapes();
	$wave  = isset( $waves[ $shape ] ) ? $waves[ $shape ] : $waves['wave'];

	$fill   = $bottom_color ? $bottom_color : 'transparent';
	$phase  = ( (int) $offset ) % (int) $wave['tileWidth'];
	$scale  = $wave['tileWidth'] / $wave['pathWidth'];
	$height = (int) $wave['height'];

	$pattern_id = preg_replace( '/[^a-zA-Z0-9_-]/', '', $pattern_id );

	ob_start();
	?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="<?php echo esc_attr( (string) $height ); ?>">
	<defs>
		<pattern id="<?php echo esc_attr( $pattern_id ); ?>" width="<?php echo esc_attr( (string) $wave['tileWidth'] ); ?>" height="<?php echo esc_attr( (string) $height ); ?>" patternUnits="userSpaceOnUse" patternTransform="translate(<?php echo esc_attr( (string) -$phase ); ?>, 0)">
			<path d="<?php echo esc_attr( $wave['tilePath'] ); ?>" fill="<?php echo esc_attr( $fill ); ?>" transform="scale(<?php echo esc_attr( (string) $scale ); ?>, 1)"></path>
		</pattern>
	</defs>
	<rect width="100%" height="<?php echo esc_attr( (string) $height ); ?>" fill="url(#<?php echo esc_attr( $pattern_id ); ?>)"></rect>
</svg>
	<?php
	return (string) ob_get_clean();
}

/**
 * @param array<string, mixed> $attributes Block attributes.
 * @return string HTML for wave divider.
 */
function arriva_render_wave_divider( $attributes ) {
	$shape             = isset( $attributes['shape'] ) ? (string) $attributes['shape'] : 'ripple-flip';
	$offset            = isset( $attributes['offset'] ) ? (int) $attributes['offset'] : 0;
	$top_color         = isset( $attributes['topColor'] ) ? (string) $attributes['topColor'] : 'transparent';
	$bottom_color      = isset( $attributes['bottomColor'] ) ? (string) $attributes['bottomColor'] : '#ffffff';
	$overlap_previous  = ! empty( $attributes['overlapPrevious'] );
	$waves             = arriva_wave_divider_shapes();
	$wave              = isset( $waves[ $shape ] ) ? $waves[ $shape ] : $waves['wave'];
	$height            = (int) $wave['height'];

	$color_part = preg_replace( '/[^a-zA-Z0-9]/', '', $bottom_color );
	$pattern_id = 'arriva-' . $shape . '-' . $color_part . '-' . $offset;

	$class_names = array( 'alignfull' );
	if ( $overlap_previous ) {
		$class_names[] = 'is-overlap-previous';
	}

	$wrapper = get_block_wrapper_attributes(
		array(
			'class' => implode( ' ', $class_names ),
			'style' => sprintf(
				'background:%1$s;--arriva-wave-height:%2$dpx',
				esc_attr( $top_color ? $top_color : 'transparent' ),
				$height
			),
		)
	);

	$svg = arriva_wave_divider_svg( $shape, $bottom_color, $offset, $pattern_id );

	return '<div ' . $wrapper . '>' . $svg . '</div>';
}
