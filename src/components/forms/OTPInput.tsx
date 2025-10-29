/**
 * OTP Input Component
 * 6-digit code input with auto-focus and auto-submit
 */

"use client";

import {
  useRef,
  useState,
  KeyboardEvent,
  ClipboardEvent,
  ChangeEvent,
} from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled = false,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    if (!/^\d*$/.test(newValue)) return;

    const newOTP = value.split("");
    newOTP[index] = newValue.slice(-1); // Take only the last character
    const newOTPString = newOTP.join("");

    onChange(newOTPString);

    // Auto-focus next input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits are filled
    if (newOTPString.length === length && onComplete) {
      onComplete(newOTPString);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only allow digits
    if (!/^\d+$/.test(pastedData)) return;

    const newValue = pastedData.slice(0, length);
    onChange(newValue);

    // Focus the next empty input or the last one
    const nextEmptyIndex =
      newValue.length < length ? newValue.length : length - 1;
    inputRefs.current[nextEmptyIndex]?.focus();

    // Call onComplete if all digits are filled
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  return (
    <div>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange(index, e.target.value)
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(index, e)
            }
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            className={cn(
              "w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-accent-coral",
              error
                ? "border-error bg-error/5 text-error"
                : focusedIndex === index
                  ? "border-accent-coral bg-primary-yellow/10"
                  : value[index]
                    ? "border-primary-yellow bg-primary-yellow/5 text-text-teal"
                    : "border-gray-300 bg-white text-text-teal hover:border-primary-yellow",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {error && (
        <p
          className="mt-3 text-center text-sm text-error font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
