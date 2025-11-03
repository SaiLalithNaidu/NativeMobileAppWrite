import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
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
  }, [params.editProduct]);

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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load companies',
      });
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load categories',
      });
    }
  };

  const navigateToProducts = () => {
    if (!selectedCompanyId || !selectedCategoryId) {
      Toast.show({
        type: 'warning',
        text1: 'Selection Required',
        text2: 'Please select both company and category first',
      });
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not find selected company or category data',
      });
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
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Company name is required',
      });
      return;
    }

    try {
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

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Company added successfully!',
      });

      setCompany({ name: '', description: '', logoUrl: '', websiteUrl: '' });
      loadCompanies();
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to add company',
      });
    }
  };

  const handleAddCategory = async () => {
    if (!selectedCompanyId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a company first',
      });
      return;
    }

    if (!category.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Category title is required',
      });
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

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category added successfully!',
      });
      setBtnLoading(false);

      setCategory({ title: '', description: '', imageUrl: '', url: '', productsCount: '' });
      loadCategories(selectedCompanyId);
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to add category',
      });
    }
  };

  const handleAddProduct = async () => {
    if (!selectedCompanyId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a company first',
      });
      return;
    }

    if (!selectedCategoryId) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select a category first',
      });
      return;
    }

    if (!product.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product title is required',
      });
      return;
    }

    if (!product.price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product price is required',
      });
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

      const productsRef = collection(db, 'products');
      await addDoc(productsRef, productData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product added successfully!',
      });

      setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        response: err.response
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to add product',
      });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProductId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No product selected for editing',
      });
      return;
    }

    if (!product.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product title is required',
      });
      return;
    }

    if (!product.price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product price is required',
      });
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

      const productRef = doc(db, 'products', editingProductId);
      await updateDoc(productRef, productData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product updated successfully!',
      });

      // Reset form and edit mode
      setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
      setIsEditMode(false);
      setEditingProductId(null);
    } catch (err) {
      console.error('Error updating product:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to update product',
      });
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
    Toast.show({
      type: 'info',
      text1: 'Edit Mode',
      text2: 'Update product details below',
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingProductId(null);
    setProduct({ title: '', description: '', imageUrl: '', url: '', price: '', originalPrice: '' });
    Toast.show({
      type: 'info',
      text1: 'Cancelled',
      text2: 'Edit mode cancelled',
    });
  };

  // Delete functions
  const handleDeleteCompany = async (companyId, companyName) => {
    Alert.alert(
      'Delete Company',
      `Are you sure you want to delete "${companyName}"? This will also delete all associated categories and products.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Company and all related data deleted!',
              });

              loadCompanies();
              if (selectedCompanyId === companyIdentifier) {
                setSelectedCompanyId(null);
                setSelectedCompanyName('');
                setCategories([]);
              }
            } catch (err) {
              console.error('Error deleting company:', err);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: err.message || 'Failed to delete company',
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteCategory = async (categoryId, categoryTitle) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryTitle}"? This will also delete all products in this category.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
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
              showAlert('success', 'Success', 'Category and all products deleted!');

              if (selectedCompanyId) {
                loadCategories(selectedCompanyId);
              }
              if (selectedCategoryId === categoryId) {
                setSelectedCategoryId(null);
                setSelectedCategoryName('');
              }
            } catch (err) {
              // Use custom AlertCard for error feedback
              showAlert('error', 'Error', err.message || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const handleDeleteProduct = async (productId, productTitle) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${productTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'products', productId));

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product deleted!',
              });

              // Use custom AlertCard for success feedback
              showAlert('success', 'Success', 'Product deleted!');
              
            } catch (err) {
              console.error('Error deleting product:', err);
              // Use custom AlertCard for error feedback
              showAlert('error', 'Error', err.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const renderCompanyItem = ({ item }) => {
    // Use custom companyId if it exists, otherwise use Firebase document id
    let companyIdentifier = item.companyId || item.id;
    
    return (
      <View style={styles.listItemContainer}>
        <TouchableOpacity
          style={[
            styles.listItem,
            selectedCompanyId === companyIdentifier && styles.selectedItem
          ]}
          onPress={() => {
            console.log('Using identifier:', companyIdentifier);
            setSelectedCompanyId(companyIdentifier);
            setSelectedCompanyName(item.name);
          }}
        >
          <Text style={styles.listItemText}>{item.name}</Text>
          {selectedCompanyId === companyIdentifier && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCompany(item.id, item.name)}
        >
          <AntDesign name="delete" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.listItemContainer}>
      <TouchableOpacity
        style={[
          styles.listItem,
          selectedCategoryId === item.id && styles.selectedItem
        ]}
        onPress={() => {
          setSelectedCategoryId(item.id);
          setSelectedCategoryName(item.title);
        }}
      >
        <Text style={styles.listItemText}>{item.title}</Text>
        {selectedCategoryId === item.id && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCategory(item.id, item.title)}
      >
        <AntDesign name="delete" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>🏢 Add Company</Text>
      <TextInput
        placeholder="Company Name *"
        value={company.name}
        onChangeText={(t) => setCompany({ ...company, name: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={company.description}
        onChangeText={(t) => setCompany({ ...company, description: t })}
        style={styles.input}
        multiline
      />
      <TextInput
        placeholder="Logo URL"
        value={company.logoUrl}
        onChangeText={(t) => setCompany({ ...company, logoUrl: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Website URL"
        value={company.websiteUrl}
        onChangeText={(t) => setCompany({ ...company, websiteUrl: t })}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddCompany}>
        <Text style={styles.buttonText}>{btnloading ? <ActivityIndicator color="white" />
                    : "Add Company"}</Text>
      </TouchableOpacity>

      <View style={styles.separator}>
        <Text style={styles.sectionTitle}>📋 Existing Companies</Text>
        {loadingCompanies ? (
          <ActivityIndicator size="small" color="coral" />
        ) : companies.length === 0 ? (
          <Text style={styles.emptyText}>No companies yet. Add one above!</Text>
        ) : (
          <View style={styles.listContainer}>
            <ScrollView 
              style={styles.scrollableList}
              nestedScrollEnabled={true}
            >
              {companies.map((item) => (
                <View key={item.id}>
                  {renderCompanyItem({ item })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View style={styles.separator}>
        <Text style={styles.sectionTitle}>📂 Add Category</Text>
        {selectedCompanyId ? (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              Selected Company: {selectedCompanyName}
            </Text>
          </View>
        ) : (
          <Text style={styles.warningText}>⚠️ Please select a company first</Text>
        )}
        
        <TextInput
          placeholder="Category Title *"
          value={category.title}
          onChangeText={(t) => setCategory({ ...category, title: t })}
          style={styles.input}
          editable={!!selectedCompanyId}
        />
        <TextInput
          placeholder="Description"
          value={category.description}
          onChangeText={(t) => setCategory({ ...category, description: t })}
          style={styles.input}
          multiline
          editable={!!selectedCompanyId}
        />
        <TextInput
          placeholder="Image URL"
          value={category.imageUrl}
          onChangeText={(t) => setCategory({ ...category, imageUrl: t })}
          style={styles.input}
          editable={!!selectedCompanyId}
        />
        <TextInput
          placeholder="Category URL"
          value={category.url}
          onChangeText={(t) => setCategory({ ...category, url: t })}
          style={styles.input}
          editable={!!selectedCompanyId}
        />
        <TextInput
          placeholder="Products count"
          value={category.productsCount}
          onChangeText={(t) => setCategory({ ...category, productsCount: t })}
          style={styles.input}
          editable={!!selectedCompanyId}
        />
        <TouchableOpacity 
          style={[styles.button, (!selectedCompanyId || btnloading) && styles.buttonDisabled]} 
          onPress={handleAddCategory}
          disabled={!selectedCompanyId || btnloading}
        >
          <Text style={styles.buttonText}>{btnloading ? <ActivityIndicator color="white" />
                    : "Add Category"}</Text>
        </TouchableOpacity>

        {selectedCompanyId && (
          <View style={styles.subSection}>
            <Text style={styles.subSectionTitle}>
              Categories under {selectedCompanyName}
            </Text>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>No categories yet. Add one above!</Text>
            ) : (
              <View style={styles.listContainer}>
                <ScrollView 
                  style={styles.scrollableList}
                  nestedScrollEnabled={true}
                >
                  {categories.map((item) => (
                    <View key={item.id}>
                      {renderCategoryItem({ item })}
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.separator}>
        <Text style={styles.sectionTitle}>
          {isEditMode ? '✏️ Edit Product' : '🧾 Add Product'}
        </Text>
        {isEditMode && (
          <View style={[styles.selectedBadge, { backgroundColor: '#FFF3CD' }]}>
            <Text style={[styles.selectedBadgeText, { color: '#856404' }]}>
              📝 Editing Mode - Update product details below
            </Text>
          </View>
        )}
        {selectedCompanyId ? (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              Company: {selectedCompanyName}
            </Text>
          </View>
        ) : (
          <Text style={styles.warningText}>⚠️ Please select a company first</Text>
        )}
        
        {selectedCategoryId ? (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>
              Category: {selectedCategoryName}
            </Text>
          </View>
        ) : selectedCompanyId ? (
          <Text style={styles.warningText}>⚠️ Please select a category first</Text>
        ) : null}

        <TextInput
          placeholder="Product Title *"
          value={product.title}
          onChangeText={(t) => setProduct({ ...product, title: t })}
          style={styles.input}
          editable={!!selectedCategoryId}
        />
        <TextInput
          placeholder="Description"
          value={product.description}
          onChangeText={(t) => setProduct({ ...product, description: t })}
          style={styles.input}
          multiline
          editable={!!selectedCategoryId}
        />
        <TextInput
          placeholder="Image URL"
          value={product.imageUrl}
          onChangeText={(t) => setProduct({ ...product, imageUrl: t })}
          style={styles.input}
          editable={!!selectedCategoryId}
        />
        <TextInput
          placeholder="Product URL"
          value={product.url}
          onChangeText={(t) => setProduct({ ...product, url: t })}
          style={styles.input}
          editable={!!selectedCategoryId}
        />
        <TextInput
          placeholder="Price *"
          keyboardType="numeric"
          value={product.price}
          onChangeText={(t) => setProduct({ ...product, price: t })}
          style={styles.input}
          editable={!!selectedCategoryId}
        />
        <TextInput
          placeholder="Original Price"
          keyboardType="numeric"
          value={product.originalPrice}
          onChangeText={(t) => setProduct({ ...product, originalPrice: t })}
          style={styles.input}
          editable={!!selectedCategoryId}
        />
        {isEditMode ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.updateButton, { flex: 1 }]} 
              onPress={handleUpdateProduct}
            >
              <Text style={styles.buttonText}>
                {btnloading ? <ActivityIndicator color="white" /> : "Update Product"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { flex: 1 }]} 
              onPress={handleCancelEdit}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.button, !selectedCategoryId && styles.buttonDisabled]} 
            onPress={handleAddProduct}
            disabled={!selectedCategoryId}
          >
            <Text style={styles.buttonText}>
              {btnloading ? <ActivityIndicator color="white" /> : "Add Product"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

        <Toast />
      </ScrollView>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
  },
  separator: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  subSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedItem: {
    backgroundColor: '#fff0f0',
    borderColor: 'coral',
    borderWidth: 2,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: 'coral',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  selectedBadge: {
    backgroundColor: '#d4edda',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  selectedBadgeText: {
    color: '#155724',
    fontWeight: '600',
    fontSize: 14,
  },
  warningText: {
    color: '#856404',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  listContainer: {
    maxHeight: 250,
    marginTop: 10,
  },
  scrollableList: {
    flexGrow: 0,
  },
  button: {
        backgroundColor: 'coral',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        color: 'white',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
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
    buttonDisabled: {
      backgroundColor: '#cccccc',
      opacity: 0.6,
    },
    buttonRow: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 10,
      marginBottom: 20,
    },
    updateButton: {
      backgroundColor: '#28a745',
    },
    cancelButton: {
      backgroundColor: '#6c757d',
    },
    // View Products Button - Top Right
    viewProductsButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      backgroundColor: 'coral',
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
    // Products View Styles (Grid Layout - Similar to Categories)
    productsViewContainer: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    productsViewHeader: {
      backgroundColor: 'white',
      paddingHorizontal: 20,
      paddingVertical: 15,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      padding: 8,
    },
    backButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    productsViewTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 8,
    },
    productsViewSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 50,
    },
    loadingText: {
      marginTop: 10,
      color: '#666',
      fontSize: 16,
    },
    emptyProductsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyProductsText: {
      fontSize: 18,
      color: '#999',
      marginTop: 15,
      fontWeight: '600',
    },
    emptyProductsSubtext: {
      fontSize: 14,
      color: '#bbb',
      marginTop: 5,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    productsGridContainer: {
      paddingHorizontal: 5,
      paddingVertical: 15,
      paddingBottom: 20,
    },
    productsGridRow: {
      justifyContent: 'space-between',
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    productCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      width: '48%',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    productImageContainer: {
      width: '100%',
      height: 140,
      backgroundColor: '#f0f0f0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderProduct: {
      backgroundColor: '#f5f5f5',
    },
    productImageIcon: {
      fontSize: 30,
      marginBottom: 5,
    },
    productImageUrl: {
      fontSize: 10,
      color: '#888',
      textAlign: 'center',
      paddingHorizontal: 5,
    },
    productCardInfo: {
      padding: 12,
    },
    productCardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
      minHeight: 36,
    },
    productCardDescription: {
      fontSize: 12,
      color: '#666',
      marginBottom: 8,
      lineHeight: 16,
    },
    productPriceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    productCardPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    originalPriceSmall: {
      fontSize: 12,
      color: '#999',
      textDecorationLine: 'line-through',
    },
});
