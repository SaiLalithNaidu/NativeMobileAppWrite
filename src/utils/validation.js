import { ERROR_MESSAGES } from './constants';

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export const validatePassword = (password) => {
  if (!password || !password.trim()) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_PASSWORD };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate required field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: null };
};

/**
 * Validate number field
 * @param {string|number} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, required = true } = options;
  
  if (required && (value === '' || value === null || value === undefined)) {
    return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Must be a valid number' };
  }
  
  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }
  
  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Must be at most ${max}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @param {boolean} required - Is field required
 * @returns {Object} Validation result
 */
export const validateURL = (url, required = false) => {
  if (!url || !url.trim()) {
    if (required) {
      return { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD };
    }
    return { isValid: true, error: null };
  }
  
  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Must be a valid URL' };
  }
};

/**
 * Validate login form
 * @param {Object} formData - Form data
 * @returns {Object} Validation result with errors object
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate signup form
 * @param {Object} formData - Form data
 * @returns {Object} Validation result with errors object
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  const nameValidation = validateRequired(formData.name, 'Name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }
  
  if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate company form
 * @param {Object} formData - Form data
 * @returns {Object} Validation result with errors object
 */
export const validateCompanyForm = (formData) => {
  const errors = {};
  
  const nameValidation = validateRequired(formData.name, 'Company name');
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate category form
 * @param {Object} formData - Form data
 * @returns {Object} Validation result with errors object
 */
export const validateCategoryForm = (formData) => {
  const errors = {};
  
  const titleValidation = validateRequired(formData.title, 'Category title');
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }
  
  const companyIdValidation = validateRequired(formData.companyId, 'Company selection');
  if (!companyIdValidation.isValid) {
    errors.companyId = companyIdValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate product form
 * @param {Object} formData - Form data
 * @returns {Object} Validation result with errors object
 */
export const validateProductForm = (formData) => {
  const errors = {};
  
  const titleValidation = validateRequired(formData.title, 'Product title');
  if (!titleValidation.isValid) {
    errors.title = titleValidation.error;
  }
  
  const priceValidation = validateNumber(formData.price, { min: 0, required: true });
  if (!priceValidation.isValid) {
    errors.price = priceValidation.error;
  }
  
  const companyIdValidation = validateRequired(formData.companyId, 'Company selection');
  if (!companyIdValidation.isValid) {
    errors.companyId = companyIdValidation.error;
  }
  
  const categoryIdValidation = validateRequired(formData.categoryId, 'Category selection');
  if (!categoryIdValidation.isValid) {
    errors.categoryId = categoryIdValidation.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateRequired,
  validateNumber,
  validateURL,
  validateLoginForm,
  validateSignupForm,
  validateCompanyForm,
  validateCategoryForm,
  validateProductForm,
};
