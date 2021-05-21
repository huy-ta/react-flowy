import { useRef, useEffect } from 'react';

import { isInputDOMNode } from '../utils';
import { KeyCode } from '../types';

export default (keyCode?: KeyCode) => {
  const isKeyPressed = useRef(false);

  useEffect(() => {
    if (typeof keyCode === 'undefined') return;

    const downHandler = (event: KeyboardEvent) => {
      if (!isInputDOMNode(event) && (event.key === keyCode || event.keyCode === keyCode)) {
        event.preventDefault();

        isKeyPressed.current = true;
      }
    };

    const upHandler = (event: KeyboardEvent) => {
      if (!isInputDOMNode(event) && (event.key === keyCode || event.keyCode === keyCode)) {
        isKeyPressed.current = false;
      }
    };

    const resetHandler = () => isKeyPressed.current = false;

    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    window.addEventListener('blur', resetHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
      window.removeEventListener('blur', resetHandler);
    };
  }, [keyCode, isKeyPressed]);

  return isKeyPressed;
};
