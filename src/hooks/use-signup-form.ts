import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useFormValidation } from './use-form-validation';
import { formatDateOfBirth, formatPhoneNumber } from '@/lib/validation';

// Single Responsibility: Hook manages signup form state and logic
export interface SignupFormState {
  // Form data
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  showPassword: boolean;
  isSubmitting: boolean;
  
  // Validation
  validation: ReturnType<typeof useFormValidation>;
  
  // Actions
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
  setDateOfBirth: (dateOfBirth: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setShowPassword: (showPassword: boolean) => void;
  
  // Handlers
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateOfBirthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  
  // Computed values
  isFormValid: boolean;
}

export const useSignupForm = (): SignupFormState => {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dependencies
  const { register, add } = useAuth();
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

  // Single Responsibility: Handle name changes with validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.trim()) {
      validation.validateField("name", value);
    }
  }, [validation]);

  // Single Responsibility: Handle date of birth changes with formatting and validation
  const handleDateOfBirthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDateOfBirth(value);
    setDateOfBirth(formatted);
    if (formatted.trim()) {
      validation.validateField("dateOfBirth", formatted);
    }
  }, [validation]);

  // Single Responsibility: Handle phone number changes with formatting and validation
  const handlePhoneNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setPhoneNumber(formatted);
    if (formatted.trim()) {
      validation.validateField("phoneNumber", formatted);
    }
  }, [validation]);

  // Single Responsibility: Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    validation.clearErrors();

    // Validate all fields
    const nameValid = validation.validateField("name", name);
    const emailValid = validation.validateField("email", email);
    const passwordValid = validation.validateField("password", password);
    const dobValid = validation.validateField("dateOfBirth", dateOfBirth);
    const phoneValid = phoneNumber.trim() ? validation.validateField("phoneNumber", phoneNumber) : true;

    if (!nameValid || !emailValid || !passwordValid || !dobValid || !phoneValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      await register(email, password, name);
      // Note: Navigation is handled by the parent component
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    email,
    password,
    dateOfBirth,
    phoneNumber,
    validation,
    clearError,
    register
  ]);

  // Computed values
  const isFormValid = 
    name.trim() && 
    email.trim() && 
    password.trim() && 
    dateOfBirth.trim() && 
    !validation.errors.name && 
    !validation.errors.email && 
    !validation.errors.password && 
    !validation.errors.dateOfBirth &&
    (!phoneNumber.trim() || !validation.errors.phoneNumber);

  // Interface Segregation: Return only what's needed for signup
  return {
    // Form data
    email,
    password,
    name,
    dateOfBirth,
    phoneNumber,
    showPassword,
    isSubmitting,
    
    // Validation
    validation,
    
    // Actions
    setEmail,
    setPassword,
    setName,
    setDateOfBirth,
    setPhoneNumber,
    setShowPassword,
    
    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleNameChange,
    handleDateOfBirthChange,
    handlePhoneNumberChange,
    handleSubmit,
    
    // Computed values
    isFormValid
  };
};
