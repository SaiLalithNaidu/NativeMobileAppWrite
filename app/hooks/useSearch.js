/**
 * useSearch Hook
 * Custom hook for search functionality
 * 
 * Features:
 * - Loads all products, companies, and categories on mount
 * - Provides real-time client-side search filtering
 * - Returns mapped company and category names for display
 * - Handles loading and error states
 * 
 * Usage:
 * const { 
 *   searchQuery, 
 *   results, 
 *   loading, 
 *   error,
 *   companyMap,
 *   categoryMap,
 *   handleSearch 
 * } = useSearch();
 */

import { useEffect, useMemo, useState } from 'react';
import { searchService } from '../../app/services/searchService';

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);

  // Load all data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const { products, companies, categories } = await searchService.loadSearchData();
        
        setAllProducts(products);
        setCompanies(companies);
        setCategories(categories);
        
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
  }, []);

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
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    const query = text.trim().toLowerCase();
    if (!query) {
      setResults([]);
      return;
    }

    const matched = searchService.filterProducts(allProducts, query);
    setResults(matched);
  };

  return {
    searchQuery,
    results,
    loading,
    error,
    companyMap,
    categoryMap,
    handleSearch
  };
};
