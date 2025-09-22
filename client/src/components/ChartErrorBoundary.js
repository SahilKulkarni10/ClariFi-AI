import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error, but don't show ResizeObserver errors to users
    if (error.message && !error.message.includes('ResizeObserver')) {
      console.error('Chart Error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Check if it's a ResizeObserver error
      const isResizeObserverError = 
        this.state.error?.message?.includes('ResizeObserver') ||
        this.state.error?.message?.includes('undelivered notifications');

      if (isResizeObserverError) {
        // For ResizeObserver errors, just render the children normally
        return this.props.children;
      }

      // For other errors, show error UI
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height={this.props.height || 200}
          sx={{ p: 2 }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Chart temporarily unavailable
          </Typography>
          <Button
            size="small"
            startIcon={<Refresh />}
            onClick={this.handleRetry}
            variant="outlined"
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
