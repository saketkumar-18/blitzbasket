/* API: Verify Razorpay Payment Signature
   POST body: { "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }
   Returns: { status: "valid" } or { status: "invalid" }
*/
const crypto = require('crypto');

exports = async function (request, response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = request.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return response.status(400).json({ error: 'all params required' });
    }
    // Generate signature: sha256(order_id|payment_id) using key secret
    const sign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (sign === razorpay_signature) {
      response.json({ status: 'valid' });
    } else {
      response.json({ status: 'invalid' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    response.status(500).json({ error: err.message });
  }
};