import React, { useRef, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * A wrapper around ResponsiveContainer that prevents ResizeObserver errors
 * by debouncing resize events and handling edge cases
 */
const StableResponsiveContainer = ({ children, debounceMs = 100, ...props }) => {
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        // Force a re-render after resize to stabilize the container
        if (containerRef.current) {
          const event = new Event('resize');
          window.dispatchEvent(event);
        }
      }, debounceMs);
    };

    // Add resize listener with debouncing
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [debounceMs]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer {...props}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default StableResponsiveContainer;
