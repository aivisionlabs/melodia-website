"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/forms/FormField";
import { X } from "lucide-react";

interface ContactDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { mobileNumber: string; email: string }) => void;
  isSubmitting?: boolean;
}

export function ContactDetailsDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ContactDetailsDialogProps) {
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{
    mobileNumber?: string;
    email?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { mobileNumber?: string; email?: string } = {};

    // Mobile number validation (required and must be valid)
    const trimmedMobile = mobileNumber.trim();
    if (!trimmedMobile) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (
      !/^[\+]?[1-9][\d]{0,15}$/.test(trimmedMobile.replace(/\s/g, ""))
    ) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    // Email validation (optional but if provided, should be valid)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
      });
    }
  };

  const handleClose = () => {
    setMobileNumber("");
    setEmail("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-text-teal">
            Contact Details
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center text-text-teal/60 hover:text-text-teal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-base font-body text-text-teal/80 leading-relaxed mb-8">
          Please provide your contact details so we can reach out when your song
          is ready.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            id="mobile-number"
            label="Mobile Number"
            type="tel"
            placeholder="+919876543210"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            error={errors.mobileNumber}
            required
          />

          <FormField
            id="email"
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-primary-yellow text-text-teal font-display font-bold text-lg rounded-full shadow-md hover:bg-yellow-400 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
