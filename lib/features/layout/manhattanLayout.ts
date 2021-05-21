import { getOrientation, filterRedundantWaypoints } from './utils';
import { getMidPointOfRectangle, isPointInRect, getPointDistance, arePointsAligned } from '../../utils/geometry';
import { Segment, Point, Rectangle, Orientation, LayoutType, Directions, Hints } from '../../types';

const MIN_SEGMENT_LENGTH = 20;
const POINT_ORIENTATION_PADDING = 5;
const INTERSECTION_THRESHOLD = 20;
const ORIENTATION_THRESHOLD = {
  [LayoutType.HORIZONTAL_HORIZONTAL]: 20,
  [LayoutType.VERTICAL_VERTICAL]: 20,
  [LayoutType.HORIZONTAL_VERTICAL]: -10,
  [LayoutType.VERTICAL_HORIZONTAL]: -10,
  [LayoutType.STRAIGHT]: 0,
};

function needsTurn(orientation: Orientation, startDirection: string) {
  return !{
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /./,
    v: /./
  }[startDirection]!.test(orientation);
}

function canLayoutStraight(direction: string, targetOrientation: Orientation) {
  return {
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /left|right/,
    v: /top|bottom/
  }[direction]!.test(targetOrientation);
}

function getSegmentBendpoints(sourcePoint: Point, targetPoint: Point, directions: Directions) {
  let orientation = getOrientation(targetPoint, sourcePoint, POINT_ORIENTATION_PADDING);

  let startDirection = directions.split(':')[0];

  const xMid = Math.round((targetPoint.x - sourcePoint.x) / 2 + sourcePoint.x);
  const yMid = Math.round((targetPoint.y - sourcePoint.y) / 2 + sourcePoint.y);

  let segmentEnd, segmentDirections;

  let layoutStraight = canLayoutStraight(startDirection, orientation),
      layoutHorizontal = /h|r|l/.test(startDirection),
      layoutTurn = false;

  let turnNextDirections = false;

  if (layoutStraight) {
    segmentEnd = layoutHorizontal ? { x: xMid, y: sourcePoint.y } : { x: sourcePoint.x, y: yMid };

    segmentDirections = layoutHorizontal ? Directions.HORIZONTAL_HORIZONTAL : Directions.VERTICAL_VERTICAL;
  } else {
    layoutTurn = needsTurn(orientation, startDirection);

    segmentDirections = layoutHorizontal ? Directions.HORIZONTAL_VERTICAL : Directions.VERTICAL_HORIZONTAL;

    if (layoutTurn) {

      if (layoutHorizontal) {
        turnNextDirections = yMid === sourcePoint.y;

        segmentEnd = {
          x: sourcePoint.x + MIN_SEGMENT_LENGTH * (/l/.test(startDirection) ? -1 : 1),
          y: turnNextDirections ? yMid + MIN_SEGMENT_LENGTH : yMid
        };
      } else {
        turnNextDirections = xMid === sourcePoint.x;

        segmentEnd = {
          x: turnNextDirections ? xMid + MIN_SEGMENT_LENGTH : xMid,
          y: sourcePoint.y + MIN_SEGMENT_LENGTH * (/t/.test(startDirection) ? -1 : 1)
        };
      }

    } else {
      segmentEnd = {
        x: xMid,
        y: yMid
      };
    }
  }

  return {
    waypoints: getBendpoints(sourcePoint, segmentEnd, segmentDirections).concat(segmentEnd),
    directions:  segmentDirections,
    turnNextDirections: turnNextDirections
  };
}

function getStartSegment(a: Point, b: Point, directions: Directions) {
  return getSegmentBendpoints(a, b, directions);
}

function getEndSegment(a: Point, b: Point, directions: Directions) {
  let invertedSegment = getSegmentBendpoints(b, a, invertDirections(directions));

  return {
    waypoints: invertedSegment.waypoints.slice().reverse(),
    directions: invertDirections(invertedSegment.directions),
    turnNextDirections: invertedSegment.turnNextDirections
  };
}


