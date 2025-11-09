/**
 * Search History Service
 * Manages search history using AsyncStorage
 * 
 * Features:
 * - Stores last 5 unique search queries per user
 * - Prevents duplicate entries
 * - Provides easy retrieval and clearing functionality
 * - User-specific history storage
 * 
 * Usage:
 * import { searchHistoryService } from './services/searchHistoryService';
 * await searchHistoryService.addSearchQuery(userId, 'search term');
 * const history = await searchHistoryService.getSearchHistory(userId);
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class SearchHistoryService {
  constructor() {
    this.MAX_HISTORY_ITEMS = 5;
    this.STORAGE_KEY_PREFIX = 'search_history_';
  }

  /**
   * Get storage key for user-specific search history
   * @param {string} userId - User ID
   * @returns {string} Storage key
   */
  getStorageKey(userId) {
    return `${this.STORAGE_KEY_PREFIX}${userId || 'anonymous'}`;
  }

  /**
   * Get search history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of search queries (most recent first)
   */
  async getSearchHistory(userId) {
    try {
      const storageKey = this.getStorageKey(userId);
      const historyJson = await AsyncStorage.getItem(storageKey);
      
      if (historyJson) {
        const history = JSON.parse(historyJson);
        console.log(`📚 Retrieved ${history.length} search history items for user ${userId}`);
        return history;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error retrieving search history:', error);
      return [];
    }
  }

  /**
   * Add a search query to history
   * @param {string} userId - User ID
   * @param {string} query - Search query to add
   * @returns {Promise<void>}
   */
  async addSearchQuery(userId, query) {
    try {
      if (!query || !query.trim()) {
        return; // Don't save empty queries
      }

      const trimmedQuery = query.trim();
      const storageKey = this.getStorageKey(userId);
      
      // Get existing history
      let history = await this.getSearchHistory(userId);
      
      // Remove query if it already exists (to move it to front)
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Add new query to the beginning
      history.unshift(trimmedQuery);
      
      // Keep only the last MAX_HISTORY_ITEMS
      if (history.length > this.MAX_HISTORY_ITEMS) {
        history = history.slice(0, this.MAX_HISTORY_ITEMS);
      }
      
      // Save updated history
      await AsyncStorage.setItem(storageKey, JSON.stringify(history));
      console.log(`💾 Saved search query "${trimmedQuery}" to history for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error saving search query to history:', error);
    }
  }

  /**
   * Clear all search history for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async clearSearchHistory(userId) {
    try {
      const storageKey = this.getStorageKey(userId);
      await AsyncStorage.removeItem(storageKey);
      console.log(`🗑️ Cleared search history for user ${userId}`);
    } catch (error) {
      console.error('❌ Error clearing search history:', error);
    }
  }

  /**
   * Remove a specific search query from history
   * @param {string} userId - User ID
   * @param {string} query - Query to remove
   * @returns {Promise<void>}
   */
  async removeSearchQuery(userId, query) {
    try {
      if (!query || !query.trim()) {
        return;
      }

      const trimmedQuery = query.trim();
      const storageKey = this.getStorageKey(userId);
      
      // Get existing history
      let history = await this.getSearchHistory(userId);
      
      // Remove the specific query
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Save updated history
      await AsyncStorage.setItem(storageKey, JSON.stringify(history));
      console.log(`🗑️ Removed "${trimmedQuery}" from search history for user ${userId}`);
      
    } catch (error) {
      console.error('❌ Error removing search query from history:', error);
    }
  }

  /**
   * Check if a query exists in history
   * @param {string} userId - User ID
   * @param {string} query - Query to check
   * @returns {Promise<boolean>} True if query exists in history
   */
  async isQueryInHistory(userId, query) {
    try {
      if (!query || !query.trim()) {
        return false;
      }

      const history = await this.getSearchHistory(userId);
      const trimmedQuery = query.trim().toLowerCase();
      
      return history.some(item => item.toLowerCase() === trimmedQuery);
    } catch (error) {
      console.error('❌ Error checking if query exists in history:', error);
      return false;
    }
  }
}

// Export singleton instance
export const searchHistoryService = new SearchHistoryService();