import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { cn } from '@/utils/cn';

interface BadgeProps extends ViewProps {
  variant?: 'achievement' | 'free' | 'premium' | 'new';
  children: React.ReactNode;
}

export function Badge({
  variant = 'achievement',
  children,
  className,
  ...props
}: BadgeProps) {
  const baseClasses = 'px-3 py-1.5 rounded-xl';
  
  const variantClasses = {
    achievement: 'bg-gradient-to-br from-warning-500 to-warning-600',
    free: 'bg-success-500',
    premium: 'bg-primary-500',
    new: 'bg-error-500',
  };

  return (
    <View
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <Text className="text-xs font-semibold text-white">
        {children}
      </Text>
    </View>
  );
}