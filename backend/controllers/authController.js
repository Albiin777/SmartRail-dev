import { supabase, supabaseAdmin } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generate JWT token
 */
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Sign up with email and send OTP
 */
export const signupWithEmail = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Sign up user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName || '',
                },
                emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Signup successful! Please check your email for verification.',
            user: {
                id: data.user?.id,
                email: data.user?.email
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verify email OTP
 */
export const verifyEmailOTP = async (req, res) => {
    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ error: 'Email and OTP token are required' });
        }

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Generate our own JWT for session management
        const jwtToken = generateToken(data.user.id, data.user.email);

        res.status(200).json({
            message: 'Email verified successfully',
            token: jwtToken,
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Sign up with phone and send OTP
 */
export const signupWithPhone = async (req, res) => {
    try {
        const { phone, password, fullName } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: 'Phone and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            phone,
            password,
            options: {
                data: {
                    full_name: fullName || '',
                }
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Signup successful! Please check your phone for OTP.',
            user: {
                id: data.user?.id,
                phone: data.user?.phone
            }
        });
    } catch (error) {
        console.error('Phone signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (req, res) => {
    try {
        const { phone, token } = req.body;

        if (!phone || !token) {
            return res.status(400).json({ error: 'Phone and OTP token are required' });
        }

        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token,
            type: 'sms'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const jwtToken = generateToken(data.user.id, data.user.phone);

        res.status(200).json({
            message: 'Phone verified successfully',
            token: jwtToken,
            user: {
                id: data.user.id,
                phone: data.user.phone,
                fullName: data.user.user_metadata?.full_name
            }
        });
    } catch (error) {
        console.error('Verify phone OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const jwtToken = generateToken(data.user.id, data.user.email);

        res.status(200).json({
            message: 'Login successful',
            token: jwtToken,
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Login with phone (sends OTP)
 */
export const loginWithPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const { data, error } = await supabase.auth.signInWithOtp({
            phone
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'OTP sent to your phone',
            phone
        });
    } catch (error) {
        console.error('Phone login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (req, res) => {
    try {
        const { email, phone, type } = req.body;

        if (!type || (type === 'email' && !email) || (type === 'sms' && !phone)) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        const { error } = await supabase.auth.resend({
            type: type === 'email' ? 'signup' : 'sms',
            email: type === 'email' ? email : undefined,
            phone: type === 'sms' ? phone : undefined
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: `OTP resent successfully to your ${type === 'email' ? 'email' : 'phone'}`
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Logout user
 */
export const logout = async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: data.user.id,
                email: data.user.email,
                phone: data.user.phone,
                fullName: data.user.user_metadata?.full_name,
                createdAt: data.user.created_at
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export default {
    signupWithEmail,
    verifyEmailOTP,
    signupWithPhone,
    verifyPhoneOTP,
    loginWithEmail,
    loginWithPhone,
    resendOTP,
    logout,
    getProfile
};
