import { useEffect, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const REFRESH_INTERVAL = 120000; // 2 minutes (increased from 30 seconds)

const RealTimeUpdater = () => {
  const { fetchAllData, lastUpdated, loading } = useData();
  const { isAuthenticated } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Start periodic refresh
    intervalRef.current = setInterval(() => {
      // Only fetch if not already loading to prevent overlapping requests
      if (!loading) {
        fetchAllData().catch(error => {
          console.warn('Real-time update failed:', error);
          // Don't show error to user for background updates
        });
      }
    }, REFRESH_INTERVAL);

    // Listen for visibility change to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && !loading) {
        // Check if data is stale (more than 5 minutes old)
        const now = new Date();
        const lastUpdate = new Date(lastUpdated);
        const timeDiff = now - lastUpdate;
        
        if (timeDiff > 300000) { // 5 minutes (increased from 2 minutes)
          fetchAllData().catch(error => {
            console.warn('Visibility update failed:', error);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for online/offline events
    const handleOnline = () => {
      if (isAuthenticated && !loading) {
        fetchAllData().catch(error => {
          console.warn('Online update failed:', error);
        });
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, fetchAllData, lastUpdated, loading]);

  return null; // This component doesn't render anything
};

export default RealTimeUpdater;
