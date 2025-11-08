/**
 * Form Handler Service
 * Centralized form handling and workflow management
 */

import { AuthService } from './authService';
import { UIStateService } from './uiStateService';

export class FormHandlerService {
  constructor(authContext, router) {
    this.authService = new AuthService(authContext, router);
    this.uiService = new UIStateService();
  }

  /**
   * Handle login form submission
   * @param {object} formState 
   * @param {function} setFormState 
   * @returns {Promise<void>}
   */
  async handleLogin(formState, setFormState) {
    const { email, password } = formState;

    // Clear previous errors
    this.uiService.setError('', formState, setFormState);

    // Validate credentials
    const validation = this.authService.validateLoginCredentials(email, password);
    if (!validation.isValid) {
      this.uiService.setError(validation.error, formState, setFormState);
      return;
    }

    // Set loading state
    this.uiService.setLoading(true, formState, setFormState);

    try {
      // Process login
      const result = await this.authService.processLogin(email, password);
      
      // Update UI based on result
      this.uiService.setLoading(false, formState, setFormState);
      
      if (!result.success) {
        this.uiService.setError(result.error, formState, setFormState);
        
        if (result.showAlert) {
          this.uiService.showAlert({
            message: result.error,
            type: result.alertType
          }, formState, setFormState);
        }
      }
    } catch (_error) {
      this.uiService.setLoading(false, formState, setFormState);
      this.uiService.setError('An unexpected error occurred', formState, setFormState);
    }
  }

  /**
   * Handle signup form submission
   * @param {object} formState 
   * @param {function} setFormState 
   * @returns {Promise<void>}
   */
  async handleSignup(formState, setFormState) {
    const { name, email, password, confirmPassword } = formState;

    // Clear previous errors
    this.uiService.setError('', formState, setFormState);

    // Validate credentials
    const validation = this.authService.validateSignupCredentials({
      name, email, password, confirmPassword
    });

    if (!validation.isValid) {
      this.uiService.setError(validation.error, formState, setFormState);
      
      if (validation.showAlert && validation.alertConfig) {
        this.uiService.showAlert(validation.alertConfig, formState, setFormState);
      }
      return;
    }

    // Set loading state
    this.uiService.setLoading(true, formState, setFormState);

    try {
      // Process signup
      const result = await this.authService.processSignup({ name, email, password });
      
      // Update UI based on result
      this.uiService.setLoading(false, formState, setFormState);
      
      if (!result.success) {
        this.uiService.setError(result.error, formState, setFormState);
        
        if (result.showAlert && result.alertConfig) {
          this.uiService.showAlert(result.alertConfig, formState, setFormState);
        }
      }
    } catch (_error) {
      this.uiService.setLoading(false, formState, setFormState);
      this.uiService.setError('An unexpected error occurred', formState, setFormState);
    }
  }

  /**
   * Handle forgot password form submission
   * @param {object} formState 
   * @param {function} setFormState 
   * @returns {Promise<void>}
   */
  async handleForgotPassword(formState, setFormState) {
    const { resetEmail } = formState;

    // Validate email
    const validation = this.authService.validateForgotPasswordEmail(resetEmail);
    if (!validation.isValid) {
      this.uiService.showAlert({
        message: validation.error,
        type: validation.alertType
      }, formState, setFormState);
      return;
    }

    // Set loading state
    this.uiService.setResetLoading(true, formState, setFormState);

    try {
      // Process forgot password
      const result = await this.authService.processForgotPassword(resetEmail);
      
      // Update UI based on result
      this.uiService.setResetLoading(false, formState, setFormState);
      
      // Show result alert
      this.uiService.showAlert({
        message: result.message,
        type: result.alertType
      }, formState, setFormState);
      
      // Close modal if successful
      if (result.success && result.closeModal) {
        this.uiService.hideForgotPasswordModal(formState, setFormState);
      }
    } catch (_error) {
      this.uiService.setResetLoading(false, formState, setFormState);
      this.uiService.showAlert({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      }, formState, setFormState);
    }
  }

  /**
   * Handle password field change with strength calculation
   * @param {string} value 
   * @param {object} formState 
   * @param {function} setFormState 
   */
  handlePasswordChange(value, formState, setFormState) {
    this.uiService.handleFieldChange('password', value, formState, setFormState);
  }

  /**
   * Handle generic field change
   * @param {string} field 
   * @param {string} value 
   * @param {object} formState 
   * @param {function} setFormState 
   */
  handleFieldChange(field, value, formState, setFormState) {
    this.uiService.handleFieldChange(field, value, formState, setFormState);
  }

  /**
   * Toggle password visibility
   * @param {string} field 
   * @param {object} formState 
   * @param {function} setFormState 
   */
  togglePasswordVisibility(field, formState, setFormState) {
    this.uiService.togglePasswordVisibility(field, formState, setFormState);
  }

  /**
   * Show forgot password modal
   * @param {object} formState 
   * @param {function} setFormState 
   */
  showForgotPasswordModal(formState, setFormState) {
    this.uiService.showForgotPasswordModal(formState, setFormState);
  }

  /**
   * Hide forgot password modal
   * @param {object} formState 
   * @param {function} setFormState 
   */
  hideForgotPasswordModal(formState, setFormState) {
    this.uiService.hideForgotPasswordModal(formState, setFormState);
  }

  /**
   * Hide alert
   * @param {object} formState 
   * @param {function} setFormState 
   */
  hideAlert(formState, setFormState) {
    this.uiService.hideAlert(formState, setFormState);
  }

  /**
   * Get initial form state
   * @returns {object} initial state
   */
  getInitialState() {
    return this.uiService.getInitialState();
  }
}

export default FormHandlerService;