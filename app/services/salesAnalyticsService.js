/**
 * Sales Analytics Service
 * Handles sales tracking, reporting, and analytics for business insights
 * 
 * Features:
 * - Track sales by day, week, month, year
 * - Product performance analytics
 * - Revenue tracking and reporting
 * - Customer analytics
 * - Export reports functionality
 */

import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class SalesAnalyticsService {
  /**
   * Record a sale transaction
   * @param {Object} saleData - Sale transaction data
   * @returns {Promise<Object>} Sale record
   */
  static async recordSale(saleData) {
    try {
      const saleRecord = {
        orderId: saleData.orderId,
        customerId: saleData.customerId,
        customerEmail: saleData.customerEmail,
        companyId: saleData.companyId,
        items: saleData.items.map(item => ({
          productId: item.productId,
          productTitle: item.title,
          categoryId: item.categoryId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        subtotal: saleData.subtotal,
        gst: saleData.gst,
        deliveryCharges: saleData.deliveryCharges,
        totalAmount: saleData.totalAmount,
        paymentMethod: saleData.paymentMethod || 'cash',
        status: saleData.status || 'completed',
        saleDate: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const salesRef = collection(db, 'sales');
      const docRef = await addDoc(salesRef, saleRecord);

      console.log('✅ Sale recorded:', docRef.id);
      return { id: docRef.id, ...saleRecord };
    } catch (error) {
      console.error('❌ Error recording sale:', error);
      throw new Error('Failed to record sale');
    }
  }

  /**
   * Get sales data for a specific time period
   * @param {string} companyId - Company ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of sales records
   */
  static async getSalesByDateRange(companyId, startDate, endDate) {
    try {
      const salesRef = collection(db, 'sales');
      const q = query(
        salesRef,
        where('companyId', '==', companyId),
        where('saleDate', '>=', startDate),
        where('saleDate', '<=', endDate),
        orderBy('saleDate', 'desc')
      );

      const snapshot = await getDocs(q);
      const sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        saleDate: doc.data().saleDate?.toDate()
      }));

      console.log(`✅ Sales fetched for date range: ${sales.length} records`);
      return sales;
    } catch (error) {
      console.error('❌ Error fetching sales by date range:', error);
      throw new Error('Failed to fetch sales data');
    }
  }

  /**
   * Get daily sales report
   * @param {string} companyId - Company ID
   * @param {Date} date - Specific date (default: today)
   * @returns {Promise<Object>} Daily sales summary
   */
  static async getDailySales(companyId, date = new Date()) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sales = await this.getSalesByDateRange(companyId, startOfDay, endOfDay);
      
      const summary = {
        date: date.toISOString().split('T')[0],
        totalOrders: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        avgOrderValue: sales.length > 0 ? 
          sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / sales.length : 0,
        topProducts: this.getTopProducts(sales),
        hourlyBreakdown: this.getHourlyBreakdown(sales)
      };

      console.log('✅ Daily sales summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Error getting daily sales:', error);
      throw new Error('Failed to get daily sales');
    }
  }

  /**
   * Get weekly sales report
   * @param {string} companyId - Company ID
   * @param {Date} weekStart - Start of week (default: current week)
   * @returns {Promise<Object>} Weekly sales summary
   */
  static async getWeeklySales(companyId, weekStart = null) {
    try {
      if (!weekStart) {
        const today = new Date();
        const dayOfWeek = today.getDay();
        weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
      }
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const sales = await this.getSalesByDateRange(companyId, weekStart, weekEnd);
      
      const summary = {
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        totalOrders: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        avgDailyRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / 7,
        dailyBreakdown: this.getDailyBreakdown(sales, weekStart),
        topProducts: this.getTopProducts(sales),
        customerAnalytics: this.getCustomerAnalytics(sales)
      };

      console.log('✅ Weekly sales summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Error getting weekly sales:', error);
      throw new Error('Failed to get weekly sales');
    }
  }

  /**
   * Get monthly sales report
   * @param {string} companyId - Company ID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Monthly sales summary
   */
  static async getMonthlySales(companyId, year = null, month = null) {
    try {
      const now = new Date();
      if (!year) year = now.getFullYear();
      if (!month) month = now.getMonth() + 1;

      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      const sales = await this.getSalesByDateRange(companyId, monthStart, monthEnd);
      
      const summary = {
        year,
        month,
        monthName: monthStart.toLocaleString('en-US', { month: 'long' }),
        totalOrders: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        avgDailyRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / monthEnd.getDate(),
        weeklyBreakdown: this.getWeeklyBreakdown(sales, monthStart),
        topProducts: this.getTopProducts(sales),
        categoryPerformance: this.getCategoryPerformance(sales),
        customerAnalytics: this.getCustomerAnalytics(sales),
        growth: await this.getMonthlyGrowth(companyId, year, month)
      };

      console.log('✅ Monthly sales summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Error getting monthly sales:', error);
      throw new Error('Failed to get monthly sales');
    }
  }

  /**
   * Get yearly sales report
   * @param {string} companyId - Company ID
   * @param {number} year - Year (default: current year)
   * @returns {Promise<Object>} Yearly sales summary
   */
  static async getYearlySales(companyId, year = null) {
    try {
      if (!year) year = new Date().getFullYear();

      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

      const sales = await this.getSalesByDateRange(companyId, yearStart, yearEnd);
      
      const summary = {
        year,
        totalOrders: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        totalItems: sales.reduce((sum, sale) => 
          sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        ),
        avgMonthlyRevenue: sales.reduce((sum, sale) => sum + sale.totalAmount, 0) / 12,
        monthlyBreakdown: this.getMonthlyBreakdown(sales),
        quarterlyBreakdown: this.getQuarterlyBreakdown(sales),
        topProducts: this.getTopProducts(sales),
        categoryPerformance: this.getCategoryPerformance(sales),
        customerAnalytics: this.getCustomerAnalytics(sales),
        seasonalTrends: this.getSeasonalTrends(sales),
        yearOverYearGrowth: await this.getYearOverYearGrowth(companyId, year)
      };

      console.log('✅ Yearly sales summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Error getting yearly sales:', error);
      throw new Error('Failed to get yearly sales');
    }
  }

  /**
   * Get top selling products
   * @param {Array} sales - Sales data
   * @param {number} limit - Number of top products to return
   * @returns {Array} Top products array
   */
  static getTopProducts(sales, limit = 10) {
    const productSales = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productTitle: item.productTitle,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        
        productSales[item.productId].totalQuantity += item.quantity;
        productSales[item.productId].totalRevenue += item.totalPrice;
        productSales[item.productId].orderCount += 1;
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  /**
   * Get hourly sales breakdown
   * @param {Array} sales - Sales data
   * @returns {Array} Hourly breakdown
   */
  static getHourlyBreakdown(sales) {
    const hourlyData = Array(24).fill(0).map((_, hour) => ({
      hour,
      orders: 0,
      revenue: 0
    }));

    sales.forEach(sale => {
      if (sale.saleDate) {
        const hour = sale.saleDate.getHours();
        hourlyData[hour].orders += 1;
        hourlyData[hour].revenue += sale.totalAmount;
      }
    });

    return hourlyData;
  }

  /**
   * Get daily breakdown for a week
   * @param {Array} sales - Sales data
   * @param {Date} weekStart - Start of week
   * @returns {Array} Daily breakdown
   */
  static getDailyBreakdown(sales, weekStart) {
    const dailyData = Array(7).fill(0).map((_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: 0,
        revenue: 0
      };
    });

    sales.forEach(sale => {
      if (sale.saleDate) {
        const dayIndex = Math.floor((sale.saleDate - weekStart) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 7) {
          dailyData[dayIndex].orders += 1;
          dailyData[dayIndex].revenue += sale.totalAmount;
        }
      }
    });

    return dailyData;
  }

  /**
   * Get weekly breakdown for a month
   * @param {Array} sales - Sales data
   * @param {Date} monthStart - Start of month
   * @returns {Array} Weekly breakdown
   */
  static getWeeklyBreakdown(sales, monthStart) {
    const weeks = [];
    let currentWeekStart = new Date(monthStart);
    
    // Adjust to start of week (Sunday)
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    for (let week = 0; week < 5; week++) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      
      weeks.push({
        week: week + 1,
        startDate: currentWeekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        orders: 0,
        revenue: 0
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    sales.forEach(sale => {
      if (sale.saleDate) {
        const weekIndex = Math.floor((sale.saleDate - monthStart) / (1000 * 60 * 60 * 24 * 7));
        if (weekIndex >= 0 && weekIndex < weeks.length) {
          weeks[weekIndex].orders += 1;
          weeks[weekIndex].revenue += sale.totalAmount;
        }
      }
    });

    return weeks;
  }

  /**
   * Get monthly breakdown for a year
   * @param {Array} sales - Sales data
   * @returns {Array} Monthly breakdown
   */
  static getMonthlyBreakdown(sales) {
    const monthlyData = Array(12).fill(0).map((_, month) => ({
      month: month + 1,
      monthName: new Date(0, month).toLocaleString('en-US', { month: 'long' }),
      orders: 0,
      revenue: 0
    }));

    sales.forEach(sale => {
      if (sale.saleDate) {
        const month = sale.saleDate.getMonth();
        monthlyData[month].orders += 1;
        monthlyData[month].revenue += sale.totalAmount;
      }
    });

    return monthlyData;
  }

  /**
   * Get quarterly breakdown
   * @param {Array} sales - Sales data
   * @returns {Array} Quarterly breakdown
   */
  static getQuarterlyBreakdown(sales) {
    const quarterlyData = [
      { quarter: 1, name: 'Q1 (Jan-Mar)', orders: 0, revenue: 0 },
      { quarter: 2, name: 'Q2 (Apr-Jun)', orders: 0, revenue: 0 },
      { quarter: 3, name: 'Q3 (Jul-Sep)', orders: 0, revenue: 0 },
      { quarter: 4, name: 'Q4 (Oct-Dec)', orders: 0, revenue: 0 }
    ];

    sales.forEach(sale => {
      if (sale.saleDate) {
        const quarter = Math.floor(sale.saleDate.getMonth() / 3);
        quarterlyData[quarter].orders += 1;
        quarterlyData[quarter].revenue += sale.totalAmount;
      }
    });

    return quarterlyData;
  }

  /**
   * Get category performance analytics
   * @param {Array} sales - Sales data
   * @returns {Array} Category performance
   */
  static getCategoryPerformance(sales) {
    const categoryData = {};

    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!categoryData[item.categoryId]) {
          categoryData[item.categoryId] = {
            categoryId: item.categoryId,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }
        
        categoryData[item.categoryId].totalQuantity += item.quantity;
        categoryData[item.categoryId].totalRevenue += item.totalPrice;
        categoryData[item.categoryId].orderCount += 1;
      });
    });

    return Object.values(categoryData)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get customer analytics
   * @param {Array} sales - Sales data
   * @returns {Object} Customer analytics
   */
  static getCustomerAnalytics(sales) {
    const uniqueCustomers = new Set(sales.map(sale => sale.customerId)).size;
    const returningCustomers = this.getReturningCustomers(sales);
    
    return {
      totalCustomers: uniqueCustomers,
      returningCustomers: returningCustomers.length,
      newCustomers: uniqueCustomers - returningCustomers.length,
      avgOrdersPerCustomer: sales.length / uniqueCustomers || 0,
      customerRetentionRate: (returningCustomers.length / uniqueCustomers) * 100 || 0
    };
  }

  /**
   * Get returning customers
   * @param {Array} sales - Sales data
   * @returns {Array} Returning customers
   */
  static getReturningCustomers(sales) {
    const customerOrders = {};
    
    sales.forEach(sale => {
      if (!customerOrders[sale.customerId]) {
        customerOrders[sale.customerId] = 0;
      }
      customerOrders[sale.customerId] += 1;
    });

    return Object.entries(customerOrders)
      .filter(([_, orderCount]) => orderCount > 1)
      .map(([customerId, orderCount]) => ({ customerId, orderCount }));
  }

  /**
   * Get seasonal trends
   * @param {Array} sales - Sales data
   * @returns {Array} Seasonal trends
   */
  static getSeasonalTrends(sales) {
    const seasons = [
      { name: 'Winter', months: [11, 0, 1], orders: 0, revenue: 0 },
      { name: 'Spring', months: [2, 3, 4], orders: 0, revenue: 0 },
      { name: 'Summer', months: [5, 6, 7], orders: 0, revenue: 0 },
      { name: 'Fall', months: [8, 9, 10], orders: 0, revenue: 0 }
    ];

    sales.forEach(sale => {
      if (sale.saleDate) {
        const month = sale.saleDate.getMonth();
        const season = seasons.find(s => s.months.includes(month));
        if (season) {
          season.orders += 1;
          season.revenue += sale.totalAmount;
        }
      }
    });

    return seasons;
  }

  /**
   * Get monthly growth compared to previous month
   * @param {string} companyId - Company ID
   * @param {number} year - Current year
   * @param {number} month - Current month
   * @returns {Promise<Object>} Growth metrics
   */
  static async getMonthlyGrowth(companyId, year, month) {
    try {
      let prevYear = year;
      let prevMonth = month - 1;
      
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
      }

      const prevMonthlySales = await this.getMonthlySales(companyId, prevYear, prevMonth);
      const currentRevenue = await this.getMonthlySales(companyId, year, month).then(data => data.totalRevenue);
      
      const revenueGrowth = prevMonthlySales.totalRevenue > 0 
        ? ((currentRevenue - prevMonthlySales.totalRevenue) / prevMonthlySales.totalRevenue) * 100
        : 0;

      return {
        previousMonth: {
          year: prevYear,
          month: prevMonth,
          revenue: prevMonthlySales.totalRevenue
        },
        currentMonth: {
          year,
          month,
          revenue: currentRevenue
        },
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        isPositiveGrowth: revenueGrowth > 0
      };
    } catch (error) {
      console.error('❌ Error calculating monthly growth:', error);
      return { revenueGrowth: 0, isPositiveGrowth: false };
    }
  }

  /**
   * Get year-over-year growth
   * @param {string} companyId - Company ID
   * @param {number} year - Current year
   * @returns {Promise<Object>} Year-over-year growth
   */
  static async getYearOverYearGrowth(companyId, year) {
    try {
      const prevYearSales = await this.getYearlySales(companyId, year - 1);
      const currentYearSales = await this.getYearlySales(companyId, year);
      
      const revenueGrowth = prevYearSales.totalRevenue > 0 
        ? ((currentYearSales.totalRevenue - prevYearSales.totalRevenue) / prevYearSales.totalRevenue) * 100
        : 0;

      return {
        previousYear: {
          year: year - 1,
          revenue: prevYearSales.totalRevenue
        },
        currentYear: {
          year,
          revenue: currentYearSales.totalRevenue
        },
        revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
        isPositiveGrowth: revenueGrowth > 0
      };
    } catch (error) {
      console.error('❌ Error calculating year-over-year growth:', error);
      return { revenueGrowth: 0, isPositiveGrowth: false };
    }
  }

  /**
   * Export sales report as JSON
   * @param {Object} reportData - Report data to export
   * @param {string} reportType - Type of report (daily, weekly, monthly, yearly)
   * @returns {string} JSON string
   */
  static exportReport(reportData, reportType) {
    const exportData = {
      reportType,
      generatedAt: new Date().toISOString(),
      companyName: 'Ramesh Aqua', // Could be dynamic
      ...reportData
    };

    return JSON.stringify(exportData, null, 2);
  }
}

export default SalesAnalyticsService;