/**
 * Simple Sales Analytics Service
 * Simplified version that doesn't require Firebase indexes
 * Perfect for testing and development
 */

import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class SimpleSalesAnalyticsService {
  /**
   * Get all sales data (simplified approach)
   * @returns {Promise<Array>} All sales records
   */
  static async getAllSales() {
    try {
      const salesRef = collection(db, 'sales');
      const salesSnapshot = await getDocs(salesRef);
      
      const sales = salesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure date is properly formatted
        saleDate: doc.data().saleDate?.toDate ? doc.data().saleDate.toDate() : new Date(doc.data().saleDate)
      }));

      return sales;
    } catch (error) {
      console.error('❌ Error fetching all sales:', error);
      throw new Error('Failed to fetch sales data');
    }
  }

  /**
   * Get today's sales (client-side filtering)
   * @param {string} companyId - Optional company filter
   * @returns {Promise<Object>} Today's sales summary
   */
  static async getTodaysSales(companyId = null) {
    try {
      const allSales = await this.getAllSales();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysSales = allSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        saleDate.setHours(0, 0, 0, 0);
        
        const isToday = saleDate.getTime() === today.getTime();
        const isCompanyMatch = !companyId || sale.companyId === companyId;
        
        return isToday && isCompanyMatch;
      });

      const totalRevenue = todaysSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.revenue || 0), 0);
      const totalQuantity = todaysSales.reduce((sum, sale) => {
        if (sale.items) {
          return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }
        return sum + (sale.quantity || 0);
      }, 0);

      return {
        sales: todaysSales,
        count: todaysSales.length,
        totalRevenue,
        totalQuantity,
        averageOrderValue: todaysSales.length > 0 ? totalRevenue / todaysSales.length : 0
      };
    } catch (error) {
      console.error('❌ Error getting today\'s sales:', error);
      throw new Error('Failed to get today\'s sales');
    }
  }

  /**
   * Get weekly sales (client-side filtering)
   * @param {string} companyId - Optional company filter
   * @returns {Promise<Object>} Weekly sales summary
   */
  static async getWeeklySales(companyId = null) {
    try {
      const allSales = await this.getAllSales();
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);

      const weeklySales = allSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const isThisWeek = saleDate >= weekStart;
        const isCompanyMatch = !companyId || sale.companyId === companyId;
        
        return isThisWeek && isCompanyMatch;
      });

      const totalRevenue = weeklySales.reduce((sum, sale) => sum + (sale.totalAmount || sale.revenue || 0), 0);
      const totalQuantity = weeklySales.reduce((sum, sale) => {
        if (sale.items) {
          return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }
        return sum + (sale.quantity || 0);
      }, 0);

      return {
        sales: weeklySales,
        count: weeklySales.length,
        totalRevenue,
        totalQuantity,
        averageOrderValue: weeklySales.length > 0 ? totalRevenue / weeklySales.length : 0
      };
    } catch (error) {
      console.error('❌ Error getting weekly sales:', error);
      throw new Error('Failed to get weekly sales');
    }
  }

  /**
   * Get monthly sales (client-side filtering)
   * @param {string} companyId - Optional company filter
   * @returns {Promise<Object>} Monthly sales summary
   */
  static async getMonthlySales(companyId = null) {
    try {
      const allSales = await this.getAllSales();
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const monthlySales = allSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const isThisMonth = saleDate >= monthStart;
        const isCompanyMatch = !companyId || sale.companyId === companyId;
        
        return isThisMonth && isCompanyMatch;
      });

      const totalRevenue = monthlySales.reduce((sum, sale) => sum + (sale.totalAmount || sale.revenue || 0), 0);
      const totalQuantity = monthlySales.reduce((sum, sale) => {
        if (sale.items) {
          return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }
        return sum + (sale.quantity || 0);
      }, 0);

      return {
        sales: monthlySales,
        count: monthlySales.length,
        totalRevenue,
        totalQuantity,
        averageOrderValue: monthlySales.length > 0 ? totalRevenue / monthlySales.length : 0
      };
    } catch (error) {
      console.error('❌ Error getting monthly sales:', error);
      throw new Error('Failed to get monthly sales');
    }
  }

  /**
   * Get yearly sales (client-side filtering)
   * @param {string} companyId - Optional company filter
   * @returns {Promise<Object>} Yearly sales summary
   */
  static async getYearlySales(companyId = null) {
    try {
      const allSales = await this.getAllSales();
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);

      const yearlySales = allSales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        const isThisYear = saleDate >= yearStart;
        const isCompanyMatch = !companyId || sale.companyId === companyId;
        
        return isThisYear && isCompanyMatch;
      });

      const totalRevenue = yearlySales.reduce((sum, sale) => sum + (sale.totalAmount || sale.revenue || 0), 0);
      const totalQuantity = yearlySales.reduce((sum, sale) => {
        if (sale.items) {
          return sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }
        return sum + (sale.quantity || 0);
      }, 0);

      return {
        sales: yearlySales,
        count: yearlySales.length,
        totalRevenue,
        totalQuantity,
        averageOrderValue: yearlySales.length > 0 ? totalRevenue / yearlySales.length : 0
      };
    } catch (error) {
      console.error('❌ Error getting yearly sales:', error);
      throw new Error('Failed to get yearly sales');
    }
  }

  /**
   * Get top selling products (client-side analysis)
   * @param {string} companyId - Optional company filter
   * @param {number} limit - Number of top products to return
   * @returns {Promise<Array>} Top selling products
   */
  static async getTopProducts(companyId = null, limit = 5) {
    try {
      const allSales = await this.getAllSales();
      
      // Filter by company if specified
      const filteredSales = companyId 
        ? allSales.filter(sale => sale.companyId === companyId)
        : allSales;

      // Group sales by product
      const productSales = {};
      
      filteredSales.forEach(sale => {
        if (sale.items) {
          // If sale has items array (order format)
          sale.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                productId: item.productId,
                productTitle: item.productTitle || item.title,
                totalQuantity: 0,
                totalRevenue: 0,
                salesCount: 0
              };
            }
            productSales[item.productId].totalQuantity += item.quantity;
            productSales[item.productId].totalRevenue += item.totalPrice || (item.unitPrice * item.quantity);
            productSales[item.productId].salesCount += 1;
          });
        } else if (sale.productId) {
          // If sale is single product format
          if (!productSales[sale.productId]) {
            productSales[sale.productId] = {
              productId: sale.productId,
              productTitle: sale.productTitle || 'Unknown Product',
              totalQuantity: 0,
              totalRevenue: 0,
              salesCount: 0
            };
          }
          productSales[sale.productId].totalQuantity += sale.quantity || 0;
          productSales[sale.productId].totalRevenue += sale.revenue || sale.totalAmount || 0;
          productSales[sale.productId].salesCount += 1;
        }
      });

      // Convert to array and sort by total quantity sold
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      console.error('❌ Error getting top products:', error);
      throw new Error('Failed to get top products');
    }
  }

  /**
   * Record a simple sale (for testing)
   * @param {Object} saleData - Simple sale data
   * @returns {Promise<Object>} Created sale record
   */
  static async recordSale(saleData) {
    try {
      const saleRecord = {
        orderId: saleData.orderId,
        productId: saleData.productId,
        productTitle: saleData.productTitle,
        companyId: saleData.companyId,
        categoryId: saleData.categoryId,
        quantity: saleData.quantity || 1,
        unitPrice: saleData.unitPrice || saleData.revenue,
        revenue: saleData.revenue || saleData.totalAmount,
        totalAmount: saleData.totalAmount || saleData.revenue,
        customerEmail: saleData.customerEmail,
        customerName: saleData.customerName,
        saleDate: saleData.saleDate || new Date(),
        period: saleData.period || new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        status: 'completed'
      };

      const salesRef = collection(db, 'sales');
      const docRef = await addDoc(salesRef, saleRecord);

      console.log('✅ Sale recorded:', docRef.id);
      return { id: docRef.id, ...saleRecord };
    } catch (error) {
      console.error('❌ Error recording sale:', error);
      throw error;
    }
  }

  /**
   * Get sales summary for dashboard
   * @param {string} companyId - Optional company filter
   * @returns {Promise<Object>} Dashboard summary
   */
  static async getDashboardSummary(companyId = null) {
    try {
      const [todaysSales, weeklySales, monthlySales, topProducts] = await Promise.all([
        this.getTodaysSales(companyId),
        this.getWeeklySales(companyId),
        this.getMonthlySales(companyId),
        this.getTopProducts(companyId, 3)
      ]);

      return {
        today: todaysSales,
        week: weeklySales,
        month: monthlySales,
        topProducts,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('❌ Error getting dashboard summary:', error);
      throw new Error('Failed to get dashboard summary');
    }
  }
}

export default SimpleSalesAnalyticsService;