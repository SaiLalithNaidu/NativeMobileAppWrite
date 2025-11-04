/**
 * Checkout Screen
 * 
 * Purpose: Customer billing form for order placement
 * 
 * Features:
 * - Collect customer information (name, email, phone)
 * - Display order summary with GST calculation
 * - Support partial payment at checkout
 * - Real-time payment breakdown visualization
 * - Form validation before order creation
 * - Integration with Firebase for order persistence
 * 
 * @module CheckoutScreen
 */

import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCart } from '../contexts/CartContext';
import { COLORS } from '../src/utils/constants';
import { createOrderObject, saveOrderToDatabase } from './services/billingService';
import { getCartSummary } from './services/cartService';
import { isValidEmail, isValidPhone } from './services/validationService';

// Validation helpers are imported from app/services/validationService

// ==================== SUB-COMPONENTS ====================

/**
 * Screen header with title and subtitle
 */
const CheckoutHeader = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Billing Details</Text>
    <Text style={styles.headerSubtitle}>
      Enter your details to complete the order
    </Text>
  </View>
);

/**
 * Payment breakdown showing total, paid, and remaining amounts
 */
const PaymentBreakdown = ({ total, paidAmount }) => {
  if (!paidAmount || isNaN(parseFloat(paidAmount)) || parseFloat(paidAmount) <= 0) {
    return null;
  }

  const paid = parseFloat(paidAmount);
  const remaining = Math.max(0, total - paid);

  return (
    <View style={styles.paymentBreakdown}>
      <View style={styles.breakdownRow}>
        <Text style={styles.breakdownLabel}>Total Bill:</Text>
        <Text style={styles.breakdownTotal}>₹{total.toFixed(2)}</Text>
      </View>
      <View style={[styles.breakdownRow, styles.paidRow]}>
        <Text style={styles.breakdownLabel}>✓ Paid Now:</Text>
        <Text style={styles.breakdownPaid}>₹{paid.toFixed(2)}</Text>
      </View>
      <View style={[styles.breakdownRow, styles.pendingRow]}>
        <Text style={styles.breakdownLabel}>⚠ Remaining:</Text>
        <Text style={styles.breakdownPending}>₹{remaining.toFixed(2)}</Text>
      </View>
    </View>
  );
};

// ==================== MAIN COMPONENT ====================

export default function CheckoutScreen() {
  // ========== Hooks ==========
  const { cartItems } = useCart();
  
  // ========== Component State ==========
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ========== Computed Values ==========
  const cartSummary = getCartSummary(cartItems);

  // ========== Form Validation ==========

  /**
   * Validate all form inputs before submission
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    // Validate customer name (required)
    if (!customerName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Name Required',
        text2: 'Please enter your name',
      });
      return false;
    }

    // Validate email format (if provided)
    if (customerEmail && !isValidEmail(customerEmail)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    // Validate phone format (if provided)
    if (customerPhone && !isValidPhone(customerPhone)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone',
        text2: 'Please enter a valid 10-digit phone number',
      });
      return false;
    }

    // Validate paid amount (if provided)
    if (paidAmount.trim()) {
      const paid = parseFloat(paidAmount);
      
      if (isNaN(paid) || paid < 0) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Amount',
          text2: 'Please enter a valid paid amount',
        });
        return false;
      }
      
      if (paid > cartSummary.total) {
        Toast.show({
          type: 'error',
          text1: 'Amount Exceeds Total',
          text2: `Paid amount cannot exceed total (₹${cartSummary.total.toFixed(2)})`,
        });
        return false;
      }
    }

    return true;
  };

  // ========== Event Handlers ==========

  /**
   * Handle order placement
   * Validates form, creates order, saves to Firebase, and navigates to confirmation
   */
  const handlePlaceOrder = async () => {
    console.log('Place Order button pressed');
    
    // Validate form inputs
    if (!validateForm()) {
      return;
    }

    // Check cart is not empty
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart is Empty',
        text2: 'Please add items to cart before placing order',
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Parse paid amount (default to 0 if not provided)
      const paidAmountValue = paidAmount.trim() ? parseFloat(paidAmount) : 0;

      // Create order data object
      const orderData = createOrderObject({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: cartItems,
        summary: cartSummary,
        paidAmount: paidAmountValue,
      });

      console.log('Order created:', orderData.orderId);

      // Save to Firebase
      const docId = await saveOrderToDatabase(orderData);
      console.log('Order saved to Firebase with ID:', docId);

      // Navigate to confirmation screen
      router.push({
        pathname: '/orderConfirmation',
        params: {
          orderData: JSON.stringify(orderData),
          orderId: docId,
        },
      });

    } catch (error) {
      console.error('Error creating order:', error);
      Toast.show({
        type: 'error',
        text1: 'Order Failed',
        text2: error.message || 'Failed to create order. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ========== Render ==========

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <CheckoutHeader />

          {/* Customer Information Form */}
          <View style={styles.form}>
            {/* Full Name - Required Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={customerName}
                onChangeText={setCustomerName}
                autoCapitalize="words"
                editable={!isProcessing}
              />
            </View>

            {/* Email - Optional Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isProcessing}
              />
            </View>

            {/* Phone - Optional Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile number"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isProcessing}
              />
            </View>
          </View>

          {/* Order Summary Section */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            {/* Subtotal Row */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cartSummary.itemCount})</Text>
              <Text style={styles.summaryValue}>₹{cartSummary.subtotal.toFixed(2)}</Text>
            </View>

            {/* GST Row */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (18%)</Text>
              <Text style={styles.summaryValue}>₹{cartSummary.gst.toFixed(2)}</Text>
            </View>

            {/* Delivery Row */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, cartSummary.delivery === 0 && styles.freeText]}>
                {cartSummary.delivery === 0 ? 'FREE' : `₹${cartSummary.delivery.toFixed(2)}`}
              </Text>
            </View>

            {/* Total Amount Row */}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{cartSummary.total.toFixed(2)}</Text>
            </View>

            {/* Savings Badge */}
            {cartSummary.savings > 0 && (
              <View style={styles.savingsBox}>
                <Text style={styles.savingsText}>
                  🎉 You&apos;re saving ₹{cartSummary.savings.toFixed(2)}!
                </Text>
              </View>
            )}
          </View>

          {/* Paid Amount Input with Real-time Breakdown - Separate Card */}
          <View style={styles.paymentCard}>
            <Text style={styles.paymentLabel}>💰 Paid Amount (Optional)</Text>
            <Text style={styles.paymentHint}>
              Enter the amount customer is paying now. Remaining amount will be calculated automatically.
            </Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={paidAmount}
                onChangeText={setPaidAmount}
                keyboardType="decimal-pad"
                editable={!isProcessing}
              />
            </View>
            
            {/* Dynamic Payment Breakdown */}
            <PaymentBreakdown 
              total={cartSummary.total} 
              paidAmount={paidAmount} 
            />
          </View>
        </ScrollView>

        {/* Fixed Footer with Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, isProcessing && styles.buttonDisabled]}
            onPress={handlePlaceOrder}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing 
                ? 'Processing...' 
                : `Place Order • ₹${cartSummary.total.toFixed(2)}`
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 240,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff6347',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  freeText: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  savingsBox: {
    backgroundColor: '#d4edda',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  savingsText: {
    color: '#155724',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  placeOrderButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Paid Amount Input Styles - Separate Card
  paymentCard: {
    backgroundColor: COLORS.ACCENT_LIGHT,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_DARK,
    marginBottom: 6,
  },
  paymentHint: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    paddingLeft: 12,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 14,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // Real-time Payment Breakdown
  paymentBreakdown: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paidRow: {
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    marginVertical: 4,
    borderBottomWidth: 0,
  },
  pendingRow: {
    backgroundColor: '#ffebee',
    borderRadius: 6,
    marginTop: 4,
    borderBottomWidth: 0,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  breakdownTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  breakdownPaid: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.SUCCESS || '#28a745',
  },
  breakdownPending: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.ERROR || '#ff4444',
  },
});
