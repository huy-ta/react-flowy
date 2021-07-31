import React, { useEffect, useRef, ReactNode } from 'react';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select, pointer } from 'd3-selection';

import { clamp } from '../../utils';
import useKeyPress from '../../hooks/useKeyPress';
import useResizeHandler from '../../hooks/useResizeHandler';
import { FlowTransform, TranslateExtent, PanOnScrollMode, KeyCode } from '../../types';
import { useStoreById } from '../../store/state';
import { d3SelectionSelector, d3ZoomHandlerSelector, d3ZoomSelector, maxZoomSelector, minZoomSelector, translateExtentSelector } from '../../store/selectors';

interface ZoomPaneProps {
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  panOnScroll?: boolean;
  panOnScrollSpeed?: number;
  panOnScrollMode?: PanOnScrollMode;
  zoomOnDoubleClick?: boolean;
  paneMoveable?: boolean;
  defaultPosition?: [number, number];
  defaultZoom?: number;
  translateExtent?: TranslateExtent;
  onMove?: (flowTransform?: FlowTransform) => void;
  onMoveStart?: (flowTransform?: FlowTransform) => void;
  onMoveEnd?: (flowTransform?: FlowTransform) => void;
  zoomActivationKeyCode?: KeyCode;
  children: ReactNode;
  storeId: string;
}

const viewChanged = (prevTransform: FlowTransform, eventTransform: any): boolean =>
  prevTransform.x !== eventTransform.x ||
  prevTransform.y !== eventTransform.y ||
  prevTransform.zoom !== eventTransform.k;

const eventToFlowTransform = (eventTransform: any): FlowTransform => ({
  x: eventTransform.x,
  y: eventTransform.y,
  zoom: eventTransform.k,
});

