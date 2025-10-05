import { useEffect, useRef } from 'react';
import { AUTOSAVE_CONFIG } from '@/lib/config';

export function useAutosave(
  value: string,
  onSave: () => void,
  delay?: number
) {
  const actualDelay = delay || AUTOSAVE_CONFIG.delay;
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
