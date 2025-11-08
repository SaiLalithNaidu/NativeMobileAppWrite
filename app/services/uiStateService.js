/**
 * UI State Management Service
 * Handles UI state management and form interactions
 */

export class UIStateService {
  constructor() {
    this.initialState = {
      // Form states
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      resetEmail: '',
      
      // UI states
      loading: false,
      resetLoading: false,
      error: '',
      passwordStrength: 'weak',
      
      // Visibility states
      showPassword: false,
      showConfirmPassword: false,
      showAlert: false,
      showForgotPassword: false,
      
      // Alert configuration
      alertMessage: '',
      alertType: 'error',
      alertConfig: { title: '', message: '', type: 'error' }
    };
  }

  /**
   * Create initial state for auth components
   * @returns {object} initial state
   */
  getInitialState() {
    return { ...this.initialState };
  }

  /**
   * Handle form field changes
   * @param {string} field 
   * @param {string} value 
   * @param {object} state 
   * @param {function} setState 
   * @returns {object} updated state
   */
  handleFieldChange(field, value, state, setState) {
    const newState = { ...state, [field]: value };
    
    // Special handling for password strength
    if (field === 'password') {
      const { getPasswordStrength } = require('./validationService');
      newState.passwordStrength = value ? getPasswordStrength(value) : 'weak';
    }
    
    setState(newState);
    return newState;
  }

  /**
   * Toggle password visibility
   * @param {string} field 
   * @param {object} state 
   * @param {function} setState 
   */
  togglePasswordVisibility(field, state, setState) {
    setState({ ...state, [field]: !state[field] });
  }

  /**
   * Set loading state
   * @param {boolean} loading 
   * @param {object} state 
   * @param {function} setState 
   */
  setLoading(loading, state, setState) {
    setState({ ...state, loading });
  }

  /**
   * Set reset loading state
   * @param {boolean} resetLoading 
   * @param {object} state 
   * @param {function} setState 
   */
  setResetLoading(resetLoading, state, setState) {
    setState({ ...state, resetLoading });
  }

  /**
   * Set error message
   * @param {string} error 
   * @param {object} state 
   * @param {function} setState 
   */
  setError(error, state, setState) {
    setState({ ...state, error });
  }

  /**
   * Show alert with configuration
   * @param {object} alertConfig 
   * @param {object} state 
   * @param {function} setState 
   */
  showAlert(alertConfig, state, setState) {
    setState({
      ...state,
      showAlert: true,
      alertMessage: alertConfig.message || '',
      alertType: alertConfig.type || 'error',
      alertConfig: alertConfig
    });
  }

  /**
   * Hide alert
   * @param {object} state 
   * @param {function} setState 
   */
  hideAlert(state, setState) {
    setState({
      ...state,
      showAlert: false,
      alertMessage: '',
      alertType: 'error'
    });
  }

  /**
   * Show forgot password modal
   * @param {object} state 
   * @param {function} setState 
   */
  showForgotPasswordModal(state, setState) {
    setState({ ...state, showForgotPassword: true });
  }

  /**
   * Hide forgot password modal
   * @param {object} state 
   * @param {function} setState 
   */
  hideForgotPasswordModal(state, setState) {
    setState({
      ...state,
      showForgotPassword: false,
      resetEmail: ''
    });
  }

  /**
   * Clear all form data
   * @param {object} state 
   * @param {function} setState 
   */
  clearForm(state, setState) {
    setState({
      ...state,
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      resetEmail: '',
      error: '',
      passwordStrength: 'weak'
    });
  }

  /**
   * Reset component to initial state
   * @param {function} setState 
   */
  resetToInitialState(setState) {
    setState(this.getInitialState());
  }
}

export default UIStateService;