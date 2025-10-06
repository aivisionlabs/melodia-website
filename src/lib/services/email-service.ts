import sgMail from '@sendgrid/mail';

// Email Service Interface - Exchangeable contract for SendGrid/Mock implementations
export interface EmailService {
  sendVerificationEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean>;

  sendPasswordResetEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean>;
}

// Mock implementation for development
export class MockEmailService implements EmailService {
  async sendVerificationEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean> {
    console.log(`
    📧 Mock Email Service (Development)
    To: ${email}
    Subject: Verify your Melodia account
    
    Hi ${name},
    Your verification code is: ${code}
    
    🔧 DEVELOPMENT: Use code "123456" for testing
    This code expires in 10 minutes.
  `);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }

  async sendPasswordResetEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean> {
    console.log(`
    📧 Mock Email Service (Development) - Password Reset
    To: ${email}
    Subject: Reset your Melodia password
    
    Hi ${name},
    Your password reset code is: ${code}
    
    🔧 DEVELOPMENT: Use code "123456" for testing
    This code expires in 10 minutes.
  `);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return true;
  }
}

// SendGrid implementation
export class SendGridEmailService implements EmailService {
  constructor(private apiKey: string, private fromEmail: string) { }

  async sendVerificationEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean> {
    try {
      sgMail.setApiKey(this.apiKey);

      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Verify your Melodia account',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #073B4C; font-size: 28px; margin: 0;">Welcome to Melodia!</h1>
          </div>
          
          <div style="background: #FDFDFD; padding: 30px; border-radius: 12px; border: 1px solid #E5E7EB;">
            <p style="color: #073B4C; font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="color: #073B4C; font-size: 16px; margin-bottom: 25px;">
              Thank you for signing up! Please verify your email address by entering this code:
            </p>
            
            <div style="background: #FFD166; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #073B4C; border-radius: 8px; margin: 25px 0; letter-spacing: 4px;">
              ${code}
            </div>
            
            <p style="color: #073B4C; font-size: 14px; margin-bottom: 10px;">
              This code will expire in 10 minutes.
            </p>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              ©️ 2024 Melodia. All rights reserved.
            </p>
          </div>
        </div>
      `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error: any) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    code: string,
    name: string
  ): Promise<boolean> {
    try {
      sgMail.setApiKey(this.apiKey);

      const msg = {
        to: email,
        from: this.fromEmail,
        subject: 'Reset your Melodia password',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #073B4C; font-size: 28px; margin: 0;">Password Reset</h1>
          </div>
          
          <div style="background: #FDFDFD; padding: 30px; border-radius: 12px; border: 1px solid #E5E7EB;">
            <p style="color: #073B4C; font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
            
            <p style="color: #073B4C; font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your password. Please use this verification code:
            </p>
            
            <div style="background: #FFD166; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #073B4C; border-radius: 8px; margin: 25px 0; letter-spacing: 4px;">
              ${code}
            </div>
            
            <p style="color: #073B4C; font-size: 14px; margin-bottom: 10px;">
              This code will expire in 10 minutes.
            </p>
            
            <p style="color: #6B7280; font-size: 14px; margin-bottom: 0;">
              If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6B7280; font-size: 12px; margin: 0;">
              ©️ 2024 Melodia. All rights reserved.
            </p>
          </div>
        </div>
      `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error: any) {
      console.error('SendGrid password reset error:', error);
      return false;
    }
  }
}

// Factory function to create email service
export const createEmailService = (): EmailService => {
  if (process.env.DEMO_MODE === 'true') {
    return new MockEmailService();
  }


  if (process.env.NODE_ENV === 'production' || process.env.SENDGRID_API_KEY) {
    return new SendGridEmailService(
      process.env.SENDGRID_API_KEY!,
      process.env.FROM_EMAIL!
    );
  }
  return new MockEmailService();
};