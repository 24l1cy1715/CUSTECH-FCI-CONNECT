import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  glow?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  glow = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const isAccentGlow = glow || variant === 'accent';
  const isSubtleGlow = glow && variant !== 'accent';

  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-primary-700 active:bg-primary-900 border border-transparent shadow-sm dark:bg-primary-500 dark:hover:bg-primary-400 dark:text-white',
    accent:
      'bg-accent text-primary-950 hover:bg-accent-400 active:bg-accent-600 font-semibold border border-transparent shadow-sm',
    secondary:
      'bg-surface-raised text-text hover:bg-border active:bg-border-strong border border-border',
    outline:
      'border border-border text-text hover:bg-surface-raised active:bg-border/60 bg-transparent',
    ghost:
      'text-text hover:bg-surface-raised active:bg-border/40 bg-transparent',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
  }[variant];

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 font-medium',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-medium',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
  }[size];

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <motion.button
      whileTap={!isDisabled ? { scale: 0.98, y: 0 } : undefined}
      whileHover={!isDisabled ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 28 }}
      className={cn(
        'group inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 touch-manipulation relative overflow-hidden',
        variantStyles,
        sizeStyles,
        isAccentGlow && 'btn-glow',
        isSubtleGlow && 'btn-glow-subtle',
        className
      )}
      disabled={isDisabled}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon && <span className="shrink-0 transition-transform duration-200">{leftIcon}</span>
      )}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
      {!isLoading && rightIcon && (
        <span className="shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" data-arrow="true">
          {rightIcon}
        </span>
      )}
    </motion.button>
  );
};
