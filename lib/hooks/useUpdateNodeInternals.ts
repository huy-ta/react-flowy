import { useCallback } from 'react';
import { updateNodeDimensions } from '../store/actions';

import { ElementId } from '../types';

export type UpdateNodeInternals = (nodeId: ElementId) => void;

function useUpdateNodeInternals(): UpdateNodeInternals {
  return useCallback<UpdateNodeInternals>((id: ElementId) => {
    const nodeElement = document.querySelector(`.react-flowy__node[data-id="${id}"]`) as HTMLDivElement;

    if (nodeElement) {
      updateNodeDimensions([{ id, nodeElement, forceUpdate: true }]);
    }
  }, []);
}

export default useUpdateNodeInternals;