function getMidSegment(startSegment: Segment, endSegment: Segment) {
  let startDirection = startSegment.directions.split(':')[1];
  let endDirection = endSegment.directions.split(':')[0];

  if (startSegment.turnNextDirections) {
    startDirection = startDirection == 'h' ? 'v' : 'h';
  }

  if (endSegment.turnNextDirections) {
    endDirection = endDirection == 'h' ? 'v' : 'h';
  }

  let directions = startDirection + ':' + endDirection as Directions;

  let bendpoints = getBendpoints(
    startSegment.waypoints[startSegment.waypoints.length - 1],
    endSegment.waypoints[0],
    directions
  );

  return {
    waypoints: bendpoints,
    directions: directions
  };
}

function invertDirections(directions: Directions): Directions {
  return directions.split(':').reverse().join(':') as Directions;
}

/**
 * Handle simple layouts with maximum two bendpoints.
 */
function getSimpleBendpoints(pointA: Point, pointB: Point, directions: Directions) {
  const xMid = Math.round((pointB.x - pointA.x) / 2 + pointA.x);
  const yMid = Math.round((pointB.y - pointA.y) / 2 + pointA.y);

  // one point, right or left from a
  if (directions === Directions.HORIZONTAL_VERTICAL) {
    return [ { x: pointB.x, y: pointA.y } ];
  }

  // one point, above or below a
  if (directions === Directions.VERTICAL_HORIZONTAL) {
    return [ { x: pointA.x, y: pointB.y } ];
  }

  // vertical segment between a and b
  if (directions === Directions.HORIZONTAL_HORIZONTAL) {
    return [
      { x: xMid, y: pointA.y },
      { x: xMid, y: pointB.y }
    ];
  }

  // horizontal segment between a and b
  if (directions === Directions.VERTICAL_VERTICAL) {
    return [
      { x: pointA.x, y: yMid },
      { x: pointB.x, y: yMid }
    ];
  }

  throw new Error('invalid directions: can only handle letians of [hv]:[hv]');
}


/**
 * Returns the mid points for a manhattan connection between two points.
 *
 * @example h:h (horizontal:horizontal)
 *
 * [a]----[x]
 *         |
 *        [x]----[b]
 *
 * @example h:v (horizontal:vertical)
 *
 * [a]----[x]
 *         |
 *        [b]
 *
 * @example h:r (horizontal:right)
 *
 * [a]----[x]
 *         |
 *    [b]-[x]
 *
 * @param  {Point} pointA
 * @param  {Point} pointB
 * @param  {string} directions
 *
 * @return {Point[]}
 */
function getBendpoints(pointA: Point, pointB: Point, directions: Directions = Directions.HORIZONTAL_HORIZONTAL): Point[] {
  if (!isValidDirections(directions)) {
    throw new Error(
      'unknown directions: <' + directions + '>: ' +
      'must be specified as <start>:<end> ' +
      'with start/end in { h,v,t,r,b,l }'
    );
  }

  // compute explicit directions, involving trbl dockings
  // using a three segmented layouting algorithm
  if (isExplicitDirections(directions)) {
    const startSegment = getStartSegment(pointA, pointB, directions);
    const endSegment = getEndSegment(pointA, pointB, directions);
    const midSegment = getMidSegment(startSegment, endSegment);

    return [...startSegment.waypoints, ...midSegment.waypoints, ...endSegment.waypoints]
  }

  // handle simple [hv]:[hv] cases that can be easily computed
  return getSimpleBendpoints(pointA, pointB, directions);
}

/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param {Point} sourcePoint
 * @param {Point} targetPoint
 *
 * @param {string} [directions='h:h'] specifies manhattan directions for each point as {adirection}:{bdirection}.
                   A directionfor a point is either `h` (horizontal) or `v` (vertical)
 *
 * @return {Point[]}
 */
export function connectPoints(sourcePoint: Point, targetPoint: Point, directions: Directions = Directions.HORIZONTAL_HORIZONTAL) {
  let points = getBendpoints(sourcePoint, targetPoint, directions);

  points.unshift(sourcePoint);
  points.push(targetPoint);

  return filterRedundantWaypoints(points);
}

