import { useEffect } from 'react';
import { useStore } from '../../store/state';

import { Elements } from '../../types';

interface ElementUpdaterProps {
  elements: Elements;
}

const ElementUpdater = ({ elements }: ElementUpdaterProps) => {
  const setElements = useStore(state => state.setElements);

  useEffect(() => {
    setElements(elements);
  }, [elements]);

  return null;
};

export default ElementUpdater;
