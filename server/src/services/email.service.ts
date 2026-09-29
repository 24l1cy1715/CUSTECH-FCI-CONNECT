import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';

export interface SendOtpOptions {
  to: string;
  otp: string;
  userName?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
    const port = parseInt(env.BREVO_SMTP_PORT || '587', 10);
    const user = env.BREVO_SMTP_USER;
    const pass = env.BREVO_SMTP_KEY;

    if (!user || !pass) {
      // In development / testing without active Brevo credentials, transporter will be null
      return null;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: env.NODE_ENV === 'production',
      },
    });

    return this.transporter;
  }

  /**
   * Generates the FCI Connect branded HTML email template for Password Reset OTP.
   * Brand colors: Deep navy (#0f172a, #1e293b), Gold/Orange accent (#f59e0b, #d97706), White (#ffffff).
   */
  public static buildPasswordResetHtml(otp: string, userName?: string): string {
    const greeting = userName ? `Hello, ${userName}` : 'Hello';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CUSTECH FCI Connect - Password Reset Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 580px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 32px 40px;
      text-align: center;
      border-bottom: 3px solid #f59e0b;
    }
    .brand-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin: 0;
      text-transform: uppercase;
    }
    .brand-sub {
      color: #f59e0b;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-top: 6px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px;
    }
    .headline {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .message-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-container {
      background-color: #f8fafc;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 10px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #0f172a;
      margin: 0;
      user-select: all;
    }
    .expiry-badge {
      display: inline-block;
      margin-top: 12px;
      font-size: 12px;
      font-weight: 600;
      color: #d97706;
      background-color: #fef3c7;
      padding: 4px 12px;
      border-radius: 9999px;
    }
    .security-notice {
      border-left: 3px solid #f59e0b;
      background-color: #fffbeb;
      padding: 14px 16px;
      border-radius: 0 6px 6px 0;
      margin: 24px 0;
    }
    .security-notice p {
      font-size: 13px;
      line-height: 1.5;
      color: #92400e;
      margin: 0;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1 class="brand-title">CUSTECH FCI CONNECT</h1>
        <div class="brand-sub">Faculty of Computing &amp; Informatics</div>
      </div>
      <div class="content">
        <h2 class="headline">Password Reset Verification</h2>
        <p class="message-text">${greeting},</p>
        <p class="message-text">We received a request to reset your password for your CUSTECH FCI Connect account. Use the verification code below to authorize this request.</p>
        
        <div class="otp-container">
          <div class="otp-label">Your verification code is:</div>
          <div class="otp-code">${otp}</div>
          <div class="expiry-badge">This code expires in 10 minutes</div>
        </div>

        <div class="security-notice">
          <p><strong>Security Notice:</strong> Never share this verification code with anyone. CUSTECH staff and faculty administrators will never ask for your password or verification code.</p>
        </div>

        <p class="message-text" style="font-size: 13px; color: #64748b; margin-top: 20px;">
          If you did not request a password reset, you can safely ignore this email. Your account remains secure.
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">&copy; ${new Date().getFullYear()} CUSTECH Faculty of Computing &amp; Informatics.</p>
        <p class="footer-text">Confluence University of Science and Technology, Osara, Kogi State, Nigeria.</p>
        <p class="footer-text">Support &amp; Inquiries: support@custech.edu.ng</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Plain text version for mail clients that do not render HTML.
   */
  public static buildPasswordResetText(otp: string): string {
    return `CUSTECH FCI Connect\nPassword Reset Verification\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.\n\nSecurity Notice: Never share this code with anyone. CUSTECH staff will never ask for your verification code.\n\nSupport: support@custech.edu.ng`;
  }

  /**
   * Send the Password Reset OTP email.
   * If Brevo SMTP credentials are not configured, securely logs to server console in dev.
   */
  public static async sendPasswordResetOtp(options: SendOtpOptions): Promise<boolean> {
    const { to, otp, userName } = options;
    const transporter = this.getTransporter();

    const fromAddress = env.EMAIL_FROM || 'no-reply@custech.edu.ng';
    const fromName = env.EMAIL_FROM_NAME || 'CUSTECH FCI Connect';
    const from = `"${fromName}" <${fromAddress}>`;

    const mailOptions = {
      from,
      to,
      subject: 'CUSTECH FCI Connect - Password Reset Verification Code',
      text: this.buildPasswordResetText(otp),
      html: this.buildPasswordResetHtml(otp, userName),
    };

    if (!transporter) {
      // In development / testing without active SMTP credentials, log securely to console
      console.log(`\n======================================================`);
      console.log(`[EMAIL SERVICE] (Brevo SMTP not configured / local mode)`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Your verification code is: ${otp} (Expires in 10 minutes)`);
      console.log(`======================================================\n`);
      return true;
    }

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE] Password reset email sent to ${to}. MessageId: ${info.messageId}`);
      return true;
    } catch (error: any) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, error.message);
      // Return false so caller knows delivery failed, but do not leak details to the end-user
      return false;
    }
  }
}