const CHANGED_DOCKING_POINT_THRESHOLD = 16;

/**
 * Connect two rectangles using a manhattan layouted connection.
 *
 * @param {Rectangle} sourceRectangle source rectangle
 * @param {Rectangle} targetRectangle target rectangle
 * @param {Point} [startPoint] source docking
 * @param {Point} [endPoint] target docking
 *
 * @param {Hints} [hints]
 * @param {string} [hints.preserveDocking=source] preserve docking on selected side
 * @param {LayoutType[]} [hints.preferredLayouts]
 * @param {Point|boolean} [hints.connectionStart] whether the start changed
 * @param {Point|boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Point[]} connection points
 */
export function connectRectangles(sourceRectangle: Rectangle, targetRectangle: Rectangle, startPoint?: Point, endPoint?: Point, hints?: Hints) {
  const preferredLayouts = hints && hints.preferredLayouts || [];
  const preferredLayout = preferredLayouts.filter(layout => layout !== LayoutType.STRAIGHT)[0] || LayoutType.HORIZONTAL_HORIZONTAL;
  const threshold = ORIENTATION_THRESHOLD[preferredLayout] || 0;
  const orientation = getOrientation(sourceRectangle, targetRectangle, threshold);
  const directions = getDirections(orientation, preferredLayout);

  startPoint = startPoint || getMidPointOfRectangle(sourceRectangle);
  endPoint = endPoint || getMidPointOfRectangle(targetRectangle);

  const directionSplit = directions.split(':');

  // compute actual docking points for start / end
  // this ensures we properly layout only parts of the
  // connection that lies in between the two rectangles
  const { dockingPoint: startDockingPoint } = getDockingPoint(startPoint, sourceRectangle, directionSplit[0], invertOrientation(orientation));
  const { dockingPoint: endDockingPoint, changedDockingPoint: changedEndDockingPoint, direction: endDirection } = getDockingPoint(endPoint, targetRectangle, directionSplit[1], orientation);

  if (changedEndDockingPoint && (
    (endDirection === 'b' && getMidPointOfRectangle(sourceRectangle).y > (targetRectangle.y + targetRectangle.height) + CHANGED_DOCKING_POINT_THRESHOLD) ||
    (endDirection === 't' && getMidPointOfRectangle(sourceRectangle).y < (targetRectangle.y) - CHANGED_DOCKING_POINT_THRESHOLD)
  )) {
    return connectPoints(startDockingPoint, changedEndDockingPoint, Directions.HORIZONTAL_VERTICAL);
  }

  return connectPoints(startDockingPoint, endDockingPoint, directions);
}

/**
 * Connect a rectangle to a point using a manhattan layouted connection.
 *
 * @param {Rectangle} sourceRectangle source rectangle
 * @param {Rectangle} targetPoint target point
 * @param {Point} [startPoint] source docking
 *
 * @param {Hints} [hints]
 * @param {string} [hints.preserveDocking=source] preserve docking on selected side
 * @param {LayoutType[]} [hints.preferredLayouts]
 * @param {Point|boolean} [hints.connectionStart] whether the start changed
 * @param {Point|boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Point[]} connection points
 */
export function connectRectangleToPoint(sourceRectangle: Rectangle, targetPoint: Point, startPoint?: Point, hints?: Hints) {
  const preferredLayouts = hints && hints.preferredLayouts || [];
  const preferredLayout = preferredLayouts.filter(layout => layout !== LayoutType.STRAIGHT)[0] || LayoutType.HORIZONTAL_HORIZONTAL;
  const threshold = ORIENTATION_THRESHOLD[preferredLayout] || 0;
  const orientation = getOrientation(sourceRectangle, targetPoint, threshold);
  const directions = getDirections(orientation, preferredLayout);

  startPoint = startPoint || getMidPointOfRectangle(sourceRectangle);

  const directionSplit = directions.split(':');

  // compute actual docking points for start / end
  // this ensures we properly layout only parts of the
  // connection that lies in between the two rectangles
  const { dockingPoint: startDockingPoint } = getDockingPoint(startPoint, sourceRectangle, directionSplit[0], invertOrientation(orientation));

  return connectPoints(startDockingPoint, targetPoint, directions);
}

