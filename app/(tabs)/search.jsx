import { FontAwesome5 } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { TextInput, View } from "react-native";
import { db } from '../../lib/firebase';


import { useRouter } from "expo-router";
// import { allProducts } from "../data/mockData";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState([]);

const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log("Products fetched:", productsData.length);
      return productsData;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  };

// Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productsData] = await Promise.all([
          fetchProducts()
        ]);
        
        setAllProducts(productsData);

       if (productsData.length === 0) {
         setError("No products found");
       }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);
    
    const handleSearch = (text) => {
        setSearchQuery(text);
        
        if (!text.trim()) {
          return;
        }
    
        const searchLower = text.toLowerCase();
        
        // Search in products
        const matchedProducts = allProducts.filter(prod =>
          prod.title?.toLowerCase().includes(searchLower) ||
          prod.description?.toLowerCase().includes(searchLower)
        );
        
        console.log(`🔍 Search: "${text}" | ${matchedProducts.length} products found`);
        
        // Navigate to search results page
        router.push({
          pathname: '/search-results',
          params: {
            query: text,
            results: JSON.stringify(matchedProducts)
          }
        });
      };
    return <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search products..." 
          style={styles.searchInput}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
      </View>
}

const styles = {
  searchContainer: {
    flexDirection: 'row',   
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    margin: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
};

export default Search;
