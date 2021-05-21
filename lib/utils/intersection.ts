import { sortBy } from 'min-dash';
import findPathIntersections from 'path-intersection';
import { getPointDistance, roundPoint } from './geometry';
import { Point, Path, Intersection } from '../types';
import { getCirclePath, getLinePath } from './path';

const INTERSECTION_THRESHOLD = 10;

function getBendpointIntersection(waypoints: Point[], reference: Point) {
  let waypoint;

  for (let index = 0; (waypoint = waypoints[index]); index++) {
    if (getPointDistance(waypoint, reference) <= INTERSECTION_THRESHOLD) {
      return {
        point: waypoints[index],
        bendpoint: true,
        index: index
      };
    }
  }

  return null;
}

function getPathIntersection(waypoints: Point[], reference: Point) {
  const intersections = findPathIntersections(getCirclePath(reference, INTERSECTION_THRESHOLD), getLinePath(waypoints));

  const firstIntersection = intersections[0];
  const lastIntersection = intersections[intersections.length - 1];
  let index;

  if (!firstIntersection) {

    // no intersection
    return null;
  }

  if (firstIntersection !== lastIntersection) {
    if (firstIntersection.segment2 !== lastIntersection.segment2) {
      // we use the bendpoint in between both segments
      // as the intersection point
      index = Math.max(firstIntersection.segment2, lastIntersection.segment2) - 1;

      return {
        point: waypoints[index],
        bendpoint: true,
        index: index
      };
    }

    return {
      point: {
        x: (Math.round(firstIntersection.x + lastIntersection.x) / 2),
        y: (Math.round(firstIntersection.y + lastIntersection.y) / 2)
      },
      index: firstIntersection.segment2
    };
  }

  return {
    point: {
      x: Math.round(firstIntersection.x),
      y: Math.round(firstIntersection.y)
    },
    index: firstIntersection.segment2
  };
}

/**
 * Returns the closest point on the connection towards a given reference point.
 *
 * @param  {Point[]} waypoints
 * @param  {Point} reference
 *
 * @return {Object} intersection data (segment, point)
 */
export function getApproxIntersection(waypoints: Point[], reference: Point) {
  return getBendpointIntersection(waypoints, reference) || getPathIntersection(waypoints, reference);
}

/**
 * Get intersection between an element and a line path.
 *
 * @param {Path} elementPath
 * @param {Path} linePath
 * @param {boolean} shouldCropFromStart crop from start or end
 *
 * @return {Point}
 */
export function getElementLineIntersection(elementPath: Path, linePath: Path, shouldCropFromStart: boolean) {
  let intersections = getIntersections(elementPath, linePath);

  // recognize intersections
  // only one -> choose
  // two close together -> choose first
  // two or more distinct -> pull out appropriate one
  // none -> ok (fallback to point itself)
  if (intersections.length === 1) {
    return roundPoint(intersections[0]);
  }
  
  if (intersections.length === 2 && getPointDistance(intersections[0], intersections[1]) < 1) {
    return roundPoint(intersections[0]);
  }

  if (intersections.length > 1) {
    // sort by intersections based on connection segment +
    // distance from start
    intersections = sortBy(intersections, intersection => {
      let distance = Math.floor(intersection.t2 * 100) || 1;
      distance = 100 - distance;
      distance = Number((distance < 10 ? '0' : '')) + distance;

      // create a sort string that makes sure we sort
      // line segment ASC + line segment position DESC (for cropStart)
      // line segment ASC + line segment position ASC (for cropEnd)
      return intersection.segment2 + '#' + distance;
    });

    return roundPoint(intersections[shouldCropFromStart ? 0 : intersections.length - 1]);
  }

  return null;
}

export function getIntersections(pathA: Path, pathB: Path): Intersection[] {
  return findPathIntersections(pathA, pathB);
}