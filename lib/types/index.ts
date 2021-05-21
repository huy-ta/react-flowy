import { CSSProperties, ReactNode } from 'react';

export type ElementId = string;

export type FlowElement<T = any> = Node<T> | Edge<T>;

export type Elements<T = any> = FlowElement<T>[];

export type Transform = [number, number, number];

export interface Point {
  x: number;
  y: number;
  original?: Point;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Box extends Point {
  x2: number;
  y2: number;
}

export interface TRBL {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Segment {
  directions: string;
  waypoints: Point[];
  turnNextDirections: boolean;
}

export interface Connection {
  waypoints: Point[];
  source: Rectangle;
  target: Rectangle;
}


export type SnapGrid = [number, number];

export interface Node<T = any> {
  id: ElementId;
  position: Point;
  type?: string;
  __rf?: any;
  data?: T;
  style?: CSSProperties;
  className?: string;
  isHidden?: boolean;
  draggable?: boolean;
  connectable?: boolean;
}

export enum ArrowHeadType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}

export interface Edge<T = any> {
  id: ElementId;
  type?: string;
  source: ElementId;
  target: ElementId;
  waypoints: Point[];
  isForming?: boolean;
  style?: CSSProperties;
  arrowHeadType?: ArrowHeadType;
  isHidden?: boolean;
  data?: T;
  className?: string;
}

export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
}

export type HandleType = 'source' | 'target';

export type NodeTypesType = { [key: string]: ReactNode };

export type EdgeTypesType = NodeTypesType;

export interface EdgeProps<T = any> {
  id: ElementId;
  source: ElementId;
  target: ElementId;
  waypoints: Point[];
  isForming?: boolean;
  style?: CSSProperties;
  arrowHeadType?: ArrowHeadType;
  markerEndId?: string;
  data?: T;
}

export type FlowTransform = {
  x: number;
  y: number;
  zoom: number;
};

export interface Canvas {
  position: {
    x: number;
    y: number;
  };
  scale: number;
}

export type TranslateExtent = [[number, number], [number, number]];
export type NodeExtent = TranslateExtent;

export type KeyCode = number | string;

export type PathComponent = any[];
export type Path = string | PathComponent[];

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export enum Orientation {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  INTERSECT = 'intersect'
}

export enum Axis {
  X = 'x',
  Y = 'y',
}

export enum LayoutType {
  HORIZONTAL_HORIZONTAL = 'h:h',
  VERTICAL_VERTICAL = 'v:v',
  HORIZONTAL_VERTICAL = 'h:v',
  VERTICAL_HORIZONTAL = 'v:h',
  STRAIGHT = 'straight',
}

export enum Directions {
  HORIZONTAL_HORIZONTAL = 'h:h',
  VERTICAL_VERTICAL = 'v:v',
  HORIZONTAL_VERTICAL = 'h:v',
  VERTICAL_HORIZONTAL = 'v:h',
  STRAIGHT = 'straight',
  INTERSECT = 't:t'
}

export interface Hints {
  preserveDocking?: string;
  preferredLayouts?: LayoutType[];
  connectionStart?: Point | boolean;
  connectionEnd?: Point | boolean;
}

export interface Docking {
  point: Point;
  actual: Point;
  idx: number;
}


export interface ApproxIntersection {
  point: Point;
  bendpoint: boolean;
  index: number;
}


export interface Intersection {
  /**
   * Segment of first path.
   */
  segment1: number;

  /**
   * Segment of first path.
   */
  segment2: number;

  /**
   * The x coordinate.
   */
  x: number;

  /**
   * The y coordinate.
   */
  y: number;

  /**
   * Bezier curve for matching path segment 1.
   */
  bez1: number[];

  /**
   * Bezier curve for matching path segment 2.
   */
  bez2: number[];

  /**
   * Relative position of intersection on path segment1 (0.5 => in middle, 0.0 => at start, 1.0 => at end).
   */
  t1: number;

  /**
   * Relative position of intersection on path segment2 (0.5 => in middle, 0.0 => at start, 1.0 => at end).
   */
  t2: number;
}

export interface DragDelta {
  deltaX: number;
  deltaY: number;
}
