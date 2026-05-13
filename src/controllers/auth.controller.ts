import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { config } from '../config/env';

export class AuthController {
  public static async signup(req: Request, res: Response) {
    try {
      const { email, password, name, ...profileData } = req.body;
      console.log(`[AUTH] Attempting signup for email: ${email}`);

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log(`[AUTH] Signup failed: User already exists (${email})`);
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Create new user
      console.log(`[AUTH] Creating new user: ${name} (${email})`);
      const user = new User({
        email,
        password,
        name,
        ...profileData
      });

      await user.save();
      console.log(`[AUTH] User saved successfully. Generating token...`);

      // Generate token
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

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await (user as any).comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
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
}
