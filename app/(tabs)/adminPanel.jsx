import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../lib/firebase';
import AlertCard from '../components/AlertCard';

export default function AdminPanel() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [btnloading, setBtnLoading] = useState(false);
  const [company, setCompany] = useState({
    name: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
  });

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({
    title: '',
    description: '',
    imageUrl: '',
    url: '',
    productsCount: '',
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [product, setProduct] = useState({
    title: '',
    description: '',
    imageUrl: '',
    url: '',
    price: '',
    originalPrice: '',
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal states for bottom sheets
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(false);

  // Centralized custom alert state (for AlertCard)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    type: 'success',
    title: '',
    message: '',
    buttonText: 'Continue',
    onPress: null,
  });

  const showAlert = (type, title, message, buttonText = 'Continue', onPress) => {
    setAlertData({ type, title, message, buttonText, onPress: onPress || null });
    setAlertVisible(true);
  };

  const handleAlertPress = () => {
    try {
      if (typeof alertData.onPress === 'function') {
        alertData.onPress();
      }
    } finally {
      setAlertVisible(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadCategories(selectedCompanyId);
    } else {
      setCategories([]);
      setSelectedCategoryId(null);
      setSelectedCategoryName('');
    }
  }, [selectedCompanyId]);

  // Handle edit product from products screen
  useEffect(() => {
    if (params.editProduct) {
      try {
        const productData = JSON.parse(params.editProduct);
        handleEditProduct(productData);
        
        // Set company and category if provided
        if (params.companyId) {
          setSelectedCompanyId(params.companyId);
        }
        if (params.categoryId) {
          setSelectedCategoryId(params.categoryId);
        }
      } catch (error) {
        console.error('Error parsing edit product data:', error);
      }
    }
  }, [params.editProduct, params.companyId, params.categoryId]);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      
      const companiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Companies loaded:', companiesData.map(c => ({ 
        name: c.name, 
        id: c.id, 
        companyId: c.companyId 
      })));
      setCompanies(companiesData);
    } catch (err) {
      console.error('Error loading companies:', err);
      showAlert('error', 'Error', 'Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadCategories = async (companyIdentifier) => {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, where('companyId', '==', companyIdentifier));
      const snapshot = await getDocs(q);
      
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Filtered categories count:', categoriesData.length);
      console.log('Filtered categories:', categoriesData.map(c => ({ title: c.title, companyId: c.companyId })));
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading categories:', err);
      showAlert('error', 'Error', 'Failed to load categories');
    }
  };

  const navigateToProducts = () => {
    if (!selectedCompanyId || !selectedCategoryId) {
      showAlert('error', 'Selection Required', 'Please select both company and category first');
      return;
    }

    // Get company data
    const selectedCompanyData = companies.find(c => {
      const compId = c.companyId || c.id;
      return compId === selectedCompanyId;
    });

    // Get category data
    const selectedCategoryData = categories.find(cat => cat.id === selectedCategoryId);

    if (!selectedCompanyData || !selectedCategoryData) {
      showAlert('error', 'Error', 'Could not find selected company or category data');
      return;
    }

    console.log('✅ Navigating to Admin Products with:', {
      companyId: selectedCompanyId,
      companyName: selectedCompanyData.name,
      categoryId: selectedCategoryId,
      categoryName: selectedCategoryData.title || selectedCategoryData.name,
    });

    // Navigate to admin products screen (separate from regular products)
    router.push(
      `../../adminProducts?companyId=${selectedCompanyId}&companyName=${encodeURIComponent(selectedCompanyData.name)}&categoryId=${selectedCategoryId}&categoryName=${encodeURIComponent(selectedCategoryData.title || selectedCategoryData.name || 'Category')}`
    );
  };

  const handleAddCompany = async () => {
    if (!company.name.trim()) {
      showAlert('error', 'Validation Error', 'Company name is required');
      return;
    }

    try {
      setBtnLoading(true);
      
      // Only send fields that exist in your Appwrite collection
      const companyData = { 
        name: company.name
      };
      
      // Add optional fields only if they have values
      if (company.description && company.description.trim()) {
        companyData.description = company.description;
      }
      if (company.logoUrl && company.logoUrl.trim()) {
        companyData.logoUrl = company.logoUrl;
      }
      if (company.websiteUrl && company.websiteUrl.trim()) {
        companyData.websiteUrl = company.websiteUrl;
      }

      console.log('Creating company with data:', companyData);

      const companiesRef = collection(db, 'companies');
      await addDoc(companiesRef, companyData);

      showAlert('success', 'Success', 'Company added successfully!', 'Continue', () => {
        setCompany({ name: '', description: '', logoUrl: '', websiteUrl: '' });
        loadCompanies();
      });
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      showAlert('error', 'Error', err.message || 'Failed to add company');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCompanyId) {
      showAlert('error', 'Validation Error', 'Please select a company first');
      return;
    }

    if (!category.title.trim()) {
      showAlert('error', 'Validation Error', 'Category title is required');
      return;
    }

    try {
      // Only send fields that exist in your Appwrite collection
      // Use companyId (camelCase) as shown in Appwrite screenshot
      const categoryData = { 
        title: category.title,
        companyId: selectedCompanyId 
      };
      
      // Add optional fields only if they have values
      if (category.description && category.description.trim()) {
        categoryData.description = category.description;
      }
      if (category.imageUrl && category.imageUrl.trim()) {
        categoryData.imageUrl = category.imageUrl;
      }
      if (category.url && category.url.trim()) {
        categoryData.url = category.url;
      }
      if (category.productsCount && category.productsCount.trim()) {
        categoryData.productsCount = parseInt(category.productsCount) || 0;
      }

      console.log('Creating category with data:', categoryData);
      setBtnLoading(true);

      const categoriesRef = collection(db, 'categories');
      await addDoc(categoriesRef, categoryData);

      showAlert('success', 'Success', 'Category added successfully!', 'Continue', () => {
        setCategory({ title: '', description: '', imageUrl: '', url: '', productsCount: '' });
        loadCategories(selectedCompanyId);
      });
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      showAlert('error', 'Error', err.message || 'Failed to add category');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedCompanyId) {
      showAlert('error', 'Validation Error', 'Please select a company first');
      return;
    }

    if (!selectedCategoryId) {
      showAlert('error', 'Validation Error', 'Please select a category first');
      return;
    }

    if (!product.title.trim()) {
      showAlert('error', 'Validation Error', 'Product title is required');
      return;
    }

    if (!product.price.trim()) {
      showAlert('error', 'Validation Error', 'Product price is required');
      return;
    }

    try {
      // Only send fields that exist in your Appwrite collection
      // Use camelCase for consistency with Appwrite naming
      const productData = {
        title: product.title,
        categoryId: selectedCategoryId,
        companyId: selectedCompanyId,
        price: parseInt(product.price) || 0,
      };
      
      // Add optional fields only if they have values
      if (product.description && product.description.trim()) {
        productData.description = product.description;
      }
      if (product.imageUrl && product.imageUrl.trim()) {
        productData.imageUrl = product.imageUrl;
      }
      if (product.url && product.url.trim()) {
        productData.url = product.url;
      }
      if (product.originalPrice && product.originalPrice.trim()) {
        productData.originalPrice = parseInt(product.originalPrice) || 0;
      }

      console.log('Creating product with data:', productData);

      setBtnLoading(true);
      const productsRef = collection(db, 'products');
      await addDoc(productsRef, productData);

      showAlert('success', 'Success', 'Product added successfully!', 'Continue', () => {
        setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
      });
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      showAlert('error', 'Error', err.message || 'Failed to add product');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) {
      showAlert('error', 'Error', 'No product selected for editing');
      return;
    }

    if (!product.title.trim()) {
      showAlert('error', 'Validation Error', 'Product title is required');
      return;
    }

    if (!product.price.trim()) {
      showAlert('error', 'Validation Error', 'Product price is required');
      return;
    }

    try {
      const productData = {
        title: product.title,
        price: parseInt(product.price) || 0,
      };
      
      if (product.description && product.description.trim()) {
        productData.description = product.description;
      }
      if (product.imageUrl && product.imageUrl.trim()) {
        productData.imageUrl = product.imageUrl;
      }
      if (product.url && product.url.trim()) {
        productData.url = product.url;
      }
      if (product.originalPrice && product.originalPrice.trim()) {
        productData.originalPrice = parseInt(product.originalPrice) || 0;
      }

      console.log('Updating product:', editingProductId, productData);

      setBtnLoading(true);
      const productRef = doc(db, 'products', editingProductId);
      await updateDoc(productRef, productData);

      showAlert('success', 'Success', 'Product updated successfully!', 'Continue', () => {
        // Reset form and edit mode
        setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
        setIsEditMode(false);
        setEditingProductId(null);
      });
    } catch (err) {
      console.error('Error updating product:', err);
      showAlert('error', 'Error', err.message || 'Failed to update product');
    } finally {
      setBtnLoading(false);
    }
  };

  const handleEditProduct = (productData) => {
    setIsEditMode(true);
    setEditingProductId(productData.id);
    setProduct({
      title: productData.title || '',
      description: productData.description || '',
      imageUrl: productData.imageUrl || '',
      url: productData.url || '',
      price: productData.price?.toString() || '',
      originalPrice: productData.originalPrice?.toString() || '',
    });
    // Scroll to product form
    showAlert('success', 'Edit Mode', 'Update product details below');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
    showAlert('success', 'Cancelled', 'Edit mode cancelled');
  };

  // Delete functions
  const handleDeleteCompany = async (companyId, companyName) => {
    showAlert('error', 'Delete Company', `Are you sure you want to delete "${companyName}"? This will also delete all associated categories and products.`, 'Delete', async () => {
      try {
        // Delete company
        await deleteDoc(doc(db, 'companies', companyId));

        // Delete all categories for this company
        const companyIdentifier = companyId;
        const categoriesSnapshot = await getDocs(
          query(collection(db, 'categories'), where('companyId', '==', companyIdentifier))
        );
        const deleteCategories = categoriesSnapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'categories', docSnap.id))
        );

        // Delete all products for this company
        const productsSnapshot = await getDocs(
          query(collection(db, 'products'), where('companyId', '==', companyIdentifier))
        );
        const deleteProducts = productsSnapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'products', docSnap.id))
        );

        await Promise.all([...deleteCategories, ...deleteProducts]);

        showAlert('success', 'Success', 'Company and all related data deleted!', 'Continue', () => {
          loadCompanies();
          if (selectedCompanyId === companyIdentifier) {
            setSelectedCompanyId(null);
            setSelectedCompanyName('');
            setCategories([]);
          }
        });
      } catch (err) {
        console.error('Error deleting company:', err);
        showAlert('error', 'Error', err.message || 'Failed to delete company');
      }
    });
  };

  const handleDeleteCategory = async (categoryId, categoryTitle) => {
    showAlert('error', 'Delete Category', `Are you sure you want to delete "${categoryTitle}"? This will also delete all products in this category.`, 'Delete', async () => {
      try {
        // Delete category
        await deleteDoc(doc(db, 'categories', categoryId));

        // Delete all products in this category
        const productsSnapshot = await getDocs(
          query(collection(db, 'products'), where('categoryId', '==', categoryId))
        );
        const deleteProducts = productsSnapshot.docs.map(docSnap =>
          deleteDoc(doc(db, 'products', docSnap.id))
        );
        await Promise.all(deleteProducts);

        // Use custom AlertCard for success feedback
        showAlert('success', 'Success', 'Category and all products deleted!', 'Continue', () => {
          if (selectedCompanyId) {
            loadCategories(selectedCompanyId);
          }
          if (selectedCategoryId === categoryId) {
            setSelectedCategoryId(null);
            setSelectedCategoryName('');
          }
        });
      } catch (err) {
        // Use custom AlertCard for error feedback
        showAlert('error', 'Error', err.message || 'Failed to delete category');
      }
    });
  };

  // Note: Product deletions are handled within the Admin Products screen

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <Text style={styles.headerSubtitle}>Manage companies, categories & products</Text>
          </View>
        </View>
      </LinearGradient>

      {/* View Products Button - Top Right */}
      {selectedCompanyId && selectedCategoryId && (
        <TouchableOpacity 
          style={styles.viewProductsButton}
          onPress={navigateToProducts}
        >
          <AntDesign name="eye" size={20} color="white" />
          <Text style={styles.viewProductsButtonText}>View Products</Text>
        </TouchableOpacity>
      )}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Add Company */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <FontAwesome5 name="building" size={16} color="#667eea" />
            <Text style={styles.stepTitle}>Step 1: Add Company</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Company Name *</Text>
            <TextInput
              style={styles.textInput}
              value={company.name}
              onChangeText={(t) => setCompany({ ...company, name: t })}
              placeholder="Enter company name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={company.description}
              onChangeText={(t) => setCompany({ ...company, description: t })}
              placeholder="Company description"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Logo URL</Text>
            <TextInput
              style={styles.textInput}
              value={company.logoUrl}
              onChangeText={(t) => setCompany({ ...company, logoUrl: t })}
              placeholder="Company logo URL"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Website URL</Text>
            <TextInput
              style={styles.textInput}
              value={company.websiteUrl}
              onChangeText={(t) => setCompany({ ...company, websiteUrl: t })}
              placeholder="Company website URL"
            />
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleAddCompany}
              disabled={btnloading}
            >
              {btnloading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <FontAwesome5 name="plus" size={16} color="#ffffff" />
                  <Text style={styles.addButtonText}>Add Company</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Companies List Button */}
          <TouchableOpacity
            style={styles.listButton}
            onPress={() => setShowCompanyList(true)}
          >
            <FontAwesome5 name="list" size={16} color="#667eea" />
            <Text style={styles.listButtonText}>
              View Companies ({companies.length})
            </Text>
            <FontAwesome5 name="chevron-right" size={14} color="#667eea" />
          </TouchableOpacity>
        </View>

        {/* Step 2: Add Category */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <FontAwesome5 name="list" size={16} color="#667eea" />
            <Text style={styles.stepTitle}>Step 2: Add Category</Text>
          </View>

          {selectedCompanyId ? (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                Selected Company: {selectedCompanyName}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowCompanyModal(true)}
            >
              <Text style={styles.selectionText}>Select Company First</Text>
              <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          )}

          {selectedCompanyId && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={category.title}
                  onChangeText={(t) => setCategory({ ...category, title: t })}
                  placeholder="Enter category title"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={category.description}
                  onChangeText={(t) => setCategory({ ...category, description: t })}
                  placeholder="Category description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={category.imageUrl}
                  onChangeText={(t) => setCategory({ ...category, imageUrl: t })}
                  placeholder="Category image URL"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Category URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={category.url}
                  onChangeText={(t) => setCategory({ ...category, url: t })}
                  placeholder="Category URL"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Products Count</Text>
                <TextInput
                  style={styles.textInput}
                  value={category.productsCount}
                  onChangeText={(t) => setCategory({ ...category, productsCount: t })}
                  placeholder="Expected products count"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.addButton, btnloading && styles.disabledButton]} 
                  onPress={handleAddCategory}
                  disabled={btnloading}
                >
                  {btnloading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <FontAwesome5 name="plus" size={16} color="#ffffff" />
                      <Text style={styles.addButtonText}>Add Category</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Categories List Button */}
              <TouchableOpacity
                style={styles.listButton}
                onPress={() => setShowCategoryList(true)}
              >
                <FontAwesome5 name="list" size={16} color="#667eea" />
                <Text style={styles.listButtonText}>
                  View Categories ({categories.length})
                </Text>
                <FontAwesome5 name="chevron-right" size={14} color="#667eea" />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Step 3: Add Product */}
        <View style={styles.stepContainer}>
          <View style={styles.stepHeader}>
            <FontAwesome5 name="box" size={16} color="#667eea" />
            <Text style={styles.stepTitle}>
              {isEditMode ? 'Edit Product' : 'Step 3: Add Product'}
            </Text>
          </View>

          {isEditMode && (
            <View style={[styles.selectedBadge, { backgroundColor: '#FFF3CD' }]}>
              <Text style={[styles.selectedBadgeText, { color: '#856404' }]}>
                📝 Editing Mode - Update product details below
              </Text>
            </View>
          )}

          {!selectedCompanyId ? (
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setShowCompanyModal(true)}
            >
              <Text style={styles.selectionText}>Select Company First</Text>
              <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
            </TouchableOpacity>
          ) : !selectedCategoryId ? (
            <View>
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  Company: {selectedCompanyName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.selectionText}>Select Category</Text>
                <FontAwesome5 name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>
                  {selectedCompanyName} → {selectedCategoryName}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Product Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={product.title}
                  onChangeText={(t) => setProduct({ ...product, title: t })}
                  placeholder="Enter product title"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineInput]}
                  value={product.description}
                  onChangeText={(t) => setProduct({ ...product, description: t })}
                  placeholder="Product description"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={product.imageUrl}
                  onChangeText={(t) => setProduct({ ...product, imageUrl: t })}
                  placeholder="Product image URL"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Product URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={product.url}
                  onChangeText={(t) => setProduct({ ...product, url: t })}
                  placeholder="Product URL"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price *</Text>
                <TextInput
                  style={styles.textInput}
                  value={product.price}
                  onChangeText={(t) => setProduct({ ...product, price: t })}
                  placeholder="Product price"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Original Price</Text>
                <TextInput
                  style={styles.textInput}
                  value={product.originalPrice}
                  onChangeText={(t) => setProduct({ ...product, originalPrice: t })}
                  placeholder="Original price (optional)"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.actionButtons}>
                {isEditMode ? (
                  <>
                    <TouchableOpacity 
                      style={[styles.addButton, styles.updateButton]} 
                      onPress={handleUpdateProduct}
                      disabled={btnloading}
                    >
                      {btnloading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <>
                          <FontAwesome5 name="save" size={16} color="#ffffff" />
                          <Text style={styles.addButtonText}>Update Product</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.resetButton, { flex: 1 }]} 
                      onPress={handleCancelEdit}
                    >
                      <FontAwesome5 name="times" size={16} color="#ef4444" />
                      <Text style={styles.resetButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={[styles.addButton, btnloading && styles.disabledButton]} 
                    onPress={handleAddProduct}
                    disabled={btnloading}
                  >
                    {btnloading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <FontAwesome5 name="plus" size={16} color="#ffffff" />
                        <Text style={styles.addButtonText}>Add Product</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
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
                    const companyIdentifier = company.companyId || company.id;
                    setSelectedCompanyId(companyIdentifier);
                    setSelectedCompanyName(company.name);
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
                    setSelectedCategoryId(category.id);
                    setSelectedCategoryName(category.title);
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

      {/* Company List Modal */}
      <Modal
        visible={showCompanyList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Existing Companies</Text>
              <TouchableOpacity onPress={() => setShowCompanyList(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {loadingCompanies ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#667eea" />
                  <Text style={styles.loadingText}>Loading companies...</Text>
                </View>
              ) : companies.length === 0 ? (
                <Text style={styles.emptyText}>No companies yet. Add one above!</Text>
              ) : (
                companies.map((company) => (
                  <View key={company.id} style={styles.listItemContainer}>
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        (selectedCompanyId === (company.companyId || company.id)) && styles.selectedModalItem
                      ]}
                      onPress={() => {
                        const companyIdentifier = company.companyId || company.id;
                        setSelectedCompanyId(companyIdentifier);
                        setSelectedCompanyName(company.name);
                      }}
                    >
                      <FontAwesome5 name="building" size={16} color="#667eea" />
                      <Text style={styles.modalItemText}>{company.name}</Text>
                      {(selectedCompanyId === (company.companyId || company.id)) && (
                        <FontAwesome5 name="check" size={16} color="#667eea" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButtonModal}
                      onPress={() => {
                        setShowCompanyList(false);
                        handleDeleteCompany(company.id, company.name);
                      }}
                    >
                      <FontAwesome5 name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category List Modal */}
      <Modal
        visible={showCategoryList}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Categories - {selectedCompanyName}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryList(false)}>
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalList}>
              {categories.length === 0 ? (
                <Text style={styles.emptyText}>No categories yet. Add one above!</Text>
              ) : (
                categories.map((category) => (
                  <View key={category.id} style={styles.listItemContainer}>
                    <TouchableOpacity
                      style={[
                        styles.modalItem,
                        (selectedCategoryId === category.id) && styles.selectedModalItem
                      ]}
                      onPress={() => {
                        setSelectedCategoryId(category.id);
                        setSelectedCategoryName(category.title);
                      }}
                    >
                      <FontAwesome5 name="list" size={16} color="#667eea" />
                      <Text style={styles.modalItemText}>{category.title}</Text>
                      {(selectedCategoryId === category.id) && (
                        <FontAwesome5 name="check" size={16} color="#667eea" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButtonModal}
                      onPress={() => {
                        setShowCategoryList(false);
                        handleDeleteCategory(category.id, category.title);
                      }}
                    >
                      <FontAwesome5 name="trash" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Alert overlay above everything */}
      {alertVisible && (
        <View style={styles.alertOverlay}>
          <AlertCard
            type={alertData.type}
            title={alertData.title}
            message={alertData.message}
            buttonText={alertData.buttonText}
            onPress={handleAlertPress}
          />
        </View>
      )}
    </View>
  );
}

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
    marginBottom: 16,
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
  selectedBadge: {
    backgroundColor: '#d4edda',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  selectedBadgeText: {
    color: '#155724',
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 16,
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
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  listButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  listButtonText: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  updateButton: {
    backgroundColor: '#059669',
  },
  // Modal Styles (Bottom Sheet)
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
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  selectedModalItem: {
    backgroundColor: '#eff6ff',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  deleteButtonModal: {
    padding: 12,
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontSize: 16,
  },
  // View Products Button - Top Right
  viewProductsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  viewProductsButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  // Full-screen overlay for AlertCard
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
});
