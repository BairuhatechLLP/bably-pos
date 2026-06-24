import {useEffect, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';

/**
 * Polls `callback` every `intervalMs` milliseconds, but ONLY while
 * the screen is focused. The interval is cleared automatically when
 * the user navigates away and restarted when they come back.
 *
 * Default interval: 30 seconds
 */
function useAutoRefresh(callback: () => void, intervalMs: number = 30000) {
  const isFocused = useIsFocused();
  const callbackRef = useRef(callback);

  // Keep callbackRef current so the interval always calls the latest version
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isFocused) return;

    const id = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [isFocused, intervalMs]);
}

export default useAutoRefresh;
