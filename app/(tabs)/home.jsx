import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { databases } from "../../lib/appwrite";

const Index = () => {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await FetchCompanies();
        setCompanies(data);
        console.log('Companies data length:', data.length);

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
      <Text style={styles.title}>Companies ({companies.length})</Text>

      <FlatList
        data={companies}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <View style={styles.categoryItem}>
            <Text style={styles.categoryName}>
              {item.name || item.title || "Unnamed"}
            </Text>
            {item.description && (
              <Text style={styles.categoryDescription}>
                {item.description}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No companies available</Text>
        }
      />
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
    padding: 20,
    backgroundColor: '#f5f5f5',
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
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
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
});

export default Index;


