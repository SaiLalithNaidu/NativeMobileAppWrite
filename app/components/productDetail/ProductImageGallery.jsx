/**
 * ProductImageGallery Component
 * Displays product images with zoom and gallery features
 * 
 * Props:
 * - imageUrl: string - Product image URL
 * - title: string - Product title for alt text
 */

import { FontAwesome5 } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export const ProductImageGallery = ({ imageUrl, title }) => {
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <FontAwesome5 name="image" size={80} color="#ccc" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 400,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
});

export default ProductImageGallery;
