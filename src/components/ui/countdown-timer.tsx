import * as React from 'react';
import { useEffect, useState } from 'react';

// Single Responsibility: Component provides circular countdown timer
interface CountdownTimerProps {
  seconds: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  seconds,
  size = 'md',
  className = ''
}) => {
  const [progress, setProgress] = useState(0);

  // Size configurations
  const sizeConfig = {
    sm: { width: 60, height: 60, strokeWidth: 6, fontSize: 'text-lg' },
    md: { width: 80, height: 80, strokeWidth: 8, fontSize: 'text-xl' },
    lg: { width: 96, height: 96, strokeWidth: 8, fontSize: 'text-3xl' }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress based on remaining seconds
  useEffect(() => {
    // Assuming countdown starts from 5 seconds
    const totalSeconds = 5;
    const progressPercent = ((totalSeconds - seconds) / totalSeconds) * 100;
    setProgress(progressPercent);
  }, [seconds]);

  // Calculate stroke dash offset for progress
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: config.width, height: config.height }}>
      {/* Background Circle */}
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${config.width} ${config.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle
          className="text-gray-200"
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          className="text-primary transition-all duration-1000 ease-linear"
          cx={config.width / 2}
          cy={config.height / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear'
          }}
        />
      </svg>

      {/* Countdown Number */}
      <div 
        className={`
          absolute inset-0 flex items-center justify-center 
          ${config.fontSize} font-display font-bold text-melodia-teal
        `}
      >
        {seconds}
      </div>
    </div>
  );
};
