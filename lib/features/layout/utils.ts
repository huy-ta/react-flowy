import { isObject } from 'min-dash';
import { Orientation, Point, Rectangle, TRBL } from '../../types';
import {
  getPointDistance,
  arePointsOnLine
} from '../../utils/geometry';

/**
 * Convert the given bounds to a { top, left, bottom, right } descriptor.
 *
 * @param {Rectangle|Point} bounds
 *
 * @return {TRBL}
 */
export function boundsAsTRBL(bounds: Rectangle | Point): TRBL {
  return {
    top: bounds.y,
    right: bounds.x + ((bounds as Rectangle).width || 0),
    bottom: bounds.y + ((bounds as Rectangle).height || 0),
    left: bounds.x
  };
}

/**
 * Convert a { top, right, bottom, left } to a rectangle.
 *
 * @param {TRBL} trbl
 *
 * @return {Rectangle}
 */
export function trblAsRectangle(trbl: TRBL): Rectangle {
  return {
    x: trbl.left,
    y: trbl.top,
    width: trbl.right - trbl.left,
    height: trbl.bottom - trbl.top
  };
}

// orientation utils //////////////////////

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

  const rectOrientation = boundsAsTRBL(source);
  const referenceOrientation = boundsAsTRBL(reference);

  const top = rectOrientation.bottom + padding.y <= referenceOrientation.top;
  const right = rectOrientation.left - padding.x >= referenceOrientation.right;
  const bottom = rectOrientation.top - padding.y >= referenceOrientation.bottom;
  const left = rectOrientation.right + padding.x <= referenceOrientation.left;

  const vertical = top ? Orientation.TOP : (bottom ? Orientation.BOTTOM : null);
  const horizontal = left ? Orientation.LEFT : (right ? Orientation.RIGHT : null);

  if (horizontal && vertical) {
    return `${vertical}-${horizontal}` as Orientation;
  }

  return horizontal || vertical || Orientation.INTERSECT;
}

export function filterRedundantWaypoints(waypoints: Point[], accuracy = 5) {
  // alter copy of waypoints, not original
  waypoints = waypoints.slice();

  let index = 0;
  let point;
  let previousPoint;
  let nextPoint;

  while (waypoints[index]) {
    point = waypoints[index];
    previousPoint = waypoints[index - 1];
    nextPoint = waypoints[index + 1];

    if (getPointDistance(point, nextPoint) === 0 ||
        arePointsOnLine(previousPoint, nextPoint, point, accuracy)) {
      if (Math.abs(previousPoint.x - nextPoint.x) <= accuracy) {
        nextPoint.x = Math.round(nextPoint.x);
        previousPoint.x = nextPoint.x;
      } else if (Math.abs(previousPoint.y - nextPoint.y) <= accuracy) {
        nextPoint.y = Math.round(nextPoint.y);
        previousPoint.y = nextPoint.y;
      }

      // remove point, if overlapping with {nextPoint}
      // or on line with {previousPoint} -> {point} -> {nextPoint}
      waypoints.splice(index, 1);
    } else {
      index++;
    }
  }

  return waypoints;
}
