import { useState, useCallback } from 'react';
import { validateField } from '@/lib/validation';

// Single Responsibility: Hook manages form validation state and logic
export interface FormValidationState {
  errors: Record<string, string>;
  isValid: boolean;
  validateField: (fieldName: string, value: string) => boolean;
  validateAll: (formData: Record<string, string>) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
}

export const useFormValidation = (): FormValidationState => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Single Responsibility: Validate a single field
  const validateFieldValue = useCallback((fieldName: string, value: string): boolean => {
    const error = validateField(fieldName, value);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === "";
  }, []);

  // Single Responsibility: Validate all fields
  const validateAllFields = useCallback((formData: Record<string, string>): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.entries(formData).forEach(([fieldName, value]) => {
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, []);

  // Single Responsibility: Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Single Responsibility: Clear specific field error
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Interface Segregation: Return only what's needed
  return {
    errors,
    isValid: Object.values(errors).every(error => !error),
    validateField: validateFieldValue,
    validateAll: validateAllFields,
    clearErrors,
    clearFieldError
  };
};
