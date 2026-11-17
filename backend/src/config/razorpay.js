const Razorpay = require('razorpay');

let razorpayInstance = null;

/**
 * Returns a singleton Razorpay client instance configured with environment credentials
 */
const getRazorpayInstance = () => {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret) {
    console.warn('[Razorpay] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set in environment.');
  }

  if (!razorpayInstance || razorpayInstance.key_id !== keyId) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  return razorpayInstance;
};

module.exports = {
  getRazorpayInstance
};
