import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    if (this.configService.smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: this.configService.smtpHost,
        port: this.configService.smtpPort,
        secure: this.configService.smtpPort === 465,
        auth: {
          user: this.configService.smtpUser,
          pass: this.configService.smtpPass,
        },
      });
      this.logger.log(`Email configured via ${this.configService.smtpHost}`);
    } else {
      this.logger.warn("SMTP not configured — emails will be logged to console");
    }
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    const link = `easypoints://auth/verify?token=${token}`;
    const subject = "Sign in to EasyPoints";
    const html = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1A1A2E; margin-bottom: 8px;">Sign in to EasyPoints</h2>
        <p style="color: #6B7280; font-size: 16px;">
          Click the button below to sign in. This link expires in 15 minutes.
        </p>
        <a href="${link}" style="
          display: inline-block;
          background: #6C63FF;
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 16px;
          margin: 24px 0;
        ">Sign In</a>
        <p style="color: #9CA3AF; font-size: 13px;">
          If the button doesn't work, enter this code in the app: <strong>${token}</strong>
        </p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
        <p style="color: #9CA3AF; font-size: 12px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.configService.emailFrom,
        to: email,
        subject,
        html,
      });
      this.logger.log(`Magic link email sent to ${email}`);
    } else {
      this.logger.log(`[DEV] Magic link for ${email}: ${token}`);
      this.logger.log(`[DEV] Deep link: ${link}`);
    }
  }
}
