import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/utils/cn';

interface GradientButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function GradientButton({
  variant = 'primary',
  children,
  className,
  ...props
}: GradientButtonProps) {
  const gradientColors = {
    primary: ['#FB923C', '#F97316', '#EA580C'], // primary-400 to primary-500 to primary-600
    secondary: ['#38BDF8', '#0EA5E9', '#0284C7'], // secondary-400 to secondary-500 to secondary-600
  };

  const borderColors = {
    primary: '#FB923C', // primary-400
    secondary: '#38BDF8', // secondary-400
  };

  return (
    <TouchableOpacity
      className={cn('rounded-2xl overflow-hidden active:scale-95', className)}
      {...props}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ 
          borderWidth: 2,
          borderColor: borderColors[variant],
          borderRadius: 16, // rounded-2xl
        }}
      >
        <View className="px-6 py-4">
          <Text className="text-white text-base font-semibold text-center">
            {children}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}