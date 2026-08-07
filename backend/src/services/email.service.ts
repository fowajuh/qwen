import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const emailService = {
  // Send verification email
  async sendVerificationEmail(to: string, userId: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    const html = `
      <h1>Welcome to Nexa!</h1>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">If you didn't create a Nexa account, please ignore this email.</p>
    `;

    const text = `
      Welcome to Nexa!
      
      Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create a Nexa account, please ignore this email.
    `;

    await this.send({
      to,
      subject: 'Verify your email - Nexa',
      html,
      text,
    });
  },

  // Send password reset email
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #DC2626; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
    `;

    const text = `
      Password Reset Request
      
      You requested to reset your password. Visit this link to proceed:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, please ignore this email.
    `;

    await this.send({
      to,
      subject: 'Reset your password - Nexa',
      html,
      text,
    });
  },

  // Send booking confirmation
  async sendBookingConfirmation(
    to: string,
    bookingDetails: {
      listingTitle: string;
      checkIn: string;
      checkOut: string;
      guestCount: number;
      totalPrice: number;
      confirmationCode: string;
    }
  ): Promise<void> {
    const html = `
      <h1>Booking Confirmed! 🎉</h1>
      <p>Your booking has been confirmed. Here are the details:</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">${bookingDetails.listingTitle}</h2>
        <p><strong>Check-in:</strong> ${bookingDetails.checkIn}</p>
        <p><strong>Check-out:</strong> ${bookingDetails.checkOut}</p>
        <p><strong>Guests:</strong> ${bookingDetails.guestCount}</p>
        <p><strong>Total Price:</strong> $${bookingDetails.totalPrice.toFixed(2)}</p>
        <p><strong>Confirmation Code:</strong> ${bookingDetails.confirmationCode}</p>
      </div>
      
      <p>We're excited to host you! If you have any questions, feel free to reach out.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Nexa - The AI Operating System for Local Commerce</p>
    `;

    await this.send({
      to,
      subject: `Booking Confirmed - ${bookingDetails.confirmationCode}`,
      html,
    });
  },

  // Send welcome email
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to Nexa, ${name}! 👋</h1>
      <p>We're thrilled to have you on board.</p>
      <p>Nexa is your AI-powered platform for discovering local businesses and booking unique stays.</p>
      
      <h2>Getting Started:</h2>
      <ul>
        <li>Explore local businesses in your area</li>
        <li>Book unique accommodations for your next trip</li>
        <li>Leave reviews and help others discover great places</li>
      </ul>
      
      <a href="${process.env.FRONTEND_URL}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Start Exploring
      </a>
      
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px;">Questions? Reply to this email - we'd love to hear from you!</p>
    `;

    await this.send({
      to,
      subject: 'Welcome to Nexa! 🎉',
      html,
    });
  },

  // Generic send method
  async send(options: EmailOptions): Promise<void> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
        console.log(`Email would be sent to: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        return;
      }

      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'Nexa <onboarding@resend.dev>',
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      if (error) {
        console.error('Failed to send email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      console.log(`✅ Email sent to ${options.to}: ${data?.id}`);
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  },
};

export default emailService;
