import express from 'express';
import {
    signupWithEmail,
    verifyEmailOTP,
    signupWithPhone,
    verifyPhoneOTP,
    loginWithEmail,
    loginWithPhone,
    resendOTP,
    logout,
    getProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/signup-email', signupWithEmail);
router.post('/verify-email-otp', verifyEmailOTP);
router.post('/signup-phone', signupWithPhone);
router.post('/verify-phone-otp', verifyPhoneOTP);
router.post('/login-email', loginWithEmail);
router.post('/login-phone', loginWithPhone);
router.post('/resend-otp', resendOTP);

// Protected routes (require authentication)
router.post('/logout', authenticateToken, logout);
router.get('/profile', authenticateToken, getProfile);

export default router;
