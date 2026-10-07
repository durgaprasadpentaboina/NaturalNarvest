/**
 * Payment gateway adapter.
 *
 * Orders talk only to this module, so wiring in Razorpay or Stripe later means
 * implementing `createPayment` and `verifyPayment` for a provider and nothing else.
 *
 * Razorpay sketch:
 *   const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
 *   const rzpOrder = await rzp.orders.create({ amount: order.total * 100, currency: 'INR', receipt: order.orderNumber });
 *   return { provider: 'razorpay', reference: rzpOrder.id, status: 'Pending', clientPayload: { key: process.env.RAZORPAY_KEY_ID, orderId: rzpOrder.id } };
 *
 * Stripe sketch:
 *   const intent = await stripe.paymentIntents.create({ amount: order.total * 100, currency: 'inr', metadata: { orderId: String(order._id) } });
 *   return { provider: 'stripe', reference: intent.id, status: 'Pending', clientPayload: { clientSecret: intent.client_secret } };
 */
export async function createPayment(order, method) {
  if (method === 'cod') return { provider: 'cod', reference: null, status: 'Pending', clientPayload: null };
  // Online placeholder: no provider is connected yet, so the payment stays Pending
  // until an admin marks it paid (PUT /api/orders/:id/payment).
  return { provider: 'placeholder', reference: null, status: 'Pending', clientPayload: null };
}

export async function verifyPayment(/* order, payload */) {
  return { verified: false, reason: 'No online payment provider is configured yet.' };
}