/**
 * Repair the connection between two rectangles, of which one has been updated.
 *
 * @param {Rectangle} sourceRectangle
 * @param {Rectangle} targetRectangle
 * @param {Point} [startPoint]
 * @param {Point} [endPoint]
 * @param {Point[]} [waypoints]
 * @param {Hints} [hints]
 *
 * @return {Point[]} repaired waypoints
 */
export function repairConnection(sourceRectangle: Rectangle, targetRectangle: Rectangle, startPoint?: Point, endPoint?: Point, waypoints: Point[] = [], hints?: Hints) {
  if (Array.isArray(startPoint)) {
    waypoints = startPoint;
    startPoint = getMidPointOfRectangle(sourceRectangle);
    endPoint = getMidPointOfRectangle(targetRectangle);
  }

  hints = { preferredLayouts: [], ...hints };

  const { preferredLayouts } = hints;
  const isStraightPreferred = preferredLayouts?.includes(LayoutType.STRAIGHT);

  // just layout non-existing or simple connections
  // attempt to render straight lines, if required

  // attempt to layout a straight line
  let repairedWaypoints = isStraightPreferred && tryLayoutStraight(sourceRectangle, targetRectangle, startPoint!, endPoint!, hints);

  if (repairedWaypoints) {
    return repairedWaypoints;
  }

  // try to layout from end
  repairedWaypoints = hints.connectionEnd && tryRepairConnectionEnd(targetRectangle, sourceRectangle, endPoint!, waypoints);

  if (repairedWaypoints) {
    return filterRedundantWaypoints(repairedWaypoints);
  }

  // try to layout from start
  repairedWaypoints = hints.connectionStart && tryRepairConnectionStart(sourceRectangle, targetRectangle, startPoint!, waypoints);

  if (repairedWaypoints) {
    return filterRedundantWaypoints(repairedWaypoints);
  }

  // or whether nothing seems to have changed
  if (!hints.connectionStart && !hints.connectionEnd && waypoints && waypoints.length) {
    return waypoints;
  }

  // simply reconnect if nothing else worked
  return connectRectangles(sourceRectangle, targetRectangle, startPoint, endPoint, hints);
}


function isBetween(numberToCheck: number, start: number, end: number) {
  return numberToCheck >= start && numberToCheck <= end;
}

function isInRange(axis: 'x' | 'y', point: Point, rectangle: Rectangle) {
  const size: { x: 'width', y: 'height' } = { x: 'width', y: 'height' };

  return isBetween(point[axis], rectangle[axis], rectangle[axis] + rectangle[size[axis]]);
}

/**
 * Layout a straight connection
 *
 * @param {Rectangle} sourceRectangle
 * @param {Rectangle} targetRectangle
 * @param {Point} startPoint
 * @param {Point} endPoint
 * @param {Object} [hints]
 *
 * @return {Point[]|null} waypoints if straight layout worked
 */
