/* API: Create Razorpay Order
   POST body: { "amount": 151, "receipt": "order_rcptid_1" }
   Returns: Razorpay Order object
*/
require('dotenv').config();
const razorpay = require('razorpay');

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports = async function (request, response) {
  try {
    const { amount, receipt } = request.body;
    if (!amount) {
      return response.status(400).json({ error: 'amount required' });
    }
    const options = {
      amount: Number(amount) * 100, // paise
      currency: 'INR',
      receipt: receipt || 'receipt_order_' + Date.now(),
      payment_capture: 1, // auto capture
    };
    const order = await instance.orders.create(options);
    response.set('Access-Control-Allow-Origin', '*');
    response.json(order);
  } catch (err) {
    console.error('Razorpay create-order error:', err);
    response.status(500).json({ error: err.message });
  }
};