/**
 * Payment Service
 * Small helpers for payment status calculation and messages
 */

// Friendly status messages
const PAYMENT_STATUS_MESSAGES = {
	UNPAID: 'Order marked as unpaid',
	PARTIAL: 'Partial payment recorded',
	FULL: 'Order marked as fully paid!',
};

/**
 * Calculate payment status based on paid and total amounts
 * @param {number} paidAmount
 * @param {number} totalAmount
 * @returns {'pending'|'partial'|'paid'}
 */
export const calculatePaymentStatus = (paidAmount, totalAmount) => {
	if (!paidAmount || paidAmount === 0) return 'pending';
	if (paidAmount >= totalAmount) return 'paid';
	return 'partial';
};

/**
 * Get a user-facing payment status message
 * @param {number} paidAmount
 * @param {number} totalAmount
 * @returns {string}
 */
export const getPaymentStatusMessage = (paidAmount, totalAmount) => {
	if (!paidAmount || paidAmount === 0) return PAYMENT_STATUS_MESSAGES.UNPAID;
	if (paidAmount >= totalAmount) return PAYMENT_STATUS_MESSAGES.FULL;
	return PAYMENT_STATUS_MESSAGES.PARTIAL;
};

export default {
	calculatePaymentStatus,
	getPaymentStatusMessage,
};
