import React from 'react';

const AppIcon = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      viewBox="0 0 60 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Outer Broadcast Wave (Animated) */}
      <path 
        d="M 18 10 Q 30 2 42 10" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        className="animate-pulse"
        style={{ animationDuration: '2s' }}
      />
      
      {/* Inner Broadcast Wave (Animated) */}
      <path 
        d="M 23 17 Q 30 11 37 17" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        className="animate-pulse"
        style={{ animationDuration: '2s', animationDelay: '0.5s' }}
      />

      {/* Cloche Handle (Antenna Base) */}
      <circle 
        cx="30" 
        cy="24" 
        r="3.5" 
        fill="currentColor" 
      />
      
      {/* Cloche Dome */}
      <path 
        d="M 14 50 C 14 30, 24 25, 30 25 C 36 25, 46 30, 46 50" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
      />
      
      {/* Serving Plate */}
      <path 
        d="M 8 50 H 52" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* Inner Play Button (Represents Live Video / Food) */}
      <polygon 
        points="27,33 37,39 27,45" 
        fill="currentColor" 
        className="opacity-90"
      />
    </svg>
  );
};

export default AppIcon;
