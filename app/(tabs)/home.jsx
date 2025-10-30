import { FontAwesome5 } from '@expo/vector-icons';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { databases } from "../../lib/appwrite";
import ImageCarousel from '../components/imageCarousel';

const Index = () => {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const FetchCategories = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
        process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES
      );

      console.log("Categories fetched:", response.documents.length);
      return response.documents;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  };

  const FetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      console.log('DB ID:', process.env.EXPO_PUBLIC_APPWRITE_DB_ID);
      console.log('Companies Collection ID:', process.env.EXPO_PUBLIC_APPWRITE_COMPANIES);
      
      if (!process.env.EXPO_PUBLIC_APPWRITE_DB_ID || !process.env.EXPO_PUBLIC_APPWRITE_COMPANIES) {
        throw new Error('Database ID or Collection ID is not set in .env file');
      }
      
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
        process.env.EXPO_PUBLIC_APPWRITE_COMPANIES
      );

      console.log("Companies fetched:", response.documents.length);
      return response.documents;
    } catch (error) {
      console.error("Error fetching companies:", error);
      console.error("Error details:", error.message, error.code, error.type);
      throw error;
    }
  };

  const FetchProducts = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
        process.env.EXPO_PUBLIC_APPWRITE_PRODUCTS
      );

      console.log("Products fetched:", response.documents.length);
      return response.documents;
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error details:", error.message, error.code, error.type);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await FetchCompanies();
        const categoriesData = await FetchCategories();
        const productsData = await FetchProducts();
        setCompanies(data);
        console.log('Categories data length:', categoriesData.length);
        console.log('Products data length:', productsData.length);
        console.log('Companies data length:', data.length);
        setCategories(categoriesData);
        setProducts(productsData);

        if (data.length === 0) 
        {
          setError("No companies found");
        }
      } catch (err) {
        if (err.message?.includes("not authorized")) {
          setError("Permission denied. Update Appwrite collection permissions.");
        } else if (err.message?.includes("could not be found")) {
          setError("Collection not found. Check your collection ID in .env file.");
        } else {
          setError(`Failed to load companies: ${err.message}`);
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="coral" />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
        <View style={styles.imageContainer}>
          <ImageCarousel/>
        </View>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" style={styles.searchIcon} />
          <TextInput 
            placeholder="Search..." 
            style={styles.searchInput}
            placeholderTextColor="#999"
          />
        </View>
      <View style={styles.contentContainer}>
      <FlatList
        data={companies}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            {item.logoUrl && (
              <Image 
                source={{ uri: item.logoUrl }}
                style={styles.companyLogo}
                resizeMode="contain"
              />
            )}
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>
                {item.name || item.title || "Unnamed"}
              </Text>
              <View style={styles.categoryDescription}>
                <Text>{item.name === 'Leo Aqua Laboratories' ? categories.length : 0} Categories</Text>
                <Text>{item.name === 'Leo Aqua Laboratories' ? products.length : 0} Products</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
            
          </View> 
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No companies available</Text>
        }
      />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    top: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 10,
  },
  categoryItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 60,
    height: 60,
    marginRight: 12,
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  // categoryDescription: {
  //   fontSize: 14,
  //   color: "#555",
  //   marginTop: 4,
  // },
  emptyText: {
    color: "#666",
    marginTop: 20,
    textAlign: 'center',
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: "#555",
  },
  imageContainer:{
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  input:{
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 16,
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
  searchIcon:{
    size:15,
    color:"rgba(66, 65, 65, 1)"
  },
  categoryDescription:{
    display:"flex",
    flexDirection:"row",
    gap:10,
  },
  categoryInfo:{
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-around",
    alignItems:"flex-start",
  },
  viewDetailsBtn:{
    marginTop: 5,
    height: 25,
    backgroundColor: 'green',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  viewDetailsBtnText:{
    color: 'white',
  }
});

export default Index;


