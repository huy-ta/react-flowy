import { useCallback } from 'react';
import { useStoreById } from '../store/state';

import { ElementId } from '../types';

export type UpdateNodeInternals = (nodeId: ElementId) => void;

function useUpdateNodeInternals(storeId: string): UpdateNodeInternals {
  const useStore = useStoreById(storeId)!;
  const updateNodeDimensions = useStore(state => state.updateNodeDimensions);

  return useCallback<UpdateNodeInternals>((id: ElementId) => {
    const nodeElement = document.querySelector(`.react-flowy__node[data-id="${id}"]`) as HTMLDivElement;

    if (nodeElement) {
      updateNodeDimensions([{ id, nodeElement, forceUpdate: true }]);
    }
  }, []);
}

export default useUpdateNodeInternals;
