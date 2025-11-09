/**
 * Sales Data Seeder
 * Utility to populate sample sales data for testing analytics
 */

import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export class SalesDataSeeder {
  /**
   * Create sample sales data for the last 30 days
   * @param {string} companyId - Company ID to create sales for
   * @returns {Promise<void>}
   */
  static async seedSalesData(companyId = null) {
    try {
      console.log('🌱 Starting sales data seeding...');

      // Get companies if companyId not provided
      let companies = [];
      if (companyId) {
        companies = [{ id: companyId, name: 'Selected Company' }];
      } else {
        const companiesRef = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesRef);
        companies = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown Company'
        }));
      }

      // Get products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (products.length === 0) {
        console.warn('⚠️ No products found, cannot seed sales data');
        return;
      }

      const salesRef = collection(db, 'sales');
      let totalSalesCreated = 0;

      // Create sales for the last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Create 2-8 sales per day
        const salesPerDay = Math.floor(Math.random() * 7) + 2;

        for (let j = 0; j < salesPerDay; j++) {
          const company = companies[Math.floor(Math.random() * companies.length)];
          
          // Filter products for this company if possible
          const companyProducts = products.filter(p => p.companyId === company.id);
          const availableProducts = companyProducts.length > 0 ? companyProducts : products;
          
          const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
          const unitPrice = product.price || (Math.floor(Math.random() * 500) + 50);
          const revenue = quantity * unitPrice;

          // Random hour in the day
          const saleDate = new Date(date);
          saleDate.setHours(Math.floor(Math.random() * 16) + 8); // 8 AM to 11 PM
          saleDate.setMinutes(Math.floor(Math.random() * 60));

          const saleRecord = {
            orderId: `SEED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            productTitle: product.title || `Product ${product.id}`,
            companyId: company.id,
            categoryId: product.categoryId || 'unknown',
            quantity: quantity,
            unitPrice: unitPrice,
            revenue: revenue,
            totalAmount: revenue,
            customerEmail: `customer${Math.floor(Math.random() * 100)}@example.com`,
            customerName: `Customer ${Math.floor(Math.random() * 100)}`,
            saleDate: saleDate,
            period: saleDate.toISOString().split('T')[0],
            status: 'completed',
            createdAt: saleDate,
            items: [{
              productId: product.id,
              productTitle: product.title || `Product ${product.id}`,
              quantity: quantity,
              unitPrice: unitPrice,
              totalPrice: revenue
            }]
          };

          await addDoc(salesRef, saleRecord);
          totalSalesCreated++;
        }
      }

      console.log(`✅ Sales data seeding completed! Created ${totalSalesCreated} sales records`);
      return {
        success: true,
        salesCreated: totalSalesCreated,
        companies: companies.length,
        products: products.length
      };

    } catch (error) {
      console.error('❌ Error seeding sales data:', error);
      throw new Error('Failed to seed sales data');
    }
  }

  /**
   * Clear all sales data (for testing)
   * @returns {Promise<void>}
   */
  static async clearSalesData() {
    try {
      console.log('🗑️ Clearing all sales data...');
      
      const salesRef = collection(db, 'sales');
      const salesSnapshot = await getDocs(salesRef);
      
      const deletePromises = salesSnapshot.docs.map(doc => doc.ref.delete());
      await Promise.all(deletePromises);
      
      console.log(`✅ Cleared ${salesSnapshot.docs.length} sales records`);
      return salesSnapshot.docs.length;
    } catch (error) {
      console.error('❌ Error clearing sales data:', error);
      throw new Error('Failed to clear sales data');
    }
  }

  /**
   * Seed realistic sales data with trends
   * @param {string} companyId - Optional company ID
   * @returns {Promise<void>}
   */
  static async seedRealisticSalesData(companyId = null) {
    try {
      console.log('🌱 Creating realistic sales data with trends...');

      // Get companies
      let companies = [];
      if (companyId) {
        companies = [{ id: companyId, name: 'Selected Company' }];
      } else {
        const companiesRef = collection(db, 'companies');
        const companiesSnapshot = await getDocs(companiesRef);
        companies = companiesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Unknown Company'
        }));
      }

      // Get products
      const productsRef = collection(db, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const salesRef = collection(db, 'sales');
      let totalSalesCreated = 0;

      // Create 3 months of data with realistic patterns
      for (let month = 0; month < 3; month++) {
        for (let day = 0; day < 30; day++) {
          const date = new Date();
          date.setMonth(date.getMonth() - month);
          date.setDate(date.getDate() - day);

          // Weekend vs weekday patterns
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const baseSalesPerDay = isWeekend ? 3 : 8;
          
          // Add some randomness
          const salesPerDay = Math.max(1, baseSalesPerDay + Math.floor(Math.random() * 5) - 2);

          for (let sale = 0; sale < salesPerDay; sale++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const companyProducts = products.filter(p => p.companyId === company.id);
            const availableProducts = companyProducts.length > 0 ? companyProducts : products;
            
            // Pick 1-3 products per order
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let orderTotal = 0;

            for (let item = 0; item < itemCount; item++) {
              const product = availableProducts[Math.floor(Math.random() * availableProducts.length)];
              const quantity = Math.floor(Math.random() * 3) + 1;
              const unitPrice = product.price || (Math.floor(Math.random() * 300) + 50);
              const totalPrice = quantity * unitPrice;

              orderItems.push({
                productId: product.id,
                productTitle: product.title || `Product ${product.id}`,
                quantity: quantity,
                unitPrice: unitPrice,
                totalPrice: totalPrice
              });

              orderTotal += totalPrice;
            }

            // Business hours (9 AM - 8 PM)
            const saleDate = new Date(date);
            saleDate.setHours(Math.floor(Math.random() * 11) + 9);
            saleDate.setMinutes(Math.floor(Math.random() * 60));

            const saleRecord = {
              orderId: `REALISTIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              companyId: company.id,
              revenue: orderTotal,
              totalAmount: orderTotal,
              customerEmail: `customer${Math.floor(Math.random() * 200)}@example.com`,
              customerName: `Customer ${Math.floor(Math.random() * 200) + 1}`,
              saleDate: saleDate,
              period: saleDate.toISOString().split('T')[0],
              status: 'completed',
              createdAt: saleDate,
              items: orderItems
            };

            await addDoc(salesRef, saleRecord);
            totalSalesCreated++;
          }
        }
      }

      console.log(`✅ Realistic sales data created! Generated ${totalSalesCreated} sales records over 3 months`);
      return {
        success: true,
        salesCreated: totalSalesCreated,
        months: 3,
        companies: companies.length
      };

    } catch (error) {
      console.error('❌ Error creating realistic sales data:', error);
      throw new Error('Failed to create realistic sales data');
    }
  }
}

export default SalesDataSeeder;