const StoreSettings = require('../models/StoreSettings');

// Regional Pincode Prefix Dictionary for Indian States & Major Hubs
const PINCODE_PREFIX_MAP = [
  { prefix: '11', city: 'Delhi / NCR', state: 'Delhi', days: 1 },
  { prefix: '12', city: 'Gurugram / Faridabad', state: 'Haryana', days: 1 },
  { prefix: '13', city: 'Ambala / Karnal', state: 'Haryana', days: 2 },
  { prefix: '20', city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', days: 1 },
  { prefix: '14', city: 'Ludhiana / Jalandhar', state: 'Punjab', days: 2 },
  { prefix: '15', city: 'Bathinda / Patiala', state: 'Punjab', days: 3 },
  { prefix: '16', city: 'Chandigarh / Mohali', state: 'Chandigarh', days: 2 },
  { prefix: '40', city: 'Mumbai / Thane', state: 'Maharashtra', days: 2 },
  { prefix: '41', city: 'Pune / Nashik', state: 'Maharashtra', days: 2 },
  { prefix: '42', city: 'Aurangabad / Jalgaon', state: 'Maharashtra', days: 3 },
  { prefix: '56', city: 'Bengaluru Urban', state: 'Karnataka', days: 2 },
  { prefix: '57', city: 'Mangalore / Hubli', state: 'Karnataka', days: 3 },
  { prefix: '60', city: 'Chennai Metropolitan', state: 'Tamil Nadu', days: 2 },
  { prefix: '64', city: 'Coimbatore / Tirupur', state: 'Tamil Nadu', days: 3 },
  { prefix: '50', city: 'Hyderabad / Secunderabad', state: 'Telangana', days: 2 },
  { prefix: '70', city: 'Kolkata Metropolitan', state: 'West Bengal', days: 2 },
  { prefix: '38', city: 'Ahmedabad / Gandhinagar', state: 'Gujarat', days: 2 },
  { prefix: '39', city: 'Surat / Vadodara', state: 'Gujarat', days: 2 },
  { prefix: '30', city: 'Jaipur Metropolitan', state: 'Rajasthan', days: 2 },
  { prefix: '46', city: 'Bhopal', state: 'Madhya Pradesh', days: 3 },
  { prefix: '45', city: 'Indore', state: 'Madhya Pradesh', days: 3 },
  { prefix: '80', city: 'Patna', state: 'Bihar', days: 3 },
  { prefix: '75', city: 'Bhubaneswar / Cuttack', state: 'Odisha', days: 3 },
  { prefix: '78', city: 'Guwahati', state: 'Assam', days: 4 },
  { prefix: '68', city: 'Kochi / Ernakulam', state: 'Kerala', days: 3 },
  { prefix: '69', city: 'Thiruvananthapuram', state: 'Kerala', days: 3 },
  { prefix: '22', city: 'Lucknow / Kanpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '24', city: 'Dehradun / Haridwar', state: 'Uttarakhand', days: 2 }
];

/**
 * Format dynamic delivery date string from days offset
 */
const getFormattedDeliveryDate = (daysOffset) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);

  // If landing on Sunday, add 1 extra day for standard courier rest
  if (d.getDay() === 0) {
    d.setDate(d.getDate() + 1);
  }

  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const formatted = d.toLocaleDateString('en-IN', options);

  let badge = '';
  if (daysOffset <= 1) {
    badge = 'Tomorrow, by 5:00 PM';
  } else if (daysOffset === 2) {
    badge = `In 2 Days (${formatted})`;
  } else {
    badge = `By ${formatted}`;
  }

  return {
    date: d.toISOString(),
    displayDate: formatted,
    badge
  };
};

/**
 * GET /api/v1/delivery/settings
 * Public endpoint to fetch store delivery rules
 */
const getDeliverySettings = async (req, res, next) => {
  try {
    const settings = await StoreSettings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        freeShippingThreshold: Number(settings.freeShippingThreshold) || 499,
        standardDeliveryFee: Number(settings.standardDeliveryFee) || 49,
        expressDeliveryFee: 79,
        codAvailable: true,
        estimatedDaysDefault: 3
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/delivery/estimate
 * Dynamically check pincode serviceability, city, estimated date, and shipping fee
 */
const estimateDelivery = async (req, res, next) => {
  try {
    const { pincode = '', subtotal = 0 } = req.query;
    const cleanPin = String(pincode).trim();

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }

    const settings = await StoreSettings.getSettings();
    const threshold = Number(settings.freeShippingThreshold) || 499;
    const standardFee = Number(settings.standardDeliveryFee) || 49;
    const orderSubtotal = Math.max(0, Number(subtotal) || 0);

    // Identify region by first 2 digits
    const prefix = cleanPin.slice(0, 2);
    const match = PINCODE_PREFIX_MAP.find((m) => m.prefix === prefix);

    const city = match ? match.city : 'Pan-India';
    const state = match ? match.state : 'India';
    const days = match ? match.days : 4;

    const deliveryTime = getFormattedDeliveryDate(days);
    const isFree = orderSubtotal >= threshold;
    const deliveryFee = isFree ? 0 : standardFee;
    const amountNeeded = Math.max(0, threshold - orderSubtotal);

    res.status(200).json({
      success: true,
      serviceable: true,
      pincode: cleanPin,
      city,
      state,
      estimatedDays: days,
      deliveryDate: deliveryTime.displayDate,
      deliveryBadge: deliveryTime.badge,
      deliveryFee,
      standardFee,
      isFreeDelivery: isFree,
      freeShippingThreshold: threshold,
      amountNeededForFreeDelivery: amountNeeded,
      codAvailable: true,
      message: `Delivery available to ${city} (${cleanPin})`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliverySettings,
  estimateDelivery
};
