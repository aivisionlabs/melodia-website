/**
 * Password Input Field Component
 * Includes show/hide toggle and strength indicator
 */

'use client';

import { useState, InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  showStrengthIndicator?: boolean;
}

export function PasswordField({
  label,
  error,
  helperText,
  showStrengthIndicator = false,
  className,
  required,
  value,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Calculate password strength
  const getPasswordStrength = (password: string): number => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strength = showStrengthIndicator && value ? getPasswordStrength(value as string) : 0;

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-error', 'bg-warning', 'bg-info', 'bg-success'];

  return (
    <div className="w-full">
      <label className="block mb-2">
        <span className="font-heading font-semibold text-text-teal">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </span>
      </label>

      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={value}
          className={cn(
            'w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200',
            'font-body text-base',
            'focus:outline-none focus:ring-2 focus:ring-accent-coral focus:border-accent-coral',
            error
              ? 'border-error bg-error/5 text-error'
              : 'border-gray-300 bg-white text-text-teal hover:border-primary-yellow',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          required={required}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-text-teal transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {showStrengthIndicator && value && strength > 0 && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  level <= strength ? strengthColors[strength] : 'bg-gray-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Password strength: <span className="font-medium">{strengthLabels[strength]}</span>
          </p>
        </div>
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




