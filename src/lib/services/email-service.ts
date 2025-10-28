/**
 * Email Service
 * Handles sending emails via Resend
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@melodia.com';

/**
 * Send email verification code
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your Melodia account',
      html: `
        <h1>Welcome to Melodia, ${name}!</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log(`Verification email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  code: string,
  name: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Melodia password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log(`Password reset email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}

/**
 * Send song request confirmation email
 */
export async function sendSongRequestConfirmation(
  email: string,
  requesterName: string,
  recipientName: string,
  requestId: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Melodia song request has been received',
      html: `
        <h1>Thank you for your song request!</h1>
        <p>Hi ${requesterName},</p>
        <p>We've received your request to create a personalized song for ${recipientName}.</p>
        <p><strong>Request ID:</strong> ${requestId}</p>
        <p>We're working on creating something special. You'll receive an email when your song is ready!</p>
        <p>Best regards,<br/>The Melodia Team</p>
      `,
    });

    console.log(`Song request confirmation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send song request confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send song ready notification
 */
export async function sendSongReadyNotification(
  email: string,
  requesterName: string,
  songTitle: string,
  songSlug: string
) {
  const songUrl = `${process.env.NEXTAUTH_URL}/song/${songSlug}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your Melodia song is ready! 🎵',
      html: `
        <h1>Your song is ready!</h1>
        <p>Hi ${requesterName},</p>
        <p>Great news! Your personalized song "<strong>${songTitle}</strong>" is ready to listen and share.</p>
        <p><a href="${songUrl}" style="display: inline-block; padding: 12px 24px; background-color: #FFD166; color: #073B4C; text-decoration: none; border-radius: 8px; font-weight: bold;">Listen Now</a></p>
        <p>Or copy this link: ${songUrl}</p>
        <p>Thank you for choosing Melodia!</p>
        <p>Best regards,<br/>The Melodia Team</p>
      `,
    });

    console.log(`Song ready notification sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send song ready notification:', error);
    return { success: false, error };
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  email: string,
  name: string,
  amount: number,
  currency: string,
  paymentId: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment confirmation - Melodia',
      html: `
        <h1>Payment Received</h1>
        <p>Hi ${name},</p>
        <p>We've received your payment of ${currency} ${amount}.</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p>Your song is being created and will be ready soon!</p>
        <p>Thank you for your payment.</p>
        <p>Best regards,<br/>The Melodia Team</p>
      `,
    });

    console.log(`Payment confirmation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send payment confirmation:', error);
    return { success: false, error };
  }
}

