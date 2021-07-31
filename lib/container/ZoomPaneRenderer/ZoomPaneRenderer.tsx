import React, { useCallback, ReactNode, WheelEvent, MouseEvent } from 'react';

import { ElementRendererProps } from '../ElementRenderer';
import ZoomPane from './ZoomPane';

interface FlowRendererProps
  extends Omit<
    ElementRendererProps,
    | 'elements'
    | 'snapToGrid'
    | 'nodeTypes'
    | 'edgeTypes'
    | 'snapGrid'
    | 'arrowHeadColor'
    | 'onlyRenderVisibleElements'
  > {
  children: ReactNode;
}

const ZoomPaneRenderer = ({
  children,
  onPaneClick,
  onPaneContextMenu,
  onPaneScroll,
  onMove,
  onMoveStart,
  onMoveEnd,
  zoomActivationKeyCode,
  zoomOnScroll,
  zoomOnPinch,
  panOnScroll,
  panOnScrollSpeed,
  panOnScrollMode,
  zoomOnDoubleClick,
  paneMoveable,
  defaultPosition,
  defaultZoom,
  translateExtent,
  storeId,
}: FlowRendererProps) => {
  const onClick = useCallback(
    (event: MouseEvent) => {
      onPaneClick?.(event);
    },
    [onPaneClick]
  );

  const onContextMenu = useCallback(
    (event: MouseEvent) => {
      onPaneContextMenu?.(event);
    },
    [onPaneContextMenu]
  );

  const onWheel = useCallback(
    (event: WheelEvent) => {
      onPaneScroll?.(event);
    },
    [onPaneScroll]
  );

  return (
    <ZoomPane
      onMove={onMove}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      zoomOnScroll={zoomOnScroll}
      zoomOnPinch={zoomOnPinch}
      panOnScroll={panOnScroll}
      panOnScrollSpeed={panOnScrollSpeed}
      panOnScrollMode={panOnScrollMode}
      zoomOnDoubleClick={zoomOnDoubleClick}
      paneMoveable={paneMoveable}
      defaultPosition={defaultPosition}
      defaultZoom={defaultZoom}
      translateExtent={translateExtent}
      zoomActivationKeyCode={zoomActivationKeyCode}
      storeId={storeId}
    >
      {children}
      <div className="react-flowy__pane" onClick={onClick} onContextMenu={onContextMenu} onWheel={onWheel} />
    </ZoomPane>
  );
};

ZoomPaneRenderer.displayName = 'ZoomPaneRenderer';

export default React.memo(ZoomPaneRenderer);
