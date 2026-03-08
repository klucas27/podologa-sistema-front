import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200',
  danger:
    'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-300',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}) => (
  <button
    type={(rest.type as any) ?? 'button'}
    disabled={disabled || isLoading}
    className={`inline-flex items-center justify-center font-medium rounded-lg transition focus:ring-2 outline-none disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...rest}
  >
    {isLoading ? <Loader2 size={16} className="animate-spin" /> : icon}
    {children}
  </button>
);

export default Button;
