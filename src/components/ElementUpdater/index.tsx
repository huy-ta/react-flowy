import { useEffect } from 'react';

import { setElements } from '../../store/actions';
import { Elements } from '../../types';

interface ElementUpdaterProps {
  elements: Elements;
}

const ElementUpdater = ({ elements }: ElementUpdaterProps) => {
  useEffect(() => {
    setElements(elements);
  }, [elements]);

  return null;
};

export default ElementUpdater;