const ZoomPane = ({
  onMove,
  onMoveStart,
  onMoveEnd,
  zoomOnScroll = true,
  zoomOnPinch = true,
  panOnScroll = false,
  panOnScrollSpeed = 0.5,
  panOnScrollMode = PanOnScrollMode.Free,
  zoomOnDoubleClick = true,
  paneMoveable = true,
  defaultPosition = [0, 0],
  defaultZoom = 1,
  translateExtent,
  zoomActivationKeyCode,
  children,
  storeId,
}: ZoomPaneProps) => {
  const useStore = useStoreById(storeId)!;
  const minZoom = useStore(minZoomSelector);
  const maxZoom = useStore(maxZoomSelector);
  const d3Selection = useStore(d3SelectionSelector);
  const d3Zoom = useStore(d3ZoomSelector);
  const d3ZoomHandler = useStore(d3ZoomHandlerSelector);
  const translateExtentFromStore = useStore(translateExtentSelector);

  const initD3Zoom = useStore(state => state.initD3Zoom);
  const updateTransform = useStore(state => state.updateTransform);

  const zoomPane = useRef<HTMLDivElement>(null);
  const prevTransform = useRef<FlowTransform>({ x: 0, y: 0, zoom: 0 });

  const zoomActivationKeyPressed = useKeyPress(zoomActivationKeyCode);

  useResizeHandler(zoomPane, storeId);

  useEffect(() => {
    if (!zoomPane.current) return;

    const currentTranslateExtent = typeof translateExtent !== 'undefined' ? translateExtent : translateExtentFromStore;
    const d3ZoomInstance = zoom().scaleExtent([minZoom, maxZoom]).translateExtent(currentTranslateExtent);
    const selection = select(zoomPane.current as Element).call(d3ZoomInstance);

    const clampedX = clamp(defaultPosition[0], currentTranslateExtent[0][0], currentTranslateExtent[1][0]);
    const clampedY = clamp(defaultPosition[1], currentTranslateExtent[0][1], currentTranslateExtent[1][1]);
    const clampedZoom = clamp(defaultZoom, minZoom, maxZoom);
    const updatedTransform = zoomIdentity.translate(clampedX, clampedY).scale(clampedZoom);

    d3ZoomInstance.transform(selection, updatedTransform);

    initD3Zoom({
      d3Zoom: d3ZoomInstance,
      d3Selection: selection,
      d3ZoomHandler: selection.on('wheel.zoom'),
      // we need to pass transform because zoom handler is not registered when we set the initial transform
      transform: [clampedX, clampedY, clampedZoom],
    });
  }, []);

  useEffect(() => {
    if (!d3Selection || !d3Zoom) return;

    if (panOnScroll && !zoomActivationKeyPressed.current) {
      d3Selection
        .on('wheel', (event: WheelEvent) => {
          event.preventDefault();
          event.stopImmediatePropagation();

          const currentZoom = d3Selection.property('__zoom').k || 1;

          if (event.ctrlKey && zoomOnPinch) {
            const point = pointer(event);
            // taken from https://github.com/d3/d3-zoom/blob/master/src/zoom.js
            const pinchDelta = -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) * 10;
            const zoom = currentZoom * Math.pow(2, pinchDelta);
            d3Zoom.scaleTo(d3Selection, zoom, point);

            return;
          }

          // increase scroll speed in firefox
          // firefox: deltaMode === 1; chrome: deltaMode === 0
          const deltaNormalize = event.deltaMode === 1 ? 20 : 1;
          const deltaX = panOnScrollMode === PanOnScrollMode.Vertical ? 0 : event.deltaX * deltaNormalize;
          const deltaY = panOnScrollMode === PanOnScrollMode.Horizontal ? 0 : event.deltaY * deltaNormalize;

          d3Zoom.translateBy(
            d3Selection,
            -(deltaX / currentZoom) * panOnScrollSpeed,
            -(deltaY / currentZoom) * panOnScrollSpeed
          );
        })
        .on('wheel.zoom', null);
    } else if (typeof d3ZoomHandler !== 'undefined') {
      d3Selection.on('wheel', null).on('wheel.zoom', d3ZoomHandler);
    }
  }, [panOnScroll, panOnScrollMode, d3Selection, d3Zoom, d3ZoomHandler, zoomActivationKeyPressed, zoomOnPinch]);

  useEffect(() => {
    if (d3Zoom) {
      d3Zoom.on('zoom', (event: any) => {
        updateTransform([event.transform.x, event.transform.y, event.transform.k]);

        if (onMove) {
          const flowTransform = eventToFlowTransform(event.transform);
          onMove(flowTransform);
        }
      });
    }
  }, [d3Zoom, updateTransform, onMove]);

  useEffect(() => {
    if (d3Zoom) {
      if (onMoveStart) {
        d3Zoom.on('start', (event: any) => {
          if (viewChanged(prevTransform.current, event.transform)) {
            const flowTransform = eventToFlowTransform(event.transform);
            prevTransform.current = flowTransform;

            onMoveStart(flowTransform);
          }
        });
      } else {
        d3Zoom.on('start', null);
      }
    }
  }, [d3Zoom, onMoveStart]);

  useEffect(() => {
    if (d3Zoom) {
      if (onMoveEnd) {
        d3Zoom.on('end', (event: any) => {
          if (viewChanged(prevTransform.current, event.transform)) {
            const flowTransform = eventToFlowTransform(event.transform);
            prevTransform.current = flowTransform;

            onMoveEnd(flowTransform);
          }
        });
      } else {
        d3Zoom.on('end', null);
      }
    }
  }, [d3Zoom, onMoveEnd]);

  useEffect(() => {
    if (d3Zoom) {
      d3Zoom.filter((event: any) => {
        const zoomScroll = zoomActivationKeyPressed.current || zoomOnScroll;
        const pinchZoom = zoomOnPinch && event.ctrlKey;

        // if all interactions are disabled, we prevent all zoom events
        if (!paneMoveable && !zoomScroll && !panOnScroll && !zoomOnDoubleClick && !zoomOnPinch) {
          return false;
        }

        // if zoom on double click is disabled, we prevent the double click event
        if (!zoomOnDoubleClick && event.type === 'dblclick') {
          return false;
        }

        if (event.target.closest('.nowheel') && event.type === 'wheel') {
          return false;
        }

        // when the target element is a node, we still allow zooming
        if (
          (event.target.closest('.react-flowy__node') || event.target.closest('.react-flowy__edge')) &&
          event.type !== 'wheel'
        ) {
          return false;
        }

        if (!zoomOnPinch && event.ctrlKey && event.type === 'wheel') {
          return false;
        }

        // when there is no scroll handling enabled, we prevent all wheel events
        if (!zoomScroll && !panOnScroll && !pinchZoom && event.type === 'wheel') {
          return false;
        }

        // if the pane is not movable, we prevent dragging it with mousestart or touchstart
        if (!paneMoveable && (event.type === 'mousedown' || event.type === 'touchstart')) {
          return false;
        }

        // default filter for d3-zoom
        return (!event.ctrlKey || event.type === 'wheel') && !event.button;
      });
    }
  }, [
    d3Zoom,
    zoomOnScroll,
    zoomOnPinch,
    panOnScroll,
    zoomOnDoubleClick,
    paneMoveable,
  ]);

  return (
    <div className="react-flowy__renderer react-flowy__zoompane" ref={zoomPane}>
      {children}
    </div>
  );
};

export default ZoomPane;
