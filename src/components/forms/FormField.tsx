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
          required={required}
          maxLength={maxLength}
          className={`w-full bg-white border-2 text-melodia-teal placeholder-melodia-teal/50 rounded-lg py-4 px-4 text-base focus:ring-2 focus:ring-melodia-yellow focus:border-melodia-teal transition ${
            error ? 'border-red-500' : 'border-melodia-teal/40'
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
