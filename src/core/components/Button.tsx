import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export function Button({ 
  title, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className,
  ...props 
}: ButtonProps) {
  const baseClasses = "items-center justify-center rounded-xl";
  
  const variantClasses = {
    primary: disabled ? "bg-gray-400" : "bg-purple-600",
    secondary: disabled ? "bg-gray-200 border border-gray-300" : "bg-white border border-purple-600",
    ghost: disabled ? "bg-transparent" : "bg-transparent",
  };

  const sizeClasses = {
    small: "px-3 py-2",
    medium: "px-4 py-3",
    large: "px-6 py-4",
  };

  const textColorClasses = {
    primary: "text-white",
    secondary: disabled ? "text-gray-500" : "text-purple-600",
    ghost: disabled ? "text-gray-400" : "text-purple-600",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
      {...props}
    >
      <Text className={`${textColorClasses[variant]} ${textSizeClasses[size]} font-semibold`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}