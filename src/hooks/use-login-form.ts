import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useFormValidation } from './use-form-validation';

// Single Responsibility: Hook manages login form state and logic
export interface LoginFormState {
  // Form data
  email: string;
  password: string;
  showPassword: boolean;
  isSubmitting: boolean;
  
  // Validation
  validation: ReturnType<typeof useFormValidation>;
  
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setShowPassword: (showPassword: boolean) => void;
  
  // Handlers
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  
  // Computed values
  isFormValid: boolean;
}

export const useLoginForm = (): LoginFormState => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dependencies
  const { login, clearError } = useAuth();
  const validation = useFormValidation();

  // Single Responsibility: Handle email changes with validation
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) {
      validation.validateField("email", value);
    }
  }, [validation]);

  // Single Responsibility: Handle password changes with validation
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim()) {
      validation.validateField("password", value);
    }
  }, [validation]);

  // Single Responsibility: Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    validation.clearErrors();

    // Validate all fields
    const emailValid = validation.validateField("email", email);
    const passwordValid = validation.validateField("password", password);

    if (!emailValid || !passwordValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      // Note: Navigation is handled by the parent component
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, validation, clearError, login]);

  // Computed values
  const isFormValid = 
    email.trim() && 
    password.trim() && 
    !validation.errors.email && 
    !validation.errors.password;

  // Interface Segregation: Return only what's needed for login
  return {
    // Form data
    email,
    password,
    showPassword,
    isSubmitting,
    
    // Validation
    validation,
    
    // Actions
    setEmail,
    setPassword,
    setShowPassword,
    
    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    
    // Computed values
    isFormValid
  };
};
