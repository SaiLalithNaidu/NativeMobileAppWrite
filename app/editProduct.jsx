import { FontAwesome5 } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { productService } from './admin/services/productService';

const EditProductScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse product data from params
  const productData = params.product ? JSON.parse(params.product) : null;
  const { companyId, companyName, categoryId, categoryName } = params;

  // Form state
  const [title, setTitle] = useState(productData?.title || '');
  const [description, setDescription] = useState(productData?.description || '');
  const [price, setPrice] = useState(productData?.price?.toString() || '');
  const [originalPrice, setOriginalPrice] = useState(productData?.originalPrice?.toString() || '');
  const [imageUrl, setImageUrl] = useState(productData?.imageUrl || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProduct = async () => {
    // Validation
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product title is required',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (!price.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Product price is required',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const updatedData = {
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price),
        originalPrice: originalPrice ? parseInt(originalPrice) : null,
        imageUrl: imageUrl.trim() || null,
        companyId,
        categoryId,
        updatedAt: new Date().toISOString(),
      };

      await productService.update(productData.id, updatedData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product updated successfully!',
        position: 'top',
        visibilityTime: 2000,
      });

      // Navigate back to admin products screen after a short delay
      setTimeout(() => {
        router.back();
      }, 500);

    } catch (error) {
      console.error('Error updating product:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.message || 'Failed to update product',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Edit Product',
          headerTitleStyle: { fontSize: 18, fontWeight: 'bold' },
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: '#f8f9fa' },
        }} 
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <View style={styles.headerCard}>
            <View style={styles.editBadge}>
              <FontAwesome5 name="edit" size={14} color="#fff" />
              <Text style={styles.editBadgeText}>EDITING PRODUCT</Text>
            </View>
            <Text style={styles.headerCompany}>{companyName}</Text>
            <Text style={styles.headerCategory}>Category: {categoryName}</Text>
          </View>

          {/* Image Preview */}
          {imageUrl ? (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: imageUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.imagePreview, styles.placeholderImage]}>
              <FontAwesome5 name="image" size={50} color="#ccc" />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formCard}>
            {/* Product Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Product Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter product title"
                placeholderTextColor="#999"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter product description"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price (₹) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Original Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Original Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={originalPrice}
                onChangeText={setOriginalPrice}
                placeholder="Enter original price (optional)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="Enter image URL"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={loading}
            >
              <FontAwesome5 name="times" size={16} color="#666" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleUpdateProduct}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <FontAwesome5 name="check" size={16} color="white" />
                  <Text style={styles.updateButtonText}>Update Product</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
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
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6347',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerCompany: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerCategory: {
    fontSize: 14,
    color: '#666',
  },
  imagePreviewContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 12,
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  formCard: {
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  updateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditProductScreen;
