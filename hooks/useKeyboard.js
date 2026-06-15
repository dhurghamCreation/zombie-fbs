import { useState, useEffect } from "react";

export const useKeyboard = () => {
  const [actions, setActions] = useState({ 
    moveForward: false, moveBackward: false, 
    moveLeft: false, moveRight: false, 
    attack: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyW') setActions(prev => ({ ...prev, moveForward: true }));
      if (e.code === 'KeyS') setActions(prev => ({ ...prev, moveBackward: true }));
      if (e.code === 'KeyA') setActions(prev => ({ ...prev, moveLeft: true }));
      if (e.code === 'KeyD') setActions(prev => ({ ...prev, moveRight: true }));
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        setActions(prev => ({ ...prev, attack: true }));
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setActions(prev => ({ ...prev, jump: true }));
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'KeyW') setActions(prev => ({ ...prev, moveForward: false }));
      if (e.code === 'KeyS') setActions(prev => ({ ...prev, moveBackward: false }));
      if (e.code === 'KeyA') setActions(prev => ({ ...prev, moveLeft: false }));
      if (e.code === 'KeyD') setActions(prev => ({ ...prev, moveRight: false }));
      if (e.code === 'Enter' || e.code === 'Space') {
        setActions(prev => ({ ...prev, attack: false }));
      }
      if (e.code === 'Space') {
        setActions(prev => ({ ...prev, jump: false }));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return actions;
};