import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/user.model';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword,
  },
});

export class AuthController {
  public static async signup(req: Request, res: Response) {
    try {
      const { email, password, name, ...profileData } = req.body;
      console.log(`[AUTH] Attempting signup for email: ${email}`);

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`[AUTH] Signup failed: User already exists (${email})`);
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      console.log(`[AUTH] Creating new user: ${name} (${email})`);
      const user = new User({
        email,
        password,
        name,
        ...profileData
      });

      await user.save();
      console.log(`[AUTH] User saved successfully. Generating token...`);

      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error('Signup Error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error('Login Error:', error);
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
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.set({ otpCode: otp, otpExpires });
      await user.save({ validateBeforeSave: false });

      await transporter.sendMail({
        from: `"GoCal AI" <${config.emailUser}>`,
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Your OTP to reset your password is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; margin: 24px 0;">
              ${otp}
            </div>
            <p style="color: #666;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      return res.json({ message: 'OTP sent to your email' });
    } catch (error: any) {
      console.error('SendOtp Error:', error);
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
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email' });
      }

      if (!user.otpCode || !user.otpExpires) {
        return res.status(400).json({ error: 'No OTP requested for this account' });
      }

      if (new Date() > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (user.otpCode !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      return res.json({ message: 'OTP verified' });
    } catch (error: any) {
      console.error('VerifyOtp Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'Email, OTP and new password are required' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email' });
      }

      if (!user.otpCode || !user.otpExpires) {
        return res.status(400).json({ error: 'No OTP requested for this account' });
      }

      if (new Date() > user.otpExpires) {
        return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
      }

      if (user.otpCode !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
      }

      user.password = newPassword;
      user.set({ otpCode: undefined, otpExpires: undefined });
      await user.save();

      return res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      console.error('ResetPassword Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
