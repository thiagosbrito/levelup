import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

interface InteractiveCardProps extends TouchableOpacityProps {
  variant?: 'interactive';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  children,
  className,
  ...props
}: CardProps) {
  const baseClasses = 'bg-white';
  
  const variantClasses = {
    default: 'rounded-xl p-5 shadow-card border border-neutral-200/50',
    elevated: 'rounded-2xl p-6 shadow-lg',
    interactive: 'rounded-lg p-4 shadow-sm',
  };
  
  if (variant === 'interactive') {
    return (
      <TouchableOpacity
        className={cn(
          baseClasses,
          variantClasses[variant],
          'active:scale-95 transition-transform',
          className
        )}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function InteractiveCard({
  children,
  className,
  ...props
}: InteractiveCardProps) {
  return (
    <TouchableOpacity
      className={cn(
        'bg-white rounded-lg p-4 shadow-sm active:scale-95 transition-transform',
        className
      )}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}