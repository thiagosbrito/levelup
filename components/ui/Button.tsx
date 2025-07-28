import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';
import { cn } from '@/utils/cn';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl font-semibold active:scale-95 transition-transform';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-button',
    secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white',
    ghost: 'bg-white/90 text-neutral-700 border border-neutral-300/50',
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  };

  return (
    <TouchableOpacity
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <Text className={cn(
        'font-semibold',
        variant === 'primary' || variant === 'secondary' ? 'text-white' : 'text-neutral-700',
        sizeClasses[size].includes('text-sm') ? 'text-sm' : 
        sizeClasses[size].includes('text-lg') ? 'text-lg' : 'text-base'
      )}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}