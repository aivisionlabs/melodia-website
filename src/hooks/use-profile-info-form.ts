import { useState, useCallback } from 'react';
import { useFormValidation } from './use-form-validation';
import { formatDateOfBirth, formatPhoneNumber, convertDateFormat } from '@/lib/validation';

// Single Responsibility: Hook manages profile info form state and logic
export interface ProfileInfoFormState {
  // Form data
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  isSubmitting: boolean;
  
  // Validation
  validation: ReturnType<typeof useFormValidation>;
  
  // Actions
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setDateOfBirth: (dateOfBirth: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  
  // Handlers
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateOfBirthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  
  // Computed values
  isFormValid: boolean;
}

export const useProfileInfoForm = (): ProfileInfoFormState => {
  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dependencies
  const validation = useFormValidation();

  // Single Responsibility: Handle email changes with validation
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value.trim()) {
      validation.validateField("email", value);
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

  // Single Responsibility: Handle password changes with validation
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.trim()) {
      validation.validateField("password", value);
      // Re-validate confirm password if it exists
      if (confirmPassword.trim()) {
        validation.validateField("confirmPassword", confirmPassword, value);
      }
    }
  }, [validation, confirmPassword]);

  // Single Responsibility: Handle confirm password changes with validation
  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value.trim()) {
      validation.validateField("confirmPassword", value, password);
    }
  }, [validation, password]);

  // Single Responsibility: Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    validation.clearErrors();

    // Validate all fields
    const nameValid = validation.validateField("name", name);
    const emailValid = validation.validateField("email", email);
    const dobValid = validation.validateField("dateOfBirth", dateOfBirth);
    const phoneValid = phoneNumber.trim() ? validation.validateField("phoneNumber", phoneNumber) : true;
    const passwordValid = validation.validateField("password", password);
    const confirmPasswordValid = validation.validateField("confirmPassword", confirmPassword, password);

    if (!nameValid || !emailValid || !dobValid || !phoneValid || !passwordValid || !confirmPasswordValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Format data for API submission
      const formData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        dateOfBirth: convertDateFormat(dateOfBirth.trim(), 'DD/MM/YYYY', 'YYYY-MM-DD'), // Convert to backend format
        phoneNumber: phoneNumber.trim() || undefined,
        password: password.trim(),
        anonymous_user_id: localStorage.getItem('anonymous_user_id') || undefined
      };
      
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to verification page
        window.location.href = '/profile/signup/verify';
      } else {
        // Handle API errors
        if (data.error?.details) {
          // Set field-specific errors
          Object.entries(data.error.details).forEach(([field, message]) => {
            validation.setFieldError(field, message as string);
          });
        } else {
          // Set general error on email field
          validation.setFieldError("email", data.error?.message || "Signup failed. Please try again.");
        }
      }
    } catch (error) {
      console.error('Profile info submission error:', error);
      validation.setFieldError("email", "Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    email,
    dateOfBirth,
    phoneNumber,
    password,
    confirmPassword,
    validation
  ]);

  // Computed values
  const isFormValid = 
    name.trim() && 
    email.trim() && 
    dateOfBirth.trim() && 
    password.trim() &&
    confirmPassword.trim() &&
    !validation.errors.name && 
    !validation.errors.email && 
    !validation.errors.dateOfBirth &&
    !validation.errors.password &&
    !validation.errors.confirmPassword &&
    (!phoneNumber.trim() || !validation.errors.phoneNumber);

  // Interface Segregation: Return only what's needed for profile info
  return {
    // Form data
    email,
    name,
    dateOfBirth,
    phoneNumber,
    password,
    confirmPassword,
    isSubmitting,
    
    // Validation
    validation,
    
    // Actions
    setEmail,
    setName,
    setDateOfBirth,
    setPhoneNumber,
    setPassword,
    setConfirmPassword,
    
    // Handlers
    handleEmailChange,
    handleNameChange,
    handleDateOfBirthChange,
    handlePhoneNumberChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    
    // Computed values
    isFormValid : !!isFormValid
  };
};
