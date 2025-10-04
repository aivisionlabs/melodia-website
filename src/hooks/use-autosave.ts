import { useEffect, useRef } from 'react';

export function useAutosave(
  value: string,
  onSave: () => void,
  delay?: number
) {
  const actualDelay = delay || 1000; // Default 1 second delay
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
