/**
 * Validation Service
 * Small reusable validators used by UI screens
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

export default { isValidEmail, isValidPhone };
