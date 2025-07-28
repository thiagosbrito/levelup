import React from 'react';
import { View, Text, Image, ImageProps } from 'react-native';
import { cn } from '@/utils/cn';

interface AvatarProps {
  size?: 'small' | 'medium' | 'large';
  source?: ImageProps['source'];
  initials?: string;
  progress?: number;
  className?: string;
}

export function Avatar({
  size = 'medium',
  source,
  initials,
  progress,
  className,
}: AvatarProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
  };
  
  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-xl',
  };

  const borderClasses = {
    small: 'border-2',
    medium: 'border-3',
    large: 'border-4',
  };

  const progressStyle = progress !== undefined ? {
    background: `conic-gradient(#F97316 0deg, #F97316 ${progress * 3.6}deg, #E5E7EB ${progress * 3.6}deg, #E5E7EB 360deg)`
  } : {};

  return (
    <View
      className={cn(
        'rounded-full bg-neutral-200 items-center justify-center shadow-md',
        sizeClasses[size],
        progress !== undefined ? 'border-primary-500' : 'border-white',
        borderClasses[size],
        className
      )}
      style={progressStyle}
    >
      {source ? (
        <Image
          source={source}
          className={cn('rounded-full', sizeClasses[size])}
          resizeMode="cover"
        />
      ) : (
        <Text
          className={cn(
            'font-semibold text-neutral-600',
            textSizeClasses[size]
          )}
        >
          {initials || '?'}
        </Text>
      )}
    </View>
  );
}