import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  variant?: 'solid' | 'glass';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', containerClassName = '', id, disabled, required, variant = 'solid', ...props }, ref) => {
    const inputId = id || props.name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    // Determine aria-describedby
    const describedBy = [
      error ? errorId : undefined,
      helperText ? helperId : undefined
    ].filter(Boolean).join(' ') || undefined;

    const baseStyles = `
      w-full px-4 py-2 
      border rounded-lg 
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantStyles = variant === 'glass'
      ? `bg-surface/50 text-gray-900 border-gray-200 focus:border-brand focus:ring-brand dark:bg-white/10 dark:text-white dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500`
      : `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700
         ${error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900 hover:border-blue-400'
      }`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-1 transition-colors ${error ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'
              }`}
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            aria-required={required}
            className={`
              ${baseStyles}
              ${variantStyles}
              ${className}
            `}
            {...props}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center animate-fadeIn"
            role="alert"
          >
            <span className="mr-1">⚠</span> {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p
            id={helperId}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
