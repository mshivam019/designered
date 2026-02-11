import nodemailer from 'nodemailer';

interface EmailConfig {
    host: string;
    port: number;
    auth: {
        user: string;
        pass: string;
    };
}

function parseEmailServer(serverUrl: string): EmailConfig {
    // Format: smtp://user:pass@host:port or smtps://user:pass@host:port
    const url = new URL(serverUrl);
    return {
        host: url.hostname,
        port: parseInt(url.port, 10) || (url.protocol === 'smtps:' ? 465 : 587),
        auth: {
            user: decodeURIComponent(url.username),
            pass: decodeURIComponent(url.password)
        }
    };
}

export async function sendOTPEmail({
    to,
    otp,
    name
}: {
    to: string;
    otp: string;
    name?: string | null;
}): Promise<void> {
    const emailServer = process.env.EMAIL_SERVER;
    const emailFrom = process.env.EMAIL_FROM;

    if (!emailServer || !emailFrom) {
        throw new Error('Email configuration missing');
    }

    const config = parseEmailServer(emailServer);

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: config.auth
    });

    await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Your Designered Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3b82f6;">Verify Your Email</h2>
                <p>Hi ${name || 'there'},</p>
                <p>Thank you for signing up for Designered! Please use the verification code below to complete your registration:</p>
                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, you can safely ignore this email.</p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    Best regards,<br>
                    The Designered Team
                </p>
            </div>
        `,
        text: `Hi ${name || 'there'},\n\nYour Designered verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.\n\nBest regards,\nThe Designered Team`
    });
}

export function generateOTP(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
}
