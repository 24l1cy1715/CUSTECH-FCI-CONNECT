import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="w-full min-h-[55vh] flex flex-col items-center justify-center p-6 space-y-4 animate-fadeIn"
    >
      <div className="relative flex items-center justify-center">
        {/* Glowing concentric spinner */}
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <div className="absolute w-6 h-6 rounded-full bg-accent/10 animate-pulse" />
      </div>

      <div className="flex flex-col items-center space-y-2 text-center max-w-xs">
        <div className="h-3.5 w-32 bg-border-subtle/50 rounded-full animate-pulse" />
        <div className="h-2.5 w-24 bg-border-subtle/30 rounded-full animate-pulse" />
      </div>

      <span className="sr-only">Loading page content, please wait...</span>
    </div>
  );
};
