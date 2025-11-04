/**
 * Order Detail Screen
 * View and update order payment information
 * 
 * Features:
 * - Display complete order details
 * - Update paid amount
 * - Calculate pending amount automatically
 * - Generate and view invoice with shop name
 */

import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { db } from '../lib/firebase';
import { COLORS } from '../src/utils/constants';

// Shop Configuration
const SHOP_CONFIG = {
  name: 'Ramesh Aqua',
  address: 'Shop Address Line 1, City, State - Pincode',
  phone: '+91 1234567890',
  email: 'rameshaqua@example.com',
  gstin: 'GSTIN1234567890', // Optional
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse order data
  const orderData = params.orderData ? JSON.parse(params.orderData) : null;
  const orderId = params.orderId;

  // State
  const [paidAmount, setPaidAmount] = useState(
    orderData?.payment?.paidAmount?.toString() || '0'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!orderData) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={48} color={COLORS.ERROR} />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalAmount = orderData.billing?.total || 0;
  const currentPaidAmount = parseFloat(paidAmount) || 0;
  const pendingAmount = totalAmount - currentPaidAmount;

  /**
   * Update payment information
   */
  const handleUpdatePayment = async () => {
    const newPaidAmount = parseFloat(paidAmount);

    // Validation
    if (isNaN(newPaidAmount) || newPaidAmount < 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid paid amount',
      });
      return;
    }

    if (newPaidAmount > totalAmount) {
      Alert.alert(
        'Amount Exceeds Total',
        `Paid amount (₹${newPaidAmount.toFixed(2)}) cannot exceed total amount (₹${totalAmount.toFixed(2)})`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsSaving(true);

      // Update in Firebase
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        payment: {
          paidAmount: newPaidAmount,
          pendingAmount: totalAmount - newPaidAmount,
          lastUpdated: new Date().toISOString(),
        },
        paymentStatus: newPaidAmount === 0 ? 'pending' : newPaidAmount >= totalAmount ? 'paid' : 'partial',
      });

      // Determine payment status message
      const statusMessage = newPaidAmount === 0 
        ? 'Order marked as unpaid' 
        : newPaidAmount >= totalAmount 
        ? 'Order marked as fully paid!' 
        : 'Partial payment recorded';

      Toast.show({
        type: 'success',
        text1: 'Payment Updated',
        text2: statusMessage,
        visibilityTime: 2000,
      });

      // Go back after success - Orders screen will auto-refresh
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Error updating payment:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update payment information',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Generate and share invoice PDF with shop name
   */
  const handleGenerateInvoice = async () => {
    try {
      setIsGeneratingPDF(true);

      // Enhanced order data with shop info and payment details
      const enhancedOrderData = {
        ...orderData,
        shop: SHOP_CONFIG,
        payment: {
          paidAmount: currentPaidAmount,
          pendingAmount: pendingAmount,
        },
      };

      // Generate HTML with enhanced template
      const html = generateEnhancedBillHTML(enhancedOrderData);

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html });

      console.log('PDF generated:', uri);

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Invoice - ${orderData.orderId}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'PDF Generated',
          text2: `Saved at: ${uri}`,
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'PDF Generation Failed',
        text2: error.message || 'Failed to generate invoice',
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /**
   * Generate enhanced HTML with shop name and payment breakdown
   */
  const generateEnhancedBillHTML = (orderData) => {
    const { orderId, orderDate, customer, items, billing, shop, payment } = orderData;
    const orderDateObj = orderDate?.toDate ? orderDate.toDate() : new Date(orderDate);

    const itemsHTML = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${orderId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border: 2px solid ${COLORS.PRIMARY};
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid ${COLORS.PRIMARY};
            padding-bottom: 20px;
          }
          .shop-name {
            font-size: 36px;
            font-weight: bold;
            color: ${COLORS.PRIMARY_DARK};
            margin: 0 0 10px 0;
          }
          .shop-details {
            font-size: 14px;
            color: #666;
            line-height: 1.6;
          }
          .invoice-title {
            font-size: 24px;
            color: ${COLORS.PRIMARY};
            margin: 20px 0 10px 0;
            font-weight: bold;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .order-info div {
            flex: 1;
          }
          .order-info h3 {
            margin: 0 0 10px 0;
            color: ${COLORS.PRIMARY};
            font-size: 14px;
            text-transform: uppercase;
          }
          .order-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: ${COLORS.PRIMARY};
            color: white;
            padding: 12px 10px;
            text-align: left;
            font-size: 14px;
          }
          th:nth-child(2), th:nth-child(3), th:nth-child(4) {
            text-align: center;
          }
          th:last-child {
            text-align: right;
          }
          td {
            font-size: 14px;
          }
          .summary {
            float: right;
            width: 350px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .total-row {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
            padding-top: 15px;
            border-top: 2px solid #333;
          }
          .payment-row {
            background: #e8f5e9;
            padding: 10px;
            margin-top: 5px;
            border-radius: 5px;
          }
          .payment-row.pending {
            background: #ffebee;
          }
          .summary-label {
            color: #666;
          }
          .summary-value {
            font-weight: bold;
          }
          .paid-amount {
            color: ${COLORS.SUCCESS};
          }
          .pending-amount {
            color: ${COLORS.ERROR};
          }
          .footer {
            clear: both;
            margin-top: 50px;
            text-align: center;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #999;
            font-size: 12px;
          }
          .savings {
            background: #d4edda;
            color: #155724;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            margin-top: 20px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header with Shop Name -->
          <div class="header">
            <h1 class="shop-name">${shop.name}</h1>
            <div class="shop-details">
              <p>${shop.address}</p>
              <p>Phone: ${shop.phone} | Email: ${shop.email}</p>
              ${shop.gstin ? `<p>GSTIN: ${shop.gstin}</p>` : ''}
            </div>
            <h2 class="invoice-title">TAX INVOICE</h2>
          </div>

          <!-- Order Info -->
          <div class="order-info">
            <div>
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Date:</strong> ${orderDateObj.toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Status:</strong> ${orderData.status || 'Pending'}</p>
            </div>
            <div>
              <h3>Bill To</h3>
              <p><strong>${customer.name}</strong></p>
              ${customer.email ? `<p>${customer.email}</p>` : ''}
              ${customer.phone ? `<p>Phone: ${customer.phone}</p>` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <!-- Summary with Payment Breakdown -->
          <div class="summary">
            <div class="summary-row">
              <span class="summary-label">Subtotal (${billing.itemCount} items)</span>
              <span class="summary-value">₹${billing.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">GST (${billing.gstRate}%)</span>
              <span class="summary-value">₹${billing.gst.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Delivery Charges</span>
              <span class="summary-value">${billing.delivery === 0 ? 'FREE' : '₹' + billing.delivery.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">Total Amount</span>
              <span class="summary-value">₹${billing.total.toFixed(2)}</span>
            </div>
            
            <!-- Payment Breakdown -->
            <div class="summary-row payment-row">
              <span class="summary-label">Paid Amount</span>
              <span class="summary-value paid-amount">₹${payment.paidAmount.toFixed(2)}</span>
            </div>
            ${payment.pendingAmount > 0 ? `
              <div class="summary-row payment-row pending">
                <span class="summary-label">Pending Amount</span>
                <span class="summary-value pending-amount">₹${payment.pendingAmount.toFixed(2)}</span>
              </div>
            ` : ''}
          </div>

          ${billing.savings > 0 ? `
            <div class="savings">
              🎉 You saved ₹${billing.savings.toFixed(2)} on this order!
            </div>
          ` : ''}

          <!-- Footer -->
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>For any queries, please contact: ${shop.phone}</p>
            <p>&copy; ${new Date().getFullYear()} ${shop.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const orderDate = orderData.createdAt?.toDate ? orderData.createdAt.toDate() : new Date(orderData.orderDate);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Order Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID:</Text>
            <Text style={styles.infoValue}>{orderData.orderId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {orderDate.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, styles.statusText]}>
              {orderData.status || 'Pending'}
            </Text>
          </View>
        </View>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{orderData.customer?.name}</Text>
          </View>
          {orderData.customer?.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{orderData.customer.email}</Text>
            </View>
          )}
          {orderData.customer?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{orderData.customer.phone}</Text>
            </View>
          )}
        </View>

        {/* Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items ({orderData.items?.length || 0})</Text>
          {orderData.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.itemTotal}>₹{item.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Billing Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Billing Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>₹{orderData.billing?.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%):</Text>
            <Text style={styles.summaryValue}>₹{orderData.billing?.gst.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery:</Text>
            <Text style={styles.summaryValue}>
              {orderData.billing?.delivery === 0 ? 'FREE' : `₹${orderData.billing?.delivery.toFixed(2)}`}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Update Card */}
        <View style={[styles.card, styles.paymentCard]}>
          <Text style={styles.cardTitle}>Payment Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Paid Amount (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter paid amount"
              value={paidAmount}
              onChangeText={setPaidAmount}
              keyboardType="numeric"
              editable={!isSaving}
            />
          </View>

          <View style={styles.paymentSummary}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Amount:</Text>
              <Text style={styles.paymentAmount}>₹{totalAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Paid Amount:</Text>
              <Text style={[styles.paymentAmount, styles.paidText]}>
                ₹{currentPaidAmount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.paymentRow, styles.pendingRow]}>
              <Text style={[styles.paymentLabel, styles.pendingLabel]}>Pending Amount:</Text>
              <Text style={[styles.paymentAmount, styles.pendingText]}>
                ₹{pendingAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateButton, isSaving && styles.buttonDisabled]}
            onPress={handleUpdatePayment}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.updateButtonText}>Update Payment</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Generate Invoice Button */}
        <TouchableOpacity
          style={[styles.invoiceButton, isGeneratingPDF && styles.buttonDisabled]}
          onPress={handleGenerateInvoice}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <FontAwesome5 name="file-pdf" size={18} color="white" />
              <Text style={styles.invoiceButtonText}>Generate & Share Invoice</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  statusText: {
    color: COLORS.PRIMARY,
    textTransform: 'capitalize',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  totalRow: {
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
    color: COLORS.SUCCESS,
  },
  paymentCard: {
    backgroundColor: COLORS.ACCENT_LIGHT,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  paymentSummary: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  paidText: {
    color: COLORS.SUCCESS,
  },
  pendingRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  pendingLabel: {
    fontWeight: 'bold',
  },
  pendingText: {
    color: COLORS.ERROR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  updateButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  invoiceButton: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  invoiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
