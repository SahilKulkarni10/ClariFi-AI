import React, { useMemo, useRef, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';
import ChartErrorBoundary from './ChartErrorBoundary';

/**
 * A stabilized chart container that prevents ResizeObserver errors
 * by memoizing data and debouncing updates
 */
const StabilizedChart = ({ 
  data = [], 
  children, 
  width = "100%", 
  height = 300,
  debounceMs = 150,
  ...props 
}) => {
  const lastDataRef = useRef(data);
  const timeoutRef = useRef(null);

  // Memoize data to prevent unnecessary re-renders
  const stableData = useMemo(() => {
    // Only update data if it has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastDataRef.current);
    
    if (hasChanged) {
      // Clear any pending updates
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Debounce the data update
      timeoutRef.current = setTimeout(() => {
        lastDataRef.current = data;
      }, debounceMs);
      
      return data;
    }
    
    return lastDataRef.current;
  }, [data, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if data is empty or invalid
  if (!stableData || !Array.isArray(stableData) || stableData.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#999', fontSize: '14px' }}>No data available</span>
      </div>
    );
  }

  return (
    <ChartErrorBoundary height={height}>
      <ResponsiveContainer width={width} height={height} {...props}>
        {children}
      </ResponsiveContainer>
    </ChartErrorBoundary>
  );
};

export default StabilizedChart;
