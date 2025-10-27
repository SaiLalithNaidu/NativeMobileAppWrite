// AdminPanel.js
import React, { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { ID } from "react-native-appwrite";
import { databases } from "../../lib/appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DB_ID;
const COMPANIES_COL = process.env.EXPO_PUBLIC_APPWRITE_COMPANIES;
const CATEGORIES_COL = process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES;
const PRODUCTS_COL = process.env.EXPO_PUBLIC_APPWRITE_PRODUCTS;

export default function AdminPanel() {
  const [company, setCompany] = useState({
    name: "",
    description: "",
    logoUrl: "",
    websiteUrl: "",
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [category, setCategory] = useState({
    title: "",
    description: "",
    imageUrl: "",
    url: "",
    productCount: 0,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [product, setProduct] = useState({
    title: "",
    description: "",
    imageUrl: "",
    url: "",
    price: "",
    originalPrice: "",
    isNew: false,
  });

  // ----------- ADD COMPANY -----------
  const handleAddCompany = async () => {
    if (!company.name) return Alert.alert("Error", "Please enter company name");

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COMPANIES_COL,
        ID.unique(),
        company
      );
      setSelectedCompanyId(doc.$id);
      Alert.alert("✅ Company added successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error adding company", err.message);
    }
  };

  // ----------- ADD CATEGORY -----------
  const handleAddCategory = async () => {
    if (!selectedCompanyId)
      return Alert.alert("Error", "Add or select a company first");

    const categoryData = { ...category, companyId: selectedCompanyId };

    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        CATEGORIES_COL,
        ID.unique(),
        categoryData
      );
      setSelectedCategoryId(doc.$id);
      Alert.alert("✅ Category added successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error adding category", err.message);
    }
  };

  // ----------- ADD PRODUCT -----------
  const handleAddProduct = async () => {
    if (!selectedCategoryId)
      return Alert.alert("Error", "Add or select a category first");

    const productData = {
      ...product,
      categoryId: selectedCategoryId,
      price: parseInt(product.price),
      originalPrice: parseInt(product.originalPrice),
    };

    try {
      await databases.createDocument(
        DATABASE_ID,
        PRODUCTS_COL,
        ID.unique(),
        productData
      );
      Alert.alert("✅ Product added successfully");
    } catch (err) {
      console.error(err);
      Alert.alert("❌ Error adding product", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>
        🏢 Add Company
      </Text>
      <TextInput
        placeholder="Company Name"
        value={company.name}
        onChangeText={(t) => setCompany({ ...company, name: t })}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={company.description}
        onChangeText={(t) => setCompany({ ...company, description: t })}
        style={styles.input}
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
        <Text style={styles.sectionTitle}>
          📂 Add Category
        </Text>
        <TextInput
          placeholder="Title"
          value={category.title}
          onChangeText={(t) => setCategory({ ...category, title: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={category.description}
          onChangeText={(t) => setCategory({ ...category, description: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Image URL"
          value={category.imageUrl}
          onChangeText={(t) => setCategory({ ...category, imageUrl: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Category URL"
          value={category.url}
          onChangeText={(t) => setCategory({ ...category, url: t })}
          style={styles.input}
        />
        <Button title="Add Category" onPress={handleAddCategory} color="coral" />
      </View>

      <View style={styles.separator}>
        <Text style={styles.sectionTitle}>
          🧾 Add Product
        </Text>
        <TextInput
          placeholder="Title"
          value={product.title}
          onChangeText={(t) => setProduct({ ...product, title: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={product.description}
          onChangeText={(t) => setProduct({ ...product, description: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Image URL"
          value={product.imageUrl}
          onChangeText={(t) => setProduct({ ...product, imageUrl: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Product URL"
          value={product.url}
          onChangeText={(t) => setProduct({ ...product, url: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Price"
          keyboardType="numeric"
          value={product.price}
          onChangeText={(t) => setProduct({ ...product, price: t })}
          style={styles.input}
        />
        <TextInput
          placeholder="Original Price"
          keyboardType="numeric"
          value={product.originalPrice}
          onChangeText={(t) => setProduct({ ...product, originalPrice: t })}
          style={styles.input}
        />
        <Button title="Add Product" onPress={handleAddProduct} color="coral" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
    marginVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 20,
  },
});
