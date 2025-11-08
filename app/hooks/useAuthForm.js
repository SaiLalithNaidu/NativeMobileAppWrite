/**
 * Custom Hook for Authentication Forms
 * Integrates all authentication services into a single hook
 */

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FormHandlerService } from '../services/formHandlerService';

export function useAuthForm() {
  const auth = useAuth();
  const router = useRouter();
  const formHandler = new FormHandlerService(auth, router);
  
  // Initialize form state
  const [formState, setFormState] = useState(formHandler.getInitialState());

  return {
    // Form state
    formState,
    setFormState,
    
    // Form handlers
    handleLogin: (email, password) => {
      const updatedState = { ...formState, email, password };
      setFormState(updatedState);
      return formHandler.handleLogin(updatedState, setFormState);
    },
    
    handleSignup: (name, email, password, confirmPassword) => {
      const updatedState = { ...formState, name, email, password, confirmPassword };
      setFormState(updatedState);
      return formHandler.handleSignup(updatedState, setFormState);
    },
    
    handleForgotPassword: (resetEmail) => {
      const updatedState = { ...formState, resetEmail };
      setFormState(updatedState);
      return formHandler.handleForgotPassword(updatedState, setFormState);
    },
    
    // Field handlers
    handleFieldChange: (field, value) => {
      formHandler.handleFieldChange(field, value, formState, setFormState);
    },
    
    handlePasswordChange: (value) => {
      formHandler.handlePasswordChange(value, formState, setFormState);
    },
    
    // UI handlers
    togglePasswordVisibility: (field) => {
      formHandler.togglePasswordVisibility(field, formState, setFormState);
    },
    
    showForgotPasswordModal: () => {
      formHandler.showForgotPasswordModal(formState, setFormState);
    },
    
    hideForgotPasswordModal: () => {
      formHandler.hideForgotPasswordModal(formState, setFormState);
    },
    
    hideAlert: () => {
      formHandler.hideAlert(formState, setFormState);
    },
    
    // Utility methods
    clearForm: () => {
      formHandler.clearForm(formState, setFormState);
    },
    
    resetForm: () => {
      setFormState(formHandler.getInitialState());
    }
  };
}

export default useAuthForm;