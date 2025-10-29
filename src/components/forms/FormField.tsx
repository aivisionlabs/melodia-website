/**
 * Reusable Form Field Component
 * Handles text input, textarea, and validation
 */

'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  isTextarea?: boolean;
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>;
}

export function FormField({
  label,
  error,
  helperText,
  isTextarea = false,
  textareaProps,
  className,
  required,
  ...props
}: FormFieldProps) {
  const baseInputClasses = cn(
    'w-full px-4 py-3 rounded-lg border transition-all duration-200',
    'font-body text-base',
    'focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-accent-coral',
    error
      ? 'border-error bg-error/5 text-error'
      : 'border-gray-300 bg-white text-text-teal hover:border-primary-yellow',
    className
  );

  return (
    <div className="w-full">
      <label className="block mb-2">
        <span className="font-heading font-semibold text-text-teal">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      {isTextarea ? (
        <textarea
          {...textareaProps}
          className={cn(baseInputClasses, 'min-h-[120px] resize-y')}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          required={required}
        />
      ) : (
        <input
          {...props}
          className={baseInputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          required={required}
        />
      )}

      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-2 text-sm text-error font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-600">{helperText}</p>
      )}
    </div>
  );
}


