/**
 * Order Confirmation Screen
 * Shows order success, generates PDF, allows sharing, and saves to database
 */

import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useCart } from '../contexts/CartContext';
import { saveOrderToDatabase } from './services/billingService';
import { generateBillHTML } from './services/pdfService';

export default function OrderConfirmationScreen() {
  const { clearCart } = useCart();
  const params = useLocalSearchParams();
  
  const [orderData, setOrderData] = useState(null);
  const [pdfUri, setPdfUri] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [orderSaved, setOrderSaved] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Parse order data from params - only run once when component mounts
    if (params.orderData && !orderData && !initialized) {
      try {
        const parsedOrder = JSON.parse(params.orderData);
        setOrderData(parsedOrder);
        setInitialized(true);
        console.log('Order loaded:', parsedOrder.orderId);
        
        // Check if order is already saved (orderId param indicates it's already saved)
        if (params.orderId && !orderSaved) {
          console.log('Order already saved with Firebase ID:', params.orderId);
          setOrderSaved(true);
          // Clear cart since order is already saved
          setTimeout(() => clearCart(), 100);
          Toast.show({
            type: 'success',
            text1: 'Order Placed!',
            text2: 'Your order has been saved successfully',
          });
        } else if (!params.orderId && !orderSaved) {
          // Auto-save order to database only if not already saved
          saveOrder(parsedOrder);
        }
      } catch (error) {
        console.error('Error parsing order data:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load order data',
        });
      }
    }
  }, [params.orderData, params.orderId, orderData, orderSaved, saveOrder, clearCart, initialized]);

  /**
   * Save order to Firebase database
   */
  const saveOrder = useCallback(async (order) => {
    if (orderSaved || isSavingOrder) return;

    try {
      setIsSavingOrder(true);
      console.log('Saving order to database...');
      
      const docId = await saveOrderToDatabase(order);
      
      setOrderSaved(true);
      console.log('Order saved successfully. Doc ID:', docId);
      
      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: 'Your order has been saved successfully',
      });

      // Clear cart after successful order save
      setTimeout(() => clearCart(), 100);
      
    } catch (error) {
      console.error('Error saving order:', error);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error.message || 'Failed to save order',
      });
    } finally {
      setIsSavingOrder(false);
    }
  }, [orderSaved, isSavingOrder, clearCart]);

  /**
   * Generate PDF invoice
   */
  const generatePDF = async () => {
    if (!orderData) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Order data not available',
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      console.log('Generating PDF...');

      // Generate HTML content
      const htmlContent = generateBillHTML(orderData);

      // Create PDF using expo-print
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      console.log('PDF generated at:', uri);
      setPdfUri(uri);

      Toast.show({
        type: 'success',
        text1: 'PDF Generated!',
        text2: 'Invoice is ready to share',
      });

      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'PDF Generation Failed',
        text2: error.message || 'Failed to generate PDF',
      });
      return null;
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  /**
   * Share PDF via generic share dialog
   */
  const sharePDF = async () => {
    try {
      let uri = pdfUri;

      // Generate PDF if not already generated
      if (!uri) {
        uri = await generatePDF();
        if (!uri) return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Sharing Not Available',
          'Sharing is not available on this device'
        );
        return;
      }

      // Share the PDF
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice ${orderData.orderId}`,
        UTI: 'com.adobe.pdf',
      });

      console.log('PDF shared successfully');
    } catch (error) {
      console.error('Error sharing PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Sharing Failed',
        text2: error.message || 'Failed to share PDF',
      });
    }
  };

  /**
   * Share PDF via WhatsApp
   */
  const shareViaWhatsApp = async () => {
    try {
      let uri = pdfUri;

      // Generate PDF if not already generated
      if (!uri) {
        uri = await generatePDF();
        if (!uri) return;
      }

      if (Platform.OS === 'web') {
        Toast.show({
          type: 'info',
          text1: 'WhatsApp Share',
          text2: 'WhatsApp sharing is not available on web',
        });
        return;
      }

      // Try to open WhatsApp with the PDF
      const whatsappURL = `whatsapp://send?text=Here is my order invoice: ${orderData.orderId}`;
      
      const canOpen = await Linking.canOpenURL(whatsappURL);
      
      if (canOpen) {
        // First share via generic share (which includes WhatsApp)
        await sharePDF();
      } else {
        Alert.alert(
          'WhatsApp Not Found',
          'WhatsApp is not installed on this device. Would you like to share via other apps?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Share', onPress: sharePDF },
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      Toast.show({
        type: 'error',
        text1: 'WhatsApp Share Failed',
        text2: error.message || 'Failed to share via WhatsApp',
      });
    }
  };

  /**
   * Handle back to home
   */
  const handleBackToHome = () => {
    router.replace('/(tabs)/home');
  };

  if (!orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6347" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Thank you for your order, {orderData.customer.name}
        </Text>

        {/* Order ID */}
        <View style={styles.orderIdBox}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderIdValue}>{orderData.orderId}</Text>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items</Text>
            <Text style={styles.summaryValue}>{orderData.billing.itemCount}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{orderData.billing.subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST ({orderData.billing.gstRate}%)</Text>
            <Text style={styles.summaryValue}>₹{orderData.billing.gst.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, orderData.billing.delivery === 0 && styles.freeText]}>
              {orderData.billing.delivery === 0 ? 'FREE' : `₹${orderData.billing.delivery.toFixed(2)}`}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{orderData.billing.total.toFixed(2)}</Text>
          </View>

          {orderData.billing.savings > 0 && (
            <View style={styles.savingsBox}>
              <Text style={styles.savingsText}>
                🎉 You saved ₹{orderData.billing.savings.toFixed(2)}!
              </Text>
            </View>
          )}
        </View>

        {/* Database Status */}
        {isSavingOrder && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="small" color="#ff6347" />
            <Text style={styles.statusText}>Saving order to database...</Text>
          </View>
        )}
        
        {orderSaved && (
          <View style={[styles.statusBox, styles.successStatus]}>
            <Text style={styles.successStatusText}>✓ Order saved to database</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Generate/Download PDF Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={generatePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {pdfUri ? '✓ PDF Generated' : 'Generate PDF Invoice'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          {pdfUri && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={sharePDF}
            >
              <Text style={styles.secondaryButtonText}>📤 Share Invoice</Text>
            </TouchableOpacity>
          )}

          {/* WhatsApp Button */}
          {pdfUri && (
            <TouchableOpacity
              style={[styles.actionButton, styles.whatsappButton]}
              onPress={shareViaWhatsApp}
            >
              <Text style={styles.whatsappButtonText}>💬 Share via WhatsApp</Text>
            </TouchableOpacity>
          )}

          {/* Back to Home Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.outlineButton]}
            onPress={handleBackToHome}
          >
            <Text style={styles.outlineButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  orderIdBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ff6347',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6347',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
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
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  successStatus: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  successStatusText: {
    fontSize: 14,
    color: '#155724',
    fontWeight: '600',
  },
  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#ff6347',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ff6347',
  },
  outlineButtonText: {
    color: '#ff6347',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
