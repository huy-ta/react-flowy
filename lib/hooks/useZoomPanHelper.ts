import { useMemo } from 'react';
import { zoomIdentity } from 'd3-zoom';
import { useSnapshot } from 'valtio';
import { Selection } from 'd3';

import { ReactFlowState, state } from '../store/state';
import { getTransformForBounds } from '../utils/graph';
import { getRectOfNodes } from '../utils/node';
import { FlowTransform, Node, Rectangle, Point } from '../types';
import { pointToCanvasCoordinates } from '../utils/coordinates';

const DEFAULT_PADDING = 0.1;

export type FitViewParams = {
  padding?: number;
  includeHiddenNodes?: boolean;
};

export type FitViewFunc = (fitViewOptions?: FitViewParams) => void;

export interface ZoomPanHelperFunctions {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoomLevel: number) => void;
  transform: (transform: FlowTransform) => void;
  fitView: FitViewFunc;
  setCenter: (x: number, y: number, zoom?: number) => void;
  fitBounds: (bounds: Rectangle, padding?: number) => void;
  project: (point: Point) => Point;
  initialized: boolean;
}

const initialZoomPanHelper: ZoomPanHelperFunctions = {
  zoomIn: () => {},
  zoomOut: () => {},
  zoomTo: (_: number) => {},
  transform: (_: FlowTransform) => {},
  fitView: (_: FitViewParams = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {},
  setCenter: (_: number, __: number) => {},
  fitBounds: (_: Rectangle) => {},
  project: (position: Point) => position,
  initialized: false,
};

const useZoomPanHelper = (): ZoomPanHelperFunctions => {
  const snap = useSnapshot<ReactFlowState>(state);

  const zoomPanHelperFunctions = useMemo<ZoomPanHelperFunctions>(() => {

    if (snap.d3Selection && snap.d3Zoom) {
      const d3Selection = snap.d3Selection as Selection<Element, unknown, null, undefined>;

      return {
        zoomIn: () => snap.d3Zoom!.scaleBy(d3Selection, 1.2),
        zoomOut: () => snap.d3Zoom!.scaleBy(d3Selection, 1 / 1.2),
        zoomTo: (zoomLevel: number) => snap.d3Zoom!.scaleTo(d3Selection, zoomLevel),
        transform: (transform: FlowTransform) => {
          const nextTransform = zoomIdentity.translate(transform.x, transform.y).scale(transform.zoom);

          snap.d3Zoom!.transform(d3Selection, nextTransform);
        },
        fitView: (options: FitViewParams = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {
          const { width, height, minZoom, maxZoom } = snap;
          const nodes = snap.nodes as Node[];
        
          if (!nodes.length) {
            return;
          }

          const bounds = getRectOfNodes(options.includeHiddenNodes ? nodes : nodes.filter(node => !node.isHidden));
          const [x, y, zoom] = getTransformForBounds(
            bounds,
            width,
            height,
            minZoom,
            maxZoom,
            options.padding ?? DEFAULT_PADDING
          );
          const transform = zoomIdentity.translate(x, y).scale(zoom);

          snap.d3Zoom!.transform(d3Selection, transform);
        },
        setCenter: (x: number, y: number, zoom?: number) => {
          const { width, height, maxZoom } = snap;

          const nextZoom = typeof zoom !== 'undefined' ? zoom : maxZoom;
          const centerX = width / 2 - x * nextZoom;
          const centerY = height / 2 - y * nextZoom;
          const transform = zoomIdentity.translate(centerX, centerY).scale(nextZoom);

          snap.d3Zoom!.transform(d3Selection, transform);
        },
        fitBounds: (bounds: Rectangle, padding = DEFAULT_PADDING) => {
          const { width, height, minZoom, maxZoom } = snap;
          const [x, y, zoom] = getTransformForBounds(bounds, width, height, minZoom, maxZoom, padding);
          const transform = zoomIdentity.translate(x, y).scale(zoom);

          snap.d3Zoom!.transform(d3Selection, transform);
        },
        project: (position: Point) => {
          const { transform, snapToGrid, snapGrid } = snap;

          return pointToCanvasCoordinates(position, transform, snapToGrid, snapGrid);
        },
        initialized: true,
      };
    }

    return initialZoomPanHelper;
  }, [snap.d3Zoom, snap.d3Selection]);

  return zoomPanHelperFunctions;
};

export default useZoomPanHelper;
