import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { databases } from "../../lib/appwrite";

const FetchCategories = async () => {
    try 
    {
              
        const response = await databases.listDocuments(
            process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
            process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES
        );
        
        console.log('Categories fetched:', response.documents.length);
        return response.documents;
    } 
    catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await FetchCategories();
                setCategories(data);
                if (data.length === 0) {
                    setError('No categories found');
                }
            } catch (err) {
                if (err.message && err.message.includes('not authorized')) {
                    setError('Permission denied. Please update Appwrite collection permissions.');
                } else {
                    setError('Failed to load categories');
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
                <Text style={styles.loadingText}>Loading categories...</Text>
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
        <View style={styles.container}>
            <Text style={styles.title}>Categories ({categories.length})</Text>
            <FlatList
                data={categories}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => (
                    <View style={styles.categoryItem}>
                        <Text style={styles.categoryName}>{item.name || item.title || 'Unnamed'}</Text>
                        {item.description && (
                            <Text style={styles.categoryDescription}>{item.description}</Text>
                        )}
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No categories available</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333'
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
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    categoryDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666'
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center'
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20
    }
});

export default Categories;