import { useEffect, useRef } from 'react';
import { config } from '@/lib/config';

export function useAutosave(
  value: string,
  onSave: () => void,
  delay?: number
) {
  const actualDelay = delay || config.AUTOSAVE.delay;
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  
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
