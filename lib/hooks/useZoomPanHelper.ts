import { useMemo } from 'react';
import { zoomIdentity } from 'd3-zoom';


import { useStore } from '../store/state';
import { getTransformForBounds } from '../utils/graph';
import { getRectOfNodes } from '../utils/node';
import { FlowTransform, Rectangle, Point } from '../types';
import { pointToCanvasCoordinates } from '../utils/coordinates';
import { d3SelectionSelector, d3ZoomSelector, heightSelector, maxZoomSelector, minZoomSelector, nodesSelector, snapGridSelector, snapToGridSelector, transformSelector, widthSelector } from '../store/selectors';

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
  const d3Zoom = useStore(d3ZoomSelector);
  const d3Selection = useStore(d3SelectionSelector);
  const width = useStore(widthSelector);
  const height = useStore(heightSelector);
  const minZoom = useStore(minZoomSelector);
  const maxZoom = useStore(maxZoomSelector);
  const transform = useStore(transformSelector);
  const snapToGrid = useStore(snapToGridSelector);
  const snapGrid = useStore(snapGridSelector);
  const nodes = useStore(nodesSelector);

  const zoomPanHelperFunctions = useMemo<ZoomPanHelperFunctions>(() => {
    if (!d3Selection || !d3Zoom) return initialZoomPanHelper;

    return {
      zoomIn: () => d3Zoom!.scaleBy(d3Selection, 1.2),
      zoomOut: () => d3Zoom!.scaleBy(d3Selection, 1 / 1.2),
      zoomTo: (zoomLevel: number) => d3Zoom!.scaleTo(d3Selection, zoomLevel),
      transform: (transform: FlowTransform) => {
        const nextTransform = zoomIdentity.translate(transform.x, transform.y).scale(transform.zoom);

        d3Zoom!.transform(d3Selection, nextTransform);
      },
      fitView: (options: FitViewParams = { padding: DEFAULT_PADDING, includeHiddenNodes: false }) => {
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

        d3Zoom!.transform(d3Selection, transform);
      },
      setCenter: (x: number, y: number, zoom?: number) => {
        const nextZoom = typeof zoom !== 'undefined' ? zoom : maxZoom;
        const centerX = width / 2 - x * nextZoom;
        const centerY = height / 2 - y * nextZoom;
        const transform = zoomIdentity.translate(centerX, centerY).scale(nextZoom);

        d3Zoom!.transform(d3Selection, transform);
      },
      fitBounds: (bounds: Rectangle, padding = DEFAULT_PADDING) => {
        const [x, y, zoom] = getTransformForBounds(bounds, width, height, minZoom, maxZoom, padding);
        const transform = zoomIdentity.translate(x, y).scale(zoom);

        d3Zoom!.transform(d3Selection, transform);
      },
      project: (position: Point) => {
        return pointToCanvasCoordinates(position, transform, snapToGrid, snapGrid);
      },
      initialized: true,
    };
  }, [d3Zoom, d3Selection, width, height, minZoom, maxZoom, transform, snapToGrid, snapGrid, nodes]);

  return zoomPanHelperFunctions;
};

export default useZoomPanHelper;
