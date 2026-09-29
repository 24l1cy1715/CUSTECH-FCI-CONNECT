import React from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  glow = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-surface text-text rounded-2xl border border-border shadow-sm p-5 sm:p-6 transition-all duration-220 ease-out',
        hoverable && !glow && 'card-hoverable',
        glow && 'card-interactive cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
