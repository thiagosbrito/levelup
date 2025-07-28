import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0-100
  variant?: 'default' | 'thick';
}

export function ProgressBar({
  progress,
  variant = 'default',
  className,
  ...props
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  const containerClasses = {
    default: 'h-2 rounded-sm',
    thick: 'h-3 rounded-md',
  };

  return (
    <View
      className={cn(
        'bg-neutral-200 overflow-hidden',
        containerClasses[variant],
        className
      )}
      {...props}
    >
      <View
        className={cn(
          'h-full bg-gradient-to-r from-primary-500 to-primary-600',
          containerClasses[variant]
        )}
        style={{ width: `${clampedProgress}%` }}
      />
    </View>
  );
}