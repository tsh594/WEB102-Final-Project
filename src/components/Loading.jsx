import React from 'react'; // Add React import

export const LoadingOverlay = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
  </div>
);