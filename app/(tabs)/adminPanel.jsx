import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const loadCategories = async (companyId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CATEGORIES_COL
      );
      const filteredCategories = response.documents.filter(
        (cat) => cat.companyId === companyId
      );
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
      const doc = await databases.createDocument(
        DATABASE_ID,
        COMPANIES_COL,
        ID.unique(),
        company
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Company added successfully!',
      });

      setCompany({ name: '', description: '', logoUrl: '', websiteUrl: '' });
      loadCompanies();
    } catch (err) {
      console.error(err);
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
      const categoryData = { 
        ...category, 
        companyId: selectedCompanyId 
      };

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
      console.error(err);
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
      const productData = {
        ...product,
        categoryId: selectedCategoryId,
        companyId: selectedCompanyId,
        price: parseInt(product.price) || 0,
        originalPrice: parseInt(product.originalPrice) || 0,
      };

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
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message || 'Failed to add product',
      });
    }
  };

  const renderCompanyItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedCompanyId === item.$id && styles.selectedItem
      ]}
      onPress={() => {
        setSelectedCompanyId(item.$id);
        setSelectedCompanyName(item.name);
      }}
    >
      <Text style={styles.listItemText}>{item.name}</Text>
      {selectedCompanyId === item.$id && (
        <Text style={styles.checkmark}></Text>
      )}
    </TouchableOpacity>
  );

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
    <ScrollView style={styles.container}>
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
          <FlatList
            data={companies}
            renderItem={renderCompanyItem}
            keyExtractor={(item) => item.$id}
            scrollEnabled={false}
          />
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
              <FlatList
                data={categories}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item.$id}
                scrollEnabled={false}
              />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
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
});
