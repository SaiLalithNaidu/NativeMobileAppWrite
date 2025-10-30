import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import Toast from 'react-native-toast-message';
import { databases } from '../../lib/appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const COMPANIES_COL = process.env.EXPO_PUBLIC_APPWRITE_COMPANIES;
const CATEGORIES_COL = process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES;
const PRODUCTS_COL = process.env.EXPO_PUBLIC_APPWRITE_PRODUCTS;

export default function AdminPanel() {
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
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

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPANIES_COL
      );
      console.log('Companies loaded:', response.documents.map(c => ({ 
        name: c.name, 
        $id: c.$id, 
        companyId: c.companyId 
      })));
      setCompanies(response.documents);
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
      const response = await databases.listDocuments(
        DATABASE_ID,
        CATEGORIES_COL
      );
      console.log('All categories:', response.documents);
      console.log('Looking for company identifier:', companyIdentifier);
      console.log('Type of identifier:', typeof companyIdentifier);
      
      // Filter by companyId attribute
      // The companyId in categories might be a custom string (like "company_leo_aqua") 
      // or the Appwrite document $id
      const filteredCategories = response.documents.filter(
        (cat) => {
          console.log('Category:', cat.title, 'companyId:', cat.companyId, 'Type:', typeof cat.companyId);
          return cat.companyId === companyIdentifier;
        }
      );
      console.log('Filtered categories count:', filteredCategories.length);
      console.log('Filtered categories:', filteredCategories.map(c => ({ title: c.title, companyId: c.companyId })));
      setCategories(filteredCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load categories',
      });
    }
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

      const doc = await databases.createDocument(
        DATABASE_ID,
        COMPANIES_COL,
        ID.unique(),
        companyData
      );

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

      console.log('Creating category with data:', categoryData);

      const doc = await databases.createDocument(
        DATABASE_ID,
        CATEGORIES_COL,
        ID.unique(),
        categoryData
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category added successfully!',
      });

      setCategory({ title: '', description: '', imageUrl: '', url: '' });
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

      await databases.createDocument(
        DATABASE_ID,
        PRODUCTS_COL,
        ID.unique(),
        productData
      );

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

  const renderCompanyItem = ({ item }) => {
    // TEMPORARY FIX: Use custom companyId if it exists
    // For Leo Aqua, use the legacy identifier that matches the categories
    let companyIdentifier = item.companyId || item.$id;
    
    // Hardcoded fix for Leo Aqua company until database is updated
    if (item.$id === "68fd1831003695c8a755" && !item.companyId) {
      companyIdentifier = "company_leo_aqua";
    }
    
    return (
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
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedCategoryId === item.$id && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedCategoryId(item.$id);
        setSelectedCategoryName(item.title);
      }}
    >
      <Text style={styles.listItemText}>{item.title}</Text>
      {selectedCategoryId === item.$id && (
        <Text style={styles.checkmark}></Text>
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
      <Button title="Add Company" onPress={handleAddCompany} color="coral" />

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
                <View key={item.$id}>
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
        <Button 
          title="Add Category" 
          onPress={handleAddCategory} 
          color="coral"
          disabled={!selectedCompanyId}
        />

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
                    <View key={item.$id}>
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
        <Text style={styles.sectionTitle}>🧾 Add Product</Text>
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
        <Button 
          title="Add Product" 
          onPress={handleAddProduct} 
          color="coral"
          disabled={!selectedCategoryId}
        />
      </View>

        <Toast />
      </ScrollView>
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
    paddingBottom: 40,
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
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
});
