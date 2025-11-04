import { COLORS } from '../../src/utils/constants';

/**
 * Invoice Service
 * Generates branded invoice HTML used by orderDetail for PDF creation
 */

export const SHOP_CONFIG = {
	name: 'Ramesh Aqua',
	address: 'Shop Address Line 1, City, State - Pincode',
	phone: '+91 1234567890',
	email: 'rameshaqua@example.com',
	gstin: 'GSTIN1234567890',
};

export const generateInvoiceHTML = (orderData) => {
	const { orderId, orderDate, customer, items, billing, shop, payment } = orderData;
	const orderDateObj = orderDate?.toDate ? orderDate.toDate() : new Date(orderDate);

	const itemsHTML = items.map(item => `
			<tr>
				<td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title}</td>
				<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
				<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
				<td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
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
					body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
					.container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border: 2px solid ${COLORS.PRIMARY}; }
					.header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid ${COLORS.PRIMARY}; padding-bottom: 20px; }
					.shop-name { font-size: 36px; font-weight: bold; color: ${COLORS.PRIMARY_DARK}; margin: 0 0 10px 0; }
					.shop-details { font-size: 14px; color: #666; line-height: 1.6; }
					.invoice-title { font-size: 24px; color: ${COLORS.PRIMARY}; margin: 20px 0 10px 0; font-weight: bold; }
					.order-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
					table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
					th { background: ${COLORS.PRIMARY}; color: white; padding: 12px 10px; text-align: left; font-size: 14px; }
					td { font-size: 14px; }
					.summary { float: right; width: 350px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
					.summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
					.total-row { font-size: 18px; font-weight: bold; color: #333; margin-top: 10px; padding-top: 15px; border-top: 2px solid #333; }
					.payment-row { background: #e8f5e9; padding: 10px; margin-top: 5px; border-radius: 5px; }
					.payment-row.pending { background: #ffebee; }
					.paid-amount { color: ${COLORS.SUCCESS}; }
					.pending-amount { color: ${COLORS.ERROR}; }
					.footer { clear: both; margin-top: 50px; text-align: center; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1 class="shop-name">${shop?.name || SHOP_CONFIG.name}</h1>
						<div class="shop-details">
							<p>${shop?.address || SHOP_CONFIG.address}</p>
							<p>Phone: ${shop?.phone || SHOP_CONFIG.phone} | Email: ${shop?.email || SHOP_CONFIG.email}</p>
							${shop?.gstin || SHOP_CONFIG.gstin ? `<p>GSTIN: ${shop?.gstin || SHOP_CONFIG.gstin}</p>` : ''}
						</div>
						<h2 class="invoice-title">TAX INVOICE</h2>
					</div>

					<div class="order-info">
						<div>
							<h3>Order Details</h3>
							<p><strong>Order ID:</strong> ${orderId}</p>
							<p><strong>Date:</strong> ${orderDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
							<p><strong>Status:</strong> ${orderData.status || 'Pending'}</p>
						</div>
						<div>
							<h3>Bill To</h3>
							<p><strong>${customer?.name}</strong></p>
							${customer?.email ? `<p>${customer.email}</p>` : ''}
							${customer?.phone ? `<p>Phone: ${customer.phone}</p>` : ''}
						</div>
					</div>

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

					<div class="summary">
						<div class="summary-row">
							<span class="summary-label">Subtotal (${billing.itemCount} items)</span>
							<span class="summary-value">₹${billing.subtotal.toFixed(2)}</span>
						</div>
						<div class="summary-row">
							<span class="summary-label">GST (${billing.gstRate}%)</span>
							<span class="summary-value">₹${billing.gst.toFixed(2)}</span>
						</div>
						<div class="summary-row">
							<span class="summary-label">Delivery Charges</span>
							<span class="summary-value">${billing.delivery === 0 ? 'FREE' : '₹' + billing.delivery.toFixed(2)}</span>
						</div>
						<div class="summary-row total-row">
							<span class="summary-label">Total Amount</span>
							<span class="summary-value">₹${billing.total.toFixed(2)}</span>
						</div>

						<div class="summary-row payment-row">
							<span class="summary-label">Paid Amount</span>
							<span class="summary-value paid-amount">₹${(payment?.paidAmount || 0).toFixed(2)}</span>
						</div>
						${(payment?.pendingAmount || 0) > 0 ? `
							<div class="summary-row payment-row pending">
								<span class="summary-label">Pending Amount</span>
								<span class="summary-value pending-amount">₹${(payment.pendingAmount).toFixed(2)}</span>
							</div>
						` : ''}
					</div>

					${billing.savings > 0 ? `
						<div class="savings">
							🎉 You saved ₹${billing.savings.toFixed(2)} on this order!
						</div>
					` : ''}

					<div class="footer">
						<p><strong>Thank you for your business!</strong></p>
						<p>This is a computer-generated invoice. No signature required.</p>
						<p>For any queries, please contact: ${shop?.phone || SHOP_CONFIG.phone}</p>
						<p>&copy; ${new Date().getFullYear()} ${shop?.name || SHOP_CONFIG.name}. All rights reserved.</p>
					</div>
				</div>
			</body>
			</html>
		`;
};

export default {
	SHOP_CONFIG,
	generateInvoiceHTML,
};
