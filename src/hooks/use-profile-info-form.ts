import { useState, useCallback } from 'react';
import { useFormValidation } from './use-form-validation';
import { formatDateOfBirth, formatPhoneNumber } from '@/lib/validation';

// Single Responsibility: Hook manages profile info form state and logic
export interface ProfileInfoFormState {
  // Form data
  email: string;
  name: string;
  dateOfBirth: string;
  phoneNumber: string;
  isSubmitting: boolean;
  
  // Validation
  validation: ReturnType<typeof useFormValidation>;
  
  // Actions
  setEmail: (email: string) => void;
  setName: (name: string) => void;
  setDateOfBirth: (dateOfBirth: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  
  // Handlers
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateOfBirthChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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

    if (!nameValid || !emailValid || !dobValid || !phoneValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      // TODO: Implement profile info submission
      console.log('Profile info submitted:', { name, email, dateOfBirth, phoneNumber });
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Profile info submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    name,
    email,
    dateOfBirth,
    phoneNumber,
    validation
  ]);

  // Computed values
  const isFormValid = 
    name.trim() && 
    email.trim() && 
    dateOfBirth.trim() && 
    !validation.errors.name && 
    !validation.errors.email && 
    !validation.errors.dateOfBirth &&
    (!phoneNumber.trim() || !validation.errors.phoneNumber);

  // Interface Segregation: Return only what's needed for profile info
  return {
    // Form data
    email,
    name,
    dateOfBirth,
    phoneNumber,
    isSubmitting,
    
    // Validation
    validation,
    
    // Actions
    setEmail,
    setName,
    setDateOfBirth,
    setPhoneNumber,
    
    // Handlers
    handleEmailChange,
    handleNameChange,
    handleDateOfBirthChange,
    handlePhoneNumberChange,
    handleSubmit,
    
    // Computed values
    isFormValid : !!isFormValid
  };
};
