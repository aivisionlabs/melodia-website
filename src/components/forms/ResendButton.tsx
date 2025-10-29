/**
 * Resend Button Component
 * Button with countdown timer for resending OTP/emails
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ResendButtonProps {
  onResend: () => Promise<void>;
  cooldownSeconds?: number;
  disabled?: boolean;
}

export function ResendButton({
  onResend,
  cooldownSeconds = 60,
  disabled = false,
}: ResendButtonProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await onResend();
      setTimeLeft(cooldownSeconds);
    } catch (error) {
      console.error('Resend failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = disabled || timeLeft > 0 || isLoading;

  return (
    <div className="text-center">
      <Button
        type="button"
        variant="ghost"
        onClick={handleResend}
        disabled={isDisabled}
        className="text-accent-coral hover:text-accent-coral/80 font-medium"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : timeLeft > 0 ? (
          `Resend in ${timeLeft}s`
        ) : (
          'Resend Code'
        )}
      </Button>
    </div>
  );
}


