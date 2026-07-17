import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderEmailItem = {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
};

type OrderEmailDetails = {
  userName?: string;
  orderId?: string;
  orderDate?: Date | string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatOrderDate(value?: Date | string) {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function buildOrderEmailHtml(orderItems: OrderEmailItem[], details: OrderEmailDetails = {}) {
  const rows = orderItems
    .map((item) => {
      const product = `${item.product_id} ${item.name}`;
      const lineTotal = item.quantity * item.price;

      return `
        <tr>
          <td style="border: 1px solid #e5e7eb; padding: 8px;">${escapeHtml(product)}</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <div>
      <p><strong>Order received from:</strong> ${escapeHtml(details.userName ?? 'Customer')}</p>
      <h2>Order: ${escapeHtml(details.orderId ?? '')} <span style="font-size: 16px; font-weight: normal;">${escapeHtml(formatOrderDate(details.orderDate))}</span></h2>
      <p>Thank you for your order. We have received the following items:</p>
      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Product</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">Quantity</th>
            <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

const sendEmail = async (
  to?: string,
  subject?: string,
  html?: string,
  orderItems: OrderEmailItem[] = [],
  orderDetails: OrderEmailDetails = {},
) => {
  const response = await resend.emails.send({
    from: 'orders@blueskypetsupply.com',
    to: to ?? 'joshgwilson1227@gmail.com', //placeholder, change to blue sky email
    subject: subject ?? 'Order Confirmation',
    html: html ?? buildOrderEmailHtml(orderItems, orderDetails),
  });

  return response;
}

export default sendEmail;