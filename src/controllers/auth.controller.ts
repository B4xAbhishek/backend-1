import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { OTPVerificationResponse } from '../interfaces/auth.interface';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const result = await this.authService.login({ email, password });

      if (!result.success) {
        return res.status(401).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  public verifyOTP = async (req: Request, res: Response): Promise<Response<OTPVerificationResponse>> => {
    try {
      const { history_id, otp } = req.body;

      if (!history_id || !otp) {
        return res.status(400).json({
          success: false,
          message: 'History ID and OTP are required'
        });
      }

      const result = await this.authService.verifyOTP(history_id, otp);
      
      if (!result || !result.user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP verification result'
        });
      }

      // Generate JWT token after successful verification
      const token = jwt.sign(
        { 
          user_id: result.user.login_id,
          account_code: result.user.account_code 
        },
        process.env.JWT_SECRET || 'Abhishek@123',  // Fallback secret
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        token,
        user: {
          full_name: result.user.first_name + ' ' + result.user.last_name,
          email: result.user.email,
          phone: result.user.phone,
          date_of_birth: result.user.date_of_birth,
          age: result.user.age,
          address: result.user.address,
          city: result.user.city,
          state: result.user.state,
          country: result.user.country,
          zip_code: result.user.zip_code,
          account_code: result.user.account_code
        }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
} 