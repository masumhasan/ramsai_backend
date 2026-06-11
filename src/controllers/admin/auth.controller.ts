import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../../models/user.model';
import { config } from '../../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: config.emailUser, pass: config.emailPassword },
});

export class AdminAuthController {
  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ error: 'Access denied: admin privileges required' });
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });

      return res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error: any) {
      console.error('[ADMIN AUTH] Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findOne({ email });
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(404).json({ error: 'No admin account found with this email' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      user.set({ otpCode: otp, otpExpires });
      await user.save({ validateBeforeSave: false });

      await transporter.sendMail({
        from: `"GoCal Admin" <${config.emailUser}>`,
        to: email,
        subject: 'Admin Dashboard - Password Reset OTP',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
            <h2 style="color:#333;">Admin Password Reset</h2>
            <p>Your OTP to reset your admin password is:</p>
            <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2E6FFC;margin:24px 0;">
              ${otp}
            </div>
            <p style="color:#666;">Expires in <strong>10 minutes</strong>. Do not share this code.</p>
          </div>`,
      });

      return res.json({ message: 'OTP sent to your email' });
    } catch (error: any) {
      console.error('[ADMIN AUTH] SendOtp error:', error);
      return res.status(500).json({ error: 'Failed to send OTP' });
    }
  }

  public static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      const user = await User.findOne({ email });
      if (!user || !user.otpCode || !user.otpExpires) {
        return res.status(400).json({ error: 'No OTP requested for this account' });
      }
      if (new Date() > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired' });
      }
      if (user.otpCode !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      return res.json({ message: 'OTP verified' });
    } catch (error: any) {
      console.error('[ADMIN AUTH] VerifyOtp error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP and new password are required' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const user = await User.findOne({ email });
      if (!user || !user.otpCode || !user.otpExpires) {
        return res.status(400).json({ error: 'Invalid reset request' });
      }
      if (new Date() > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired' });
      }
      if (user.otpCode !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      user.password = newPassword;
      user.set({ otpCode: undefined, otpExpires: undefined });
      await user.save();

      console.log(`[ADMIN AUTH] Password reset for admin: ${email}`);
      return res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('[ADMIN AUTH] ResetPassword error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
