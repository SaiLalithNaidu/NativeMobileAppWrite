/**
 * useSearch Hook
 * Custom hook for search functionality
 * 
 * Features:
 * - Loads all products, companies, and categories on mount
 * - Provides real-time client-side search filtering
 * - Returns mapped company and category names for display
 * - Handles loading and error states
 * - Manages search history with AsyncStorage
 * 
 * Usage:
 * const { 
 *   searchQuery, 
 *   results, 
 *   loading, 
 *   error,
 *   companyMap,
 *   categoryMap,
 *   searchHistory,
 *   handleSearch,
 *   handleSearchFromHistory,
 *   clearSearchHistory
 * } = useSearch();
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { searchService } from '../../app/services/searchService';
import { searchHistoryService } from '../../app/services/searchHistoryService';

export const useSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  // Load all data on mount and search history
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const { products, companies, categories } = await searchService.loadSearchData();
        
        setAllProducts(products);
        setCompanies(companies);
        setCategories(categories);
        
        // Load search history
        if (user) {
          const history = await searchHistoryService.getSearchHistory(user.uid);
          setSearchHistory(history);
        }
        
        if (products.length === 0) {
          setError("No products found");
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
        console.error('Search data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user]);

  // Create lookup maps for companies and categories
  const companyMap = useMemo(() => {
    const map = new Map();
    companies.forEach(c => map.set(c.companyId || c.id, c.name));
    return map;
  }, [companies]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c.id, c.title));
    return map;
  }, [categories]);

  // Search handler
  const handleSearch = async (text) => {
    setSearchQuery(text);
    
    const query = text.trim().toLowerCase();
    if (!query) {
      setResults([]);
      return;
    }

    const matched = searchService.filterProducts(allProducts, query);
    setResults(matched);

    // Save to search history if user is logged in and query has results
    if (user && matched.length > 0) {
      await searchHistoryService.addSearchQuery(user.uid, text.trim());
      // Refresh search history
      const updatedHistory = await searchHistoryService.getSearchHistory(user.uid);
      setSearchHistory(updatedHistory);
    }
  };

  // Handle search from history
  const handleSearchFromHistory = (historyQuery) => {
    setSearchQuery(historyQuery);
    const matched = searchService.filterProducts(allProducts, historyQuery);
    setResults(matched);
  };

  // Clear search history
  const clearSearchHistory = async () => {
    if (user) {
      await searchHistoryService.clearSearchHistory(user.uid);
      setSearchHistory([]);
    }
  };

  return {
    searchQuery,
    results,
    loading,
    error,
    companyMap,
    categoryMap,
    searchHistory,
    handleSearch,
    handleSearchFromHistory,
    clearSearchHistory
  };
};
