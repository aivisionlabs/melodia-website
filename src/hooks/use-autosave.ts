import { useEffect, useRef } from 'react';

export function useAutosave(
  value: string,
  onSave: () => void,
  delay?: number
) {
  const { config } = require('@/lib/config');
  const actualDelay = delay || config.AUTOSAVE.delay;
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, actualDelay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, onSave, actualDelay]);
}
