import React from 'react';
import { Input } from '@/components/ui/input';

// Single Responsibility: Component handles form field display and styling
interface FormFieldProps {
  id: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  maxLength?: number;
  className?: string;
  children?: React.ReactNode; // For custom input elements
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  error,
  required = false,
  maxLength,
  className = '',
  children
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-melodia-teal"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      {children || (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          required={required}
          maxLength={maxLength}
          className={`w-full h-14 px-5 bg-white border border-text/20 rounded-lg placeholder-text/50 focus:ring-2 focus:ring-primary focus:border-transparent font-body ${
            error ? 'border-red-500' : ''
          } ${className}`}
        />
      )}
      
      {error && (
        <p
          id={`${id}-error`}
          className="text-red-500 text-xs mt-1 text-left"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};
