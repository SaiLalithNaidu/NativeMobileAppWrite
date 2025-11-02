/**
 * PDF Service
 * Handles PDF generation for order bills
 * 
 * Features:
 * - Generate HTML bill template
 * - Convert HTML to PDF
 * - Format currency and dates
 */

/**
 * Format currency to Indian Rupees
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('en-IN', options);
};

/**
 * Generate HTML content for bill PDF
 * @param {Object} orderData - Order data from billingService
 * @returns {string} HTML content
 */
export const generateBillHTML = (orderData) => {
  const { orderId, orderDate, customer, items, billing } = orderData;

  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice - ${orderId}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #ff6347;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          color: #ff6347;
          font-size: 32px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .order-info div {
          flex: 1;
        }
        .order-info h3 {
          margin: 0 0 10px 0;
          color: #ff6347;
          font-size: 14px;
          text-transform: uppercase;
        }
        .order-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background: #ff6347;
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-size: 14px;
        }
        th:nth-child(2), th:nth-child(3), th:nth-child(4) {
          text-align: center;
        }
        th:last-child {
          text-align: right;
        }
        td {
          font-size: 14px;
        }
        .summary {
          float: right;
          width: 300px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #ddd;
        }
        .summary-row:last-child {
          border-bottom: none;
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
          margin-top: 10px;
          padding-top: 15px;
          border-top: 2px solid #333;
        }
        .summary-label {
          color: #666;
        }
        .summary-value {
          font-weight: bold;
        }
        .footer {
          clear: both;
          margin-top: 50px;
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #eee;
          color: #999;
          font-size: 12px;
        }
        .savings {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          margin-top: 20px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>INVOICE</h1>
          <p>Thank you for your order!</p>
        </div>

        <!-- Order Info -->
        <div class="order-info">
          <div>
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Date:</strong> ${formatDate(orderDate)}</p>
            <p><strong>Status:</strong> ${orderData.status || 'Pending'}</p>
          </div>
          <div>
            <h3>Bill To</h3>
            <p><strong>${customer.name}</strong></p>
            ${customer.email ? `<p>${customer.email}</p>` : ''}
            ${customer.phone ? `<p>${customer.phone}</p>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- Summary -->
        <div class="summary">
          <div class="summary-row">
            <span class="summary-label">Subtotal (${billing.itemCount} items)</span>
            <span class="summary-value">${formatCurrency(billing.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">GST (${billing.gstRate}%)</span>
            <span class="summary-value">${formatCurrency(billing.gst)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Delivery Charges</span>
            <span class="summary-value">${billing.delivery === 0 ? 'FREE' : formatCurrency(billing.delivery)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Total Amount</span>
            <span class="summary-value">${formatCurrency(billing.total)}</span>
          </div>
        </div>

        ${billing.savings > 0 ? `
          <div class="savings">
            🎉 You saved ${formatCurrency(billing.savings)} on this order!
          </div>
        ` : ''}

        <!-- Footer -->
        <div class="footer">
          <p>This is a computer-generated invoice. No signature required.</p>
          <p>For any queries, please contact our support team.</p>
          <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Create PDF options for html-to-pdf
 * @param {string} orderId - Order ID for filename
 * @returns {Object} PDF options
 */
export const createPDFOptions = (orderId) => {
  return {
    fileName: `Invoice_${orderId}`,
    directory: 'Documents',
    base64: false,
    height: 842, // A4 height in points
    width: 595,  // A4 width in points
    padding: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20,
    },
  };
};

export default {
  formatCurrency,
  formatDate,
  generateBillHTML,
  createPDFOptions,
};
