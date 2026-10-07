const STYLES = {
  'Order Placed': 'bg-oat-200 text-bark-700',
  Confirmed: 'bg-leaf-100 text-leaf-800',
  Processing: 'bg-turmeric-100 text-turmeric-700',
  Packed: 'bg-turmeric-100 text-turmeric-700',
  Shipped: 'bg-sky-100 text-sky-800',
  'Out for Delivery': 'bg-sky-100 text-sky-800',
  Delivered: 'bg-leaf-700 text-oat-50',
  Cancelled: 'bg-danger-50 text-danger-700',
  Pending: 'bg-turmeric-100 text-turmeric-700',
  Paid: 'bg-leaf-100 text-leaf-800',
  Failed: 'bg-danger-50 text-danger-700',
  Refunded: 'bg-oat-200 text-bark-700',
};

export default function StatusBadge({ status }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] || 'bg-oat-200 text-bark-700'}`}>{status}</span>;
}
