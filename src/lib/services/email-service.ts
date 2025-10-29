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
      subject: '🎵 Verify your Melodia account',
      html: getVerificationEmailTemplate(name, code),
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
      subject: '🔒 Reset your Melodia password',
      html: getPasswordResetEmailTemplate(name, code),
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
  requesterName: string | undefined,
  recipientName: string,
  requestId: number
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎵 Your Melodia song request has been received',
      html: getSongRequestConfirmationTemplate(requesterName || 'there', recipientName, requestId),
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
  requesterName: string | undefined,
  songTitle: string,
  songSlug: string
) {
  const songUrl = `${process.env.NEXTAUTH_URL}/song/${songSlug}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🎵 Your Melodia song is ready!',
      html: getSongReadyTemplate(requesterName || 'there', songTitle, songUrl),
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
      subject: '💳 Payment confirmation - Melodia',
      html: getPaymentConfirmationTemplate(name, amount, currency, paymentId),
    });

    console.log(`Payment confirmation sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send payment confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Email Template Functions
 * Using Melodia brand colors and design system
 */

function getBaseEmailStyles() {
  return `
    body { font-family: 'Montserrat', sans-serif; line-height: 1.6; color: #073B4C; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FFD166 0%, #FFC107 100%); color: #073B4C; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: #FDFDFD; padding: 30px; border: 1px solid #FFD166; border-top: none; border-radius: 0 0 12px 12px; }
    h1 { font-family: 'Poppins', sans-serif; font-size: 32px; font-weight: 700; color: #073B4C; margin: 0 0 20px 0; }
    h2 { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600; color: #073B4C; margin: 20px 0 10px 0; }
    p { font-size: 16px; color: #073B4C; margin: 10px 0; }
    .code-box { background: #FDFDFD; border: 2px solid #FFD166; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-family: 'Poppins', monospace; font-size: 32px; font-weight: 700; color: #EF476F; letter-spacing: 4px; }
    .button { display: inline-block; background: linear-gradient(135deg, #FFD166 0%, #FFC107 100%); color: #073B4C; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-family: 'Poppins', sans-serif; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #FFD166; color: #888; font-size: 14px; }
    .info-box { background: #e8f4fd; border-left: 4px solid #EF476F; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .highlight { color: #EF476F; font-weight: 700; }
  `;
}

function getBaseEmailWrapper(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Montserrat:wght@400;500&display=swap" rel="stylesheet">
        <style>${getBaseEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${title}</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Melodia. Create personalized songs for your loved ones.
          </div>
        </div>
      </body>
    </html>
  `;
}

function getVerificationEmailTemplate(name: string, code: string) {
  const content = `
    <p>Hi ${name},</p>
    <p>Welcome to <strong>Melodia</strong>! We're excited to have you join our community of music lovers.</p>
    <div class="code-box">
      <p style="margin: 0; color: #888; font-size: 14px; margin-bottom: 10px;">Your verification code</p>
      <div class="code">${code}</div>
      <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">This code will expire in 15 minutes</p>
    </div>
    <p>Enter this code to verify your account and start creating personalized songs for your loved ones.</p>
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;">🔒 If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return getBaseEmailWrapper('🎵 Welcome to Melodia!', content);
}

function getPasswordResetEmailTemplate(name: string, code: string) {
  const content = `
    <p>Hi ${name},</p>
    <p>We received a request to reset your password for your Melodia account.</p>
    <div class="code-box">
      <p style="margin: 0; color: #888; font-size: 14px; margin-bottom: 10px;">Your reset code</p>
      <div class="code">${code}</div>
      <p style="margin: 10px 0 0 0; color: #888; font-size: 12px;">This code will expire in 15 minutes</p>
    </div>
    <p>Use this code to reset your password and regain access to your account.</p>
    <div class="info-box">
      <p style="margin: 0; font-size: 14px;">🔒 If you didn't request this, please ignore this email. Your password won't be changed.</p>
    </div>
  `;
  return getBaseEmailWrapper('🔒 Reset Your Password', content);
}

function getSongRequestConfirmationTemplate(requesterName: string, recipientName: string, requestId: number) {
  const content = `
    <p>Hi ${requesterName || 'there'},</p>
    <p>Thank you for choosing Melodia! We're thrilled to help you create something special for ${recipientName}.</p>
    <div class="info-box">
      <p style="margin: 0;"><strong>Request ID:</strong> ${requestId}</p>
    </div>
    <h2>What happens next?</h2>
    <p>✓ We've received your song request<br>
    ✓ Our creative team will start working on your personalized song<br>
    ✓ You'll receive an update when your song is ready to listen</p>
    <p>We're excited to create something magical, Our team will put their heart and soul into making your song truly special.</p>
    <p style="margin-top: 30px;">With love,<br><strong>The Melodia Team</strong></p>
  `;
  return getBaseEmailWrapper('🎵 Song Request Received!', content);
}

function getSongReadyTemplate(requesterName: string, songTitle: string, songUrl: string) {
  const content = `
    <p>Hi ${requesterName},</p>
    <p>🎉 Great news! Your personalized song "<span class="highlight">${songTitle}</span>" is ready!</p>
    <p>We've poured our hearts into creating something truly special. It's time to listen, share, and celebrate!</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${songUrl}" class="button">🎵 Listen Now</a>
    </div>
    <p style="text-align: center; color: #888; font-size: 14px;">Or copy this link: <br>${songUrl}</p>
    <h2>Share the joy</h2>
    <p>Spread the love! Share your song with friends and family to let them experience the magic.</p>
    <p style="margin-top: 30px;">Thank you for choosing Melodia! 🎶</p>
    <p>With love,<br><strong>The Melodia Team</strong></p>
  `;
  return getBaseEmailWrapper('🎵 Your Song is Ready!', content);
}

function getPaymentConfirmationTemplate(name: string, amount: number, currency: string, paymentId: string) {
  const content = `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Thank you for your payment! We've successfully received your payment of <span class="highlight">${currency} ${amount}</span>.</p>
    <div class="info-box">
      <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount}</p>
      <p style="margin: 5px 0;"><strong>Status:</strong> Payment Confirmed ✓</p>
    </div>
    <h2>What happens next?</h2>
    <p>✓ Your song is being created with love and care<br>
    ✓ We'll notify you as soon as it's ready<br>
    ✓ You'll receive an email with your personalized song</p>
    <p>We're excited to create something magical for you!</p>
    <p style="margin-top: 30px;">Thank you for choosing Melodia! 🎵</p>
    <p>With love,<br><strong>The Melodia Team</strong></p>
  `;
  return getBaseEmailWrapper('💳 Payment Confirmed', content);
}

