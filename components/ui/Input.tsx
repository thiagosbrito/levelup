import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '@/utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  className,
  containerClassName,
  ...props
}: InputProps) {
  return (
    <View className={cn('space-y-2', containerClassName)}>
      {label && (
        <Text className="text-sm font-medium text-neutral-700">
          {label}
        </Text>
      )}
      <TextInput
        className={cn(
          'bg-white border-2 rounded-xl px-4 py-3.5 text-base text-neutral-700',
          error 
            ? 'border-error-500 focus:border-error-600' 
            : 'border-neutral-200 focus:border-primary-500',
          className
        )}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && (
        <Text className="text-sm text-error-500">
          {error}
        </Text>
      )}
    </View>
  );
}