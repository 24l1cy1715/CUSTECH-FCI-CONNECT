import React from 'react';
import { cn } from '@/utils/cn';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
  pauseOnHover?: boolean;
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className,
}) => {
  const speedClass = {
    slow: '[animation-duration:45s]',
    normal: '[animation-duration:28s]',
    fast: '[animation-duration:15s]',
  }[speed];

  const directionClass = direction === 'right' ? 'reverse-marquee' : '';

  return (
    <div
      className={cn(
        'group flex overflow-hidden select-none gap-6 w-full',
        className
      )}
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-6 animate-marquee',
          speedClass,
          directionClass,
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-6 animate-marquee',
          speedClass,
          directionClass,
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
    </div>
  );
};
