/**
 * Add Stock Screen
 * Allows warehouse managers to add stock for products
 * Follows the admin panel structure: Company → Category → Product → Stock Entry
 */

import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../lib/firebase';

const AddStockScreen = () => {
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Selection state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Stock entry state
  const [stockQuantity, setStockQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [notes, setNotes] = useState('');
  
  // Current inventory state
  const [currentInventory, setCurrentInventory] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  
  // Modal state
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Load initial companies
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load categories when company selected
  useEffect(() => {
    if (selectedCompany) {
      loadCategories(selectedCompany.id);
      setSelectedCategory(null);
      setSelectedProduct(null);
    }
  }, [selectedCompany]);

  // Load products when category selected
  useEffect(() => {
    if (selectedCategory && selectedCompany) {
      loadProducts(selectedCompany.id, selectedCategory.id);
      setSelectedProduct(null);
    }
  }, [selectedCategory, selectedCompany]);

  // Load current inventory when product selected
  useEffect(() => {
    if (selectedProduct && selectedCompany) {
      loadCurrentInventory(selectedProduct.id, selectedCompany.id);
    }
  }, [selectedProduct, selectedCompany]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
      Alert.alert('Error', 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (companyId) => {
    try {
      setLoading(true);
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (companyId, categoryId) => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('companyId', '==', companyId),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentInventory = async (productId, companyId) => {
    try {
      setLoadingInventory(true);
      
      // Query inventory collection for this specific product and company
      const inventoryRef = collection(db, 'inventory');
      const q = query(
        inventoryRef,
        where('productId', '==', productId),
        where('companyId', '==', companyId)
      );
      const inventorySnapshot = await getDocs(q);
      
      if (!inventorySnapshot.empty) {
        const inventoryData = inventorySnapshot.docs[0].data();
        setCurrentInventory(inventoryData);
        
        // Set current threshold if exists
        if (inventoryData.threshold) {
          setLowStockThreshold(inventoryData.threshold.toString());
        }
      } else {
        // No existing inventory
        setCurrentInventory(null);
        setLowStockThreshold('10'); // Reset to default
      }
    } catch (error) {
      console.error('Error loading current inventory:', error);
      setCurrentInventory(null);
    } finally {
      setLoadingInventory(false);
    }
  };

  const handleAddStock = async () => {
    if (!selectedProduct || !stockQuantity.trim()) {
      Alert.alert('Error', 'Please select a product and enter stock quantity');
      return;
    }

    const quantity = parseInt(stockQuantity);
    const threshold = parseInt(lowStockThreshold);

    if (isNaN(quantity) || quantity < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity');
      return;
    }

    if (isNaN(threshold) || threshold < 0) {
      Alert.alert('Error', 'Please enter a valid threshold');
      return;
    }

    try {
      setLoading(true);

      // Calculate new quantity (add to existing or create new)
      const currentQuantity = currentInventory ? currentInventory.quantity || 0 : 0;
      const newQuantity = currentQuantity + quantity;

      // Create or update inventory record
      const inventoryId = `${selectedProduct.id}_${selectedCompany.id}`;
      const inventoryRef = doc(db, 'inventory', inventoryId);
      
      const inventoryData = {
        productId: selectedProduct.id,
        companyId: selectedCompany.id,
        quantity: newQuantity,
        threshold: threshold,
        isOutOfStock: newQuantity === 0,
        isLowStock: newQuantity <= threshold,
        lastUpdated: new Date(),
        createdAt: currentInventory ? currentInventory.createdAt : new Date(),
        updatedBy: 'warehouse_manager',
        notes: notes.trim() || 'Added via warehouse management',
        productTitle: selectedProduct.title || 'Unknown Product',
        categoryName: selectedCategory.title || 'Unknown Category',
        companyName: selectedCompany.name || 'Unknown Company'
      };

      await setDoc(inventoryRef, inventoryData);

      // Create inventory transaction record
      const transactionRef = doc(collection(db, 'inventoryTransactions'));
      const transactionData = {
        productId: selectedProduct.id,
        companyId: selectedCompany.id,
        type: 'stock_in',
        quantity: quantity,
        reason: 'Manual stock addition',
        timestamp: new Date(),
        performedBy: 'warehouse_manager',
        notes: notes.trim() || 'Stock added via warehouse management'
      };

      await setDoc(transactionRef, transactionData);

      Alert.alert(
        'Success',
        `Successfully added ${quantity} units of ${selectedProduct.title} to inventory!\nNew total: ${newQuantity} units`,
        [
          {
            text: 'Add More Stock',
            onPress: () => {
              // Reset form for another entry
              setStockQuantity('');
              setNotes('');
              setSelectedProduct(null);
            }
          },
          {
            text: 'Back to Warehouse',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error) {
      console.error('Error adding stock:', error);
      Alert.alert('Error', 'Failed to add stock. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCompany(null);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setStockQuantity('');
    setLowStockThreshold('10');
    setNotes('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome5 name="arrow-left" size={20} color="#ffffff" />
          </TouchableOpacity> */}
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Add Stock</Text>
            <Text style={styles.headerSubtitle}>Add inventory to warehouse</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Company */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <FontAwesome5 name="building" size={16} color="#667eea" />
            <Text style={styles.stepTitle}>Step 1: Select Company</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.selectionButton, selectedCompany && styles.selectedButton]}
            onPress={() => setShowCompanyModal(true)}
          >
            <Text style={[styles.selectionText, selectedCompany && styles.selectedText]}>
              {selectedCompany ? selectedCompany.name : 'Choose Company'}
            </Text>
            <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Step 2: Select Category */}
        {selectedCompany && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FontAwesome5 name="list" size={16} color="#667eea" />
              <Text style={styles.stepTitle}>Step 2: Select Category</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.selectionButton, selectedCategory && styles.selectedButton]}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.selectionText, selectedCategory && styles.selectedText]}>
                {selectedCategory ? selectedCategory.title : 'Choose Category'}
              </Text>
              <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Select Product */}
        {selectedCategory && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FontAwesome5 name="box" size={16} color="#667eea" />
              <Text style={styles.stepTitle}>Step 3: Select Product</Text>
            </View>
            
            <TouchableOpacity
              style={[styles.selectionButton, selectedProduct && styles.selectedButton]}
              onPress={() => setShowProductModal(true)}
            >
              <Text style={[styles.selectionText, selectedProduct && styles.selectedText]}>
                {selectedProduct ? selectedProduct.title : 'Choose Product'}
              </Text>
              <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 4: Enter Stock Details */}
        {selectedProduct && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <FontAwesome5 name="plus-circle" size={16} color="#667eea" />
              <Text style={styles.stepTitle}>Step 4: Enter Stock Details</Text>
            </View>

            {/* Product Info Card */}
            <View style={styles.productInfoCard}>
              <Text style={styles.productInfoTitle}>Selected Product</Text>
              <Text style={styles.productInfoText}>
                <Text style={styles.productInfoLabel}>Product: </Text>
                {selectedProduct.title}
              </Text>
              <Text style={styles.productInfoText}>
                <Text style={styles.productInfoLabel}>Company: </Text>
                {selectedCompany.name}
              </Text>
              <Text style={styles.productInfoText}>
                <Text style={styles.productInfoLabel}>Category: </Text>
                {selectedCategory.title}
              </Text>
              
              {/* Current Inventory Display */}
              <View style={styles.currentStockSection}>
                <Text style={styles.currentStockTitle}>Current Inventory</Text>
                {loadingInventory ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#667eea" />
                    <Text style={styles.loadingText}>Loading current stock...</Text>
                  </View>
                ) : currentInventory ? (
                  <View style={styles.stockInfoContainer}>
                    <View style={styles.stockInfoRow}>
                      <Text style={styles.stockInfoLabel}>Available Stock:</Text>
                      <Text style={[styles.stockInfoValue, { 
                        color: currentInventory.quantity > currentInventory.threshold ? '#10b981' : 
                               currentInventory.quantity > 0 ? '#f59e0b' : '#ef4444' 
                      }]}>
                        {currentInventory.quantity} units
                      </Text>
                    </View>
                    <View style={styles.stockInfoRow}>
                      <Text style={styles.stockInfoLabel}>Status:</Text>
                      <Text style={[styles.stockInfoValue, { 
                        color: currentInventory.isOutOfStock ? '#ef4444' : 
                               currentInventory.isLowStock ? '#f59e0b' : '#10b981' 
                      }]}>
                        {currentInventory.isOutOfStock ? 'Out of Stock' : 
                         currentInventory.isLowStock ? 'Low Stock' : 'In Stock'}
                      </Text>
                    </View>
                    <View style={styles.stockInfoRow}>
                      <Text style={styles.stockInfoLabel}>Low Stock Alert:</Text>
                      <Text style={styles.stockInfoValue}>{currentInventory.threshold} units</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.noInventoryContainer}>
                    <FontAwesome5 name="box-open" size={24} color="#9ca3af" />
                    <Text style={styles.noInventoryText}>No existing inventory</Text>
                    <Text style={styles.noInventorySubtext}>This will be the first stock entry</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Stock Quantity Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Stock Quantity *</Text>
              <TextInput
                style={styles.textInput}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                placeholder="Enter quantity to add"
                keyboardType="numeric"
              />
            </View>

            {/* Low Stock Threshold Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Low Stock Threshold</Text>
              <TextInput
                style={styles.textInput}
                value={lowStockThreshold}
                onChangeText={setLowStockThreshold}
                placeholder="Minimum stock alert level"
                keyboardType="numeric"
              />
            </View>

            {/* Notes Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this stock entry..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetForm}
              >
                <FontAwesome5 name="undo" size={16} color="#ef4444" />
                <Text style={styles.resetButtonText}>Reset Form</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addButton, loading && styles.disabledButton]}
                onPress={handleAddStock}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <FontAwesome5 name="plus" size={16} color="#ffffff" />
                    <Text style={styles.addButtonText}>Add Stock</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Company Selection Modal */}
      <Modal
        visible={showCompanyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Company</Text>
              <TouchableOpacity onPress={() => setShowCompanyModal(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {companies.map((company) => (
                <TouchableOpacity
                  key={company.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCompany(company);
                    setShowCompanyModal(false);
                  }}
                >
                  <FontAwesome5 name="building" size={16} color="#667eea" />
                  <Text style={styles.modalItemText}>{company.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(category);
                    setShowCategoryModal(false);
                  }}
                >
                  <FontAwesome5 name="list" size={16} color="#667eea" />
                  <Text style={styles.modalItemText}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Product Selection Modal */}
      <Modal
        visible={showProductModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedProduct(product);
                    setShowProductModal(false);
                  }}
                >
                  <FontAwesome5 name="box" size={16} color="#667eea" />
                  <Text style={styles.modalItemText}>{product.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e5e7eb',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 12,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
  },
  selectedButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#667eea',
  },
  selectionText: {
    fontSize: 16,
    color: '#6b7280',
  },
  selectedText: {
    color: '#667eea',
    fontWeight: '500',
  },
  productInfoCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  productInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  productInfoText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  productInfoLabel: {
    fontWeight: '500',
    color: '#1f2937',
  },
  currentStockSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  currentStockTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  stockInfoContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  stockInfoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  stockInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  noInventoryContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  noInventoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  noInventorySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  resetButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalList: {
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export default AddStockScreen;