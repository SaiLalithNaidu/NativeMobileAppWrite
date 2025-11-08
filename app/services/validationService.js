/**
 * Validation Service
 * Reusable validators used by UI screens
 */

/** Validate email address format */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/** Validate phone number format (10 digits) */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('At least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('One uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('One lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('One number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('One special character (!@#$%^&*...)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get password strength level (weak, medium, strong)
 * @param {string} password
 * @returns {'weak'|'medium'|'strong'}
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

/**
 * Format Firebase error messages to user-friendly text
 * @param {string} firebaseError - Raw Firebase error message
 * @returns {string} User-friendly error message
 */
export const formatAuthError = (firebaseError) => {
  if (!firebaseError) return 'An error occurred. Please try again.';
  
  const errorLower = firebaseError.toLowerCase();
  
  // Sign-in errors
  if (errorLower.includes('user-not-found') || errorLower.includes('invalid-credential')) {
    return 'Invalid email or password. Please check your credentials.';
  }
  if (errorLower.includes('wrong-password')) {
    return 'Incorrect password. Please try again.';
  }
  if (errorLower.includes('too-many-requests')) {
    return 'Too many failed attempts. Please try again later.';
  }
  if (errorLower.includes('network')) {
    return 'Network error. Please check your connection.';
  }
  
  // Sign-up errors
  if (errorLower.includes('email-already-in-use')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (errorLower.includes('weak-password')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  if (errorLower.includes('invalid-email')) {
    return 'Invalid email format. Please check your email address.';
  }
  
  // Password reset errors
  if (errorLower.includes('user-not-found')) {
    return 'No account found with this email address. Please check the email or create a new account.';
  }
  if (errorLower.includes('invalid-email')) {
    return 'Invalid email address. Please check your email format.';
  }
  if (errorLower.includes('auth/missing-email')) {
    return 'Please enter your email address.';
  }
  
  // Generic fallback
  return 'Authentication failed. Please try again.';
};

export default { 
  isValidEmail, 
  isValidPhone, 
  validatePasswordStrength,
  getPasswordStrength,
  formatAuthError
};