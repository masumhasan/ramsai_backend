"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const env_1 = require("../../config/env");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: { user: env_1.config.emailUser, pass: env_1.config.emailPassword },
});
class AdminAuthController {
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const user = await user_model_1.default.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            if (user.role !== 'admin' && user.role !== 'superadmin') {
                return res.status(403).json({ error: 'Access denied: admin privileges required' });
            }
            if (user.isBanned) {
                return res.status(403).json({ error: 'Account is banned' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            await user_model_1.default.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, env_1.config.jwtSecret, { expiresIn: '7d' });
            return res.json({
                token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
            });
        }
        catch (error) {
            console.error('[ADMIN AUTH] Login error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async sendOtp(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }
            const user = await user_model_1.default.findOne({ email });
            if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
                return res.status(404).json({ error: 'No admin account found with this email' });
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            user.set({ otpCode: otp, otpExpires });
            await user.save({ validateBeforeSave: false });
            await transporter.sendMail({
                from: `"GoCal Admin" <${env_1.config.emailUser}>`,
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
        }
        catch (error) {
            console.error('[ADMIN AUTH] SendOtp error:', error);
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ error: 'Email and OTP are required' });
            }
            const user = await user_model_1.default.findOne({ email });
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
        }
        catch (error) {
            console.error('[ADMIN AUTH] VerifyOtp error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                return res.status(400).json({ error: 'Email, OTP and new password are required' });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'Password must be at least 8 characters' });
            }
            const user = await user_model_1.default.findOne({ email });
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
        }
        catch (error) {
            console.error('[ADMIN AUTH] ResetPassword error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.AdminAuthController = AdminAuthController;
