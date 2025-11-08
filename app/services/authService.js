/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import { formatAuthError, isValidEmail, validatePasswordStrength } from './validationService';

export class AuthService {
  constructor(authContext, router) {
    this.auth = authContext;
    this.router = router;
  }

  /**
   * Validate login credentials
   * @param {string} email 
   * @param {string} password 
   * @returns {object} validation result
   */
  validateLoginCredentials(email, password) {
    if (!email || !password) {
      return { isValid: false, error: 'Please enter both email and password' };
    }

    if (!isValidEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate signup credentials
   * @param {object} credentials 
   * @returns {object} validation result
   */
  validateSignupCredentials({ name, email, password, confirmPassword }) {
    // Required fields validation
    if (!name || !email || !password || !confirmPassword) {
      return { isValid: false, error: 'Please fill in all fields' };
    }

    // Name validation
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Name must be at least 2 characters' };
    }

    // Email validation
    if (!isValidEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      const errorList = passwordValidation.errors.join('\n• ');
      return {
        isValid: false,
        error: `Password must contain:\n• ${errorList}`,
        showAlert: true,
        alertConfig: {
          title: 'Weak Password',
          message: `Your password must contain:\n\n• ${errorList}`,
          type: 'error'
        }
      };
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match',
        showAlert: true,
        alertConfig: {
          title: 'Password Mismatch',
          message: 'The passwords you entered do not match. Please try again.',
          type: 'error'
        }
      };
    }

    return { isValid: true };
  }

  /**
   * Process login attempt
   * @param {string} email 
   * @param {string} password 
   * @returns {object} login result
   */
  async processLogin(email, password) {
    try {
      const result = await this.auth.login(email, password);
      
      if (result.success) {
        // Navigate to main screen after successful login
        this.router.replace('/(tabs)/home');
        return { success: true };
      } else {
        const friendlyMessage = formatAuthError(result.error);
        return {
          success: false,
          error: friendlyMessage,
          showAlert: true,
          alertType: 'error'
        };
      }
    } catch (error) {
      console.error('Login processing error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during login',
        showAlert: true,
        alertType: 'error'
      };
    }
  }

  /**
   * Process signup attempt
   * @param {object} credentials 
   * @returns {object} signup result
   */
  async processSignup({ name, email, password }) {
    try {
      const result = await this.auth.signup(email, password, name);

      if (result.success) {
        // Navigate to main screen after successful signup
        this.router.replace('/(tabs)/home');
        return { success: true };
      } else {
        const friendlyMessage = formatAuthError(result.error);
        return {
          success: false,
          error: friendlyMessage,
          showAlert: true,
          alertConfig: {
            title: 'Sign Up Failed',
            message: friendlyMessage,
            type: 'error'
          }
        };
      }
    } catch (error) {
      console.error('Signup processing error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during signup',
        showAlert: true,
        alertConfig: {
          title: 'Sign Up Failed',
          message: 'An unexpected error occurred during signup',
          type: 'error'
        }
      };
    }
  }

  /**
   * Validate forgot password email
   * @param {string} email 
   * @returns {object} validation result
   */
  validateForgotPasswordEmail(email) {
    if (!email) {
      return {
        isValid: false,
        error: 'Please enter your email address to reset your password.',
        alertType: 'error'
      };
    }

    if (!isValidEmail(email)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address.',
        alertType: 'error'
      };
    }

    return { isValid: true };
  }

  /**
   * Process forgot password request
   * @param {string} email 
   * @returns {object} reset result
   */
  async processForgotPassword(email) {
    try {
      console.log('Attempting to send password reset email to:', email);
      const result = await this.auth.resetPassword(email);
      console.log('Password reset result:', result);

      if (result.success) {
        return {
          success: true,
          alertType: 'success',
          message: `✅ Password reset email sent to ${email}!\n\n📧 Please check:\n• Your inbox\n• Spam/Junk folder\n• Promotions tab (Gmail)\n\n💡 If you don't see it, try adding noreply@rameshaqua-1fc5f.firebaseapp.com to your contacts.`,
          closeModal: true
        };
      } else {
        const friendlyMessage = formatAuthError(result.error);
        return {
          success: false,
          alertType: 'error',
          message: `Reset failed: ${friendlyMessage}. Please make sure the email address is registered.`
        };
      }
    } catch (error) {
      console.error('Unexpected error in forgot password:', error);
      return {
        success: false,
        alertType: 'error',
        message: 'An unexpected error occurred. Please try again.'
      };
    }
  }
}

export default AuthService;