import { useEffect, RefObject } from 'react';

type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

export function useResizeObserver(
  ref: RefObject<Element>,
  callback: ResizeObserverCallback
) {
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new ResizeObserver(callback);
    observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
    };
  }, [ref, callback]);
} 