/**
 * Error handler utilities for common React issues
 */

// Suppress ResizeObserver errors that don't affect functionality
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('ResizeObserver loop completed with undelivered notifications')
  ) {
    // Ignore ResizeObserver errors - they're benign and common in React apps
    return;
  }
  originalError(...args);
};

// Global error handler for ResizeObserver
const resizeObserverErrorHandler = (error) => {
  if (error.message && error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    // Ignore this error - it's a known issue with ResizeObserver
    return true;
  }
  return false;
};

// Add global error event listener
window.addEventListener('error', (event) => {
  if (resizeObserverErrorHandler(event.error)) {
    event.preventDefault();
    event.stopPropagation();
  }
});

// Add unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason.message === 'string') {
    if (resizeObserverErrorHandler(event.reason)) {
      event.preventDefault();
    }
  }
});

export default resizeObserverErrorHandler;