export function tryLayoutStraight(sourceRectangle: Rectangle, targetRectangle: Rectangle, startPoint: Point, endPoint: Point, hints?: Hints) {
  let axis: { x?: number, y?: number } = {};
  let primaryAxis: 'x' | 'y';
  let orientation: string;

  orientation = getOrientation(sourceRectangle, targetRectangle);

  // only layout a straight connection if shapes are
  // horizontally or vertically aligned
  if (!/^(top|bottom|left|right)$/.test(orientation)) {
    return null;
  }

  primaryAxis = /top|bottom/.test(orientation) ? 'x' : /left|right/.test(orientation) ? 'y' : 'x';

  if (hints?.preserveDocking === 'target') {
    if (!isInRange(primaryAxis, endPoint, sourceRectangle)) {
      return null;
    }

    axis[primaryAxis] = endPoint[primaryAxis];

    return [
      {
        x: axis.x !== undefined ? axis.x : startPoint.x,
        y: axis.y !== undefined ? axis.y : startPoint.y,
        original: {
          x: axis.x !== undefined ? axis.x : startPoint.x,
          y: axis.y !== undefined ? axis.y : startPoint.y
        }
      },
      {
        x: endPoint.x,
        y: endPoint.y
      }
    ];
  }

  if (!isInRange(primaryAxis, startPoint, targetRectangle)) {
    return null;
  }

  axis[primaryAxis] = startPoint[primaryAxis];

  return [
    {
      x: startPoint.x,
      y: startPoint.y
    },
    {
      x: axis.x !== undefined ? axis.x : endPoint.x,
      y: axis.y !== undefined ? axis.y : endPoint.y,
      original: {
        x: axis.x !== undefined ? axis.x : endPoint.x,
        y: axis.y !== undefined ? axis.y : endPoint.y
      }
    }
  ];
}

/**
 * Repair a connection from start.
 *
 * @param {Rectangle} moved
 * @param {Rectangle} other
 * @param {Point} newDocking
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]|null} the repaired points between the two rectangles
 */
function tryRepairConnectionStart(moved: Rectangle, other: Rectangle, newDocking: Point, points: Point[]) {
  return _tryRepairConnectionSide(moved, other, newDocking, points);
}

/**
 * Repair a connection from end.
 *
 * @param {Rectangle} moved
 * @param {Rectangle} other
 * @param {Point} newDocking
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]|null} the repaired points between the two rectangles
 */
function tryRepairConnectionEnd(moved: Rectangle, other: Rectangle, newDocking: Point, points: Point[]) {
  let waypoints = points.slice().reverse();

  waypoints = _tryRepairConnectionSide(moved, other, newDocking, waypoints) as Point[];

  return waypoints ? waypoints.reverse() : null;
}

/**
 * Repair a connection from one side that moved.
 *
 * @param {Rectangle} movedRectangle
 * @param {Rectangle} otherRectangle
 * @param {Point} newDockingPoint
 * @param {Point[]} points originalPoints from moved to other
 *
 * @return {Point[]} the repaired points between the two rectangles
 */
function _tryRepairConnectionSide(movedRectangle: Rectangle, otherRectangle: Rectangle, newDockingPoint: Point, points: Point[]) {
  function isRelayoutNeeded(points: Point[]) {
    if (points.length < 3) {
      return true;
    }

    if (points.length > 4) {
      return false;
    }

    // relayout if two points overlap
    // this is most likely due to
    return !!points.find((point, index) => {
      const previousPoint = points[index - 1];

      return previousPoint && getPointDistance(point, previousPoint) < 3;
    });
  }

  function repairBendpoint(candidate: Point, oldPeer: Point, newPeer: Point) {
    const alignment = arePointsAligned(oldPeer, candidate);

    switch (alignment) {
      case 'v':
        // repair horizontal alignment
        return { x: newPeer.x, y: candidate.y };
      case 'h':
        // repair vertical alignment
        return { x: candidate.x, y: newPeer.y };
    }

    return { x: candidate.x, y: candidate.y };
  }

  function removeOverlapping(points: Point[], rectangleA: Rectangle, rectangleB: Rectangle) {
    // intersects (?) break, remove all bendpoints up to this one and relayout
    if (isPointInRect(points[1], rectangleA, INTERSECTION_THRESHOLD) ||
        isPointInRect(points[1], rectangleB, INTERSECTION_THRESHOLD)) {
      // return sliced old connection
      return points.slice(1);
    }

    return points;
  }

  // (0) only repair what has layoutable bendpoints

  // (1) if only one bendpoint and on shape moved onto other shapes axis
  //     (horizontally / vertically), relayout
  if (isRelayoutNeeded(points)) {
    return null;
  }

  let oldDockingPoint = points[0];
  let newPoints = points.slice();
  let slicedPoints;

  // (2) repair only last line segment and only if it was layouted before

  newPoints[0] = newDockingPoint;
  newPoints[1] = repairBendpoint(newPoints[1], oldDockingPoint, newDockingPoint);

  // (3) if shape intersects with any bendpoint after repair,
  //     remove all segments up to this bendpoint and repair from there
  slicedPoints = removeOverlapping(newPoints, movedRectangle, otherRectangle);

  if (slicedPoints !== newPoints) {
    newPoints = connectRectangles(movedRectangle, otherRectangle) as Point[];
  }

  // (4) do NOT repair if repaired bendpoints are aligned
  if (newPoints && arePointsAligned(newPoints)) {
    return null;
  }

  return newPoints;
}


