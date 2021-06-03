import { Point, Shape } from '../../types';
import { findCircleLineIntersections } from '../../utils/intersection';

export function getDockingPointForRectangle(point: Point, shape: Shape, detailedDockingDirection: 't' | 'r' | 'b' | 'l') {
  const relativeXPosToRectangleRatio = Math.abs(point.x - shape.x) / shape.width;
  const relativeYPosToRectangleRatio = Math.abs(point.y - shape.y) / shape.height;

  if (detailedDockingDirection === 't') {
    return {
      dockingPoint: { original: point, x: point.x, y: shape.y },
      direction: 't',
    };
  }

  if (detailedDockingDirection === 'r') {
    if (relativeXPosToRectangleRatio <= 0.9) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { original: point, x: shape.x + shape.width, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: shape.y + shape.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { original: point, x: shape.x + shape.width, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: shape.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { original: point, x: shape.x + shape.width, y: point.y },
      direction: 'r',
    };
  }

  if (detailedDockingDirection === 'b') {
    return {
      dockingPoint: { original: point, x: point.x, y: shape.y + shape.height },
      direction: 'b',
    }
  }

  if (detailedDockingDirection === 'l') {
    if (relativeXPosToRectangleRatio >= 0.1) {
      if (relativeYPosToRectangleRatio >= 2/3) {
        return {
          dockingPoint: { original: point, x: shape.x, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: shape.y + shape.height },
          direction: 'b'
        };
      }

      if (relativeYPosToRectangleRatio <= 1/3) {
        return {
          dockingPoint: { original: point, x: shape.x, y: point.y },
          changedDockingPoint: { original: point, x: point.x, y: shape.y },
          direction: 't'
        };
      }
    }

    return {
      dockingPoint: { original: point, x: shape.x, y: point.y },
      direction: 'l',
    };
  }

  throw new Error('Unexpected dockingDirection: <' + detailedDockingDirection + '>');
}

export function getDockingPointForCircle(point: Point, shape: Shape, detailedDockingDirection: 't' | 'r' | 'b' | 'l') {
  const circleCenter = { x: shape.x + shape.width / 2, y: shape.y + shape.height / 2 };
  const radius = shape.width / 2;

  if (detailedDockingDirection === 't') {
    return {
      dockingPoint: { original: point, ...findCircleLineIntersections(circleCenter, radius)(1, 0, -point.x)[0] },
      direction: 't',
    };
  }

  if (detailedDockingDirection === 'r') {
    return {
      dockingPoint: { original: point, ...findCircleLineIntersections(circleCenter, radius)(0, 1, -point.y)[0] },
      direction: 'r',
    };
  }

  if (detailedDockingDirection === 'b') {
    return {
      dockingPoint: { original: point, ...findCircleLineIntersections(circleCenter, radius)(1, 0, -point.x)[1] },
      direction: 'b',
    }
  }

  if (detailedDockingDirection === 'l') {
    return {
      dockingPoint: { original: point, ...findCircleLineIntersections(circleCenter, radius)(0, 1, -point.y)[1] },
      direction: 'l',
    };
  }

  throw new Error('Unexpected dockingDirection: <' + detailedDockingDirection + '>');
}
