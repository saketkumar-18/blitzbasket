/* API: Get Razorpay Key ID (publishable key - safe for frontend)
   Returns: { key_id: "rzp_test_..." }
*/
exports = async function (request, response) {
  // Razorpay Key ID is set via Vercel Dashboard → Settings → Environment Variables
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX';
  response.json({ key_id: keyId });
};