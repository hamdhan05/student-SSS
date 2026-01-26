import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'action';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    // Default style: white background with dark text for primary/secondary.
    // Success/Danger use filled colored backgrounds to stand out (for attendance buttons).
    primary: 'bg-brand text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 focus:ring-brand-light dark:bg-white dark:text-black dark:hover:bg-gray-200 dark:shadow-none',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-100 dark:bg-transparent dark:text-white dark:border-gray-600 dark:hover:bg-white/10',
    success: 'bg-green-700 text-white hover:bg-green-600 focus:ring-green-500',
    danger: 'bg-red-700 text-white hover:bg-red-600 focus:ring-red-500',
    warning: 'bg-yellow-600 text-black hover:bg-yellow-500 focus:ring-yellow-400',
    action: 'bg-accent text-white hover:bg-amber-600 shadow-md shadow-amber-200 focus:ring-accent dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700 dark:shadow-none',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