/**
 * Returns the manhattan directions connecting two rectangles
 * with the given orientation.
 *
 * Will always return the default layout, if it is specific
 * regarding sides already (trbl).
 *
 * @example
 *
 * getDirections('top'); // -> 'v:v'
 * getDirections('intersect'); // -> 't:t'
 *
 * getDirections('top-right', 'v:h'); // -> 'v:h'
 * getDirections('top-right', 'h:h'); // -> 'h:h'
 *
 *
 * @param {Orientation} orientation
 * @param {LayoutType} defaultLayout
 *
 * @return {Directions}
 */
function getDirections(orientation: Orientation, defaultLayout: LayoutType): Directions {
  // don't override specific trbl directions
  if (isExplicitDirections(defaultLayout)) {
    return defaultLayout as unknown as Directions;
  }

  switch (orientation) {
    case Orientation.INTERSECT:
      return Directions.INTERSECT;

    case Orientation.TOP:
    case Orientation.BOTTOM:
      return Directions.VERTICAL_VERTICAL;

    case Orientation.LEFT:
    case Orientation.RIGHT:
      return Directions.HORIZONTAL_HORIZONTAL;

    // 'top-left'
    // 'top-right'
    // 'bottom-left'
    // 'bottom-right'
    default:
      return defaultLayout as unknown as Directions;
  }
}

function isValidDirections(directions: string) {
  return directions && /^h|v|t|r|b|l:h|v|t|r|b|l$/.test(directions);
}

function isExplicitDirections(directions: string) {
  return directions && /t|r|b|l/.test(directions);
}

function invertOrientation(orientation: Orientation): Orientation {
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

function getDockingPoint(point: Point, rectangle: Rectangle, dockingDirection: string, targetOrientation: string) {
  // ensure we end up with a specific docking direction
  // based on the targetOrientation, if <h|v> is being passed

  if (dockingDirection === 'h') {
    dockingDirection = /left/.test(targetOrientation) ? 'l' : 'r';
  }

  if (dockingDirection === 'v') {
    dockingDirection = /top/.test(targetOrientation) ? 't' : 'b';
  }

  const relativeXPosToRectangleRatio = Math.abs(point.x - rectangle.x) / rectangle.width;
  const relativeYPosToRectangleRatio = Math.abs(point.y - rectangle.y) / rectangle.height;

  if (dockingDirection === 't') {
    return {
      dockingPoint: { original: point, x: point.x, y: rectangle.y },
      direction: 't',
    };
  }

  if (dockingDirection === 'r') {
    if (relativeXPosToRectangleRatio <= 0.9) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { original: point, x: rectangle.x + rectangle.width, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: rectangle.y + rectangle.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { original: point, x: rectangle.x + rectangle.width, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: rectangle.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { original: point, x: rectangle.x + rectangle.width, y: point.y },
      direction: 'r',
    };
  }

  if (dockingDirection === 'b') {
    return {
      dockingPoint: { original: point, x: point.x, y: rectangle.y + rectangle.height },
      direction: 'b',
    }
  }

  if (dockingDirection === 'l') {
    if (relativeXPosToRectangleRatio >= 0.1) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { original: point, x: rectangle.x, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: rectangle.y + rectangle.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { original: point, x: rectangle.x, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: rectangle.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { original: point, x: rectangle.x, y: point.y },
      direction: 'l',
    };
  }

  throw new Error('unexpected dockingDirection: <' + dockingDirection + '>');
}
