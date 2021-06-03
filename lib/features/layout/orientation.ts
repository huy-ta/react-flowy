import { isObject } from 'min-dash';
import { Orientation, Point, Rectangle } from '../../types';
import { boundsAsTRBL } from '../../utils/geometry';

// orientation utils //////////////////////

export function invertOrientation(orientation: Orientation): Orientation {
  return {
    [Orientation.TOP]: Orientation.BOTTOM,
    [Orientation.BOTTOM]: Orientation.TOP,
    [Orientation.LEFT]: Orientation.RIGHT,
    [Orientation.RIGHT]: Orientation.LEFT,
    [Orientation.TOP_LEFT]: Orientation.BOTTOM_RIGHT,
    [Orientation.BOTTOM_RIGHT]: Orientation.TOP_LEFT,
    [Orientation.TOP_RIGHT]: Orientation.BOTTOM_LEFT,
    [Orientation.BOTTOM_LEFT]: Orientation.TOP_RIGHT,
    [Orientation.INTERSECT]: Orientation.INTERSECT,
  }[orientation];
}

/**
 * Get orientation of the given rectangle or point with respect to
 * the reference rectangle or point.
 *
 * A padding (positive or negative) may be passed to influence
 * horizontal / vertical orientation and intersection.
 *
 * @param {Rectangle|Point} source
 * @param {Rectangle|Point} reference
 * @param {Point|number} padding
 *
 * @return {Orientation} the orientation; one of top, top-left, left, ..., bottom, right or intersect.
 */
export function getOrientation(source: Rectangle | Point, reference: Rectangle | Point, padding: Point | number = 0): Orientation {
  // make sure we can use an object, too
  // for individual { x, y } padding
  if (!isObject(padding)) {
    padding = { x: padding, y: padding };
  }

  const sourceTRBL = boundsAsTRBL(source);
  const referenceTRBL = boundsAsTRBL(reference);

  const top = sourceTRBL.bottom + padding.y <= referenceTRBL.top;
  const right = sourceTRBL.left - padding.x >= referenceTRBL.right;
  const bottom = sourceTRBL.top - padding.y >= referenceTRBL.bottom;
  const left = sourceTRBL.right + padding.x <= referenceTRBL.left;

  const vertical = top ? Orientation.TOP : (bottom ? Orientation.BOTTOM : null);
  const horizontal = left ? Orientation.LEFT : (right ? Orientation.RIGHT : null);

  if (horizontal && vertical) {
    return `${vertical}-${horizontal}` as Orientation;
  }

  return horizontal || vertical || Orientation.INTERSECT;
}
