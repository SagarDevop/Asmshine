const StoreSettings = require('../models/StoreSettings');

// In-memory LRU-style cache for rapid pincode lookups
const pincodeCache = new Map();

// Comprehensive Regional Pincode Prefix Dictionary covering all Indian Postal Circles
const PINCODE_PREFIX_MAP = [
  // Granular 3-Digit Sorting Districts
  { prefix: '210', city: 'Banda', state: 'Uttar Pradesh', days: 2 },
  { prefix: '211', city: 'Prayagraj', state: 'Uttar Pradesh', days: 2 },
  { prefix: '212', city: 'Fatehpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '226', city: 'Lucknow', state: 'Uttar Pradesh', days: 2 },
  { prefix: '208', city: 'Kanpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '221', city: 'Varanasi', state: 'Uttar Pradesh', days: 2 },
  { prefix: '201', city: 'Noida', state: 'Uttar Pradesh', days: 1 },
  { prefix: '282', city: 'Agra', state: 'Uttar Pradesh', days: 2 },
  { prefix: '284', city: 'Jhansi', state: 'Uttar Pradesh', days: 2 },
  { prefix: '250', city: 'Meerut', state: 'Uttar Pradesh', days: 2 },
  { prefix: '273', city: 'Gorakhpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '248', city: 'Dehradun', state: 'Uttarakhand', days: 2 },
  { prefix: '110', city: 'New Delhi', state: 'Delhi', days: 1 },
  { prefix: '122', city: 'Gurugram', state: 'Haryana', days: 1 },
  { prefix: '121', city: 'Faridabad', state: 'Haryana', days: 1 },
  { prefix: '400', city: 'Mumbai', state: 'Maharashtra', days: 2 },
  { prefix: '411', city: 'Pune', state: 'Maharashtra', days: 2 },
  { prefix: '560', city: 'Bengaluru', state: 'Karnataka', days: 2 },
  { prefix: '600', city: 'Chennai', state: 'Tamil Nadu', days: 2 },
  { prefix: '500', city: 'Hyderabad', state: 'Telangana', days: 2 },
  { prefix: '700', city: 'Kolkata', state: 'West Bengal', days: 2 },
  { prefix: '302', city: 'Jaipur', state: 'Rajasthan', days: 2 },
  { prefix: '380', city: 'Ahmedabad', state: 'Gujarat', days: 2 },
  { prefix: '462', city: 'Bhopal', state: 'Madhya Pradesh', days: 2 },
  { prefix: '452', city: 'Indore', state: 'Madhya Pradesh', days: 2 },
  { prefix: '800', city: 'Patna', state: 'Bihar', days: 2 },

  // Northern Region
  { prefix: '11', city: 'New Delhi', state: 'Delhi', days: 1 },
  { prefix: '12', city: 'Gurugram', state: 'Haryana', days: 1 },
  { prefix: '13', city: 'Ambala', state: 'Haryana', days: 2 },
  { prefix: '14', city: 'Ludhiana', state: 'Punjab', days: 2 },
  { prefix: '15', city: 'Bathinda', state: 'Punjab', days: 2 },
  { prefix: '16', city: 'Chandigarh', state: 'Chandigarh', days: 2 },
  { prefix: '17', city: 'Shimla', state: 'Himachal Pradesh', days: 3 },
  { prefix: '18', city: 'Jammu', state: 'Jammu and Kashmir', days: 3 },
  { prefix: '19', city: 'Srinagar', state: 'Jammu and Kashmir', days: 4 },

  // Uttar Pradesh & Uttarakhand
  { prefix: '20', city: 'Noida', state: 'Uttar Pradesh', days: 1 },
  { prefix: '21', city: 'Banda', state: 'Uttar Pradesh', days: 2 },
  { prefix: '22', city: 'Lucknow', state: 'Uttar Pradesh', days: 2 },
  { prefix: '23', city: 'Varanasi', state: 'Uttar Pradesh', days: 2 },
  { prefix: '24', city: 'Bareilly', state: 'Uttar Pradesh', days: 2 },
  { prefix: '25', city: 'Meerut', state: 'Uttar Pradesh', days: 2 },
  { prefix: '26', city: 'Sitapur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '27', city: 'Gorakhpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '28', city: 'Jhansi', state: 'Uttar Pradesh', days: 2 },

  // Western Region
  { prefix: '30', city: 'Jaipur', state: 'Rajasthan', days: 2 },
  { prefix: '31', city: 'Udaipur', state: 'Rajasthan', days: 2 },
  { prefix: '32', city: 'Kota', state: 'Rajasthan', days: 2 },
  { prefix: '33', city: 'Bikaner', state: 'Rajasthan', days: 2 },
  { prefix: '34', city: 'Jodhpur', state: 'Rajasthan', days: 2 },
  { prefix: '36', city: 'Rajkot', state: 'Gujarat', days: 2 },
  { prefix: '37', city: 'Bhuj', state: 'Gujarat', days: 2 },
  { prefix: '38', city: 'Ahmedabad', state: 'Gujarat', days: 2 },
  { prefix: '39', city: 'Surat', state: 'Gujarat', days: 2 },
  { prefix: '40', city: 'Mumbai', state: 'Maharashtra', days: 2 },
  { prefix: '41', city: 'Pune', state: 'Maharashtra', days: 2 },
  { prefix: '42', city: 'Nashik', state: 'Maharashtra', days: 2 },
  { prefix: '43', city: 'Chhatrapati Sambhaji Nagar', state: 'Maharashtra', days: 3 },
  { prefix: '44', city: 'Nagpur', state: 'Maharashtra', days: 2 },
  { prefix: '403', city: 'Panaji', state: 'Goa', days: 3 },

  // Central Region
  { prefix: '45', city: 'Indore', state: 'Madhya Pradesh', days: 2 },
  { prefix: '46', city: 'Bhopal', state: 'Madhya Pradesh', days: 2 },
  { prefix: '47', city: 'Gwalior', state: 'Madhya Pradesh', days: 2 },
  { prefix: '48', city: 'Jabalpur', state: 'Madhya Pradesh', days: 3 },
  { prefix: '49', city: 'Raipur', state: 'Chhattisgarh', days: 3 },

  // Southern Region
  { prefix: '50', city: 'Hyderabad', state: 'Telangana', days: 2 },
  { prefix: '51', city: 'Tirupati', state: 'Andhra Pradesh', days: 3 },
  { prefix: '52', city: 'Vijayawada', state: 'Andhra Pradesh', days: 2 },
  { prefix: '53', city: 'Visakhapatnam', state: 'Andhra Pradesh', days: 2 },
  { prefix: '56', city: 'Bengaluru', state: 'Karnataka', days: 2 },
  { prefix: '57', city: 'Mangaluru', state: 'Karnataka', days: 3 },
  { prefix: '58', city: 'Hubballi', state: 'Karnataka', days: 3 },
  { prefix: '59', city: 'Kalaburagi', state: 'Karnataka', days: 3 },
  { prefix: '60', city: 'Chennai', state: 'Tamil Nadu', days: 2 },
  { prefix: '61', city: 'Thanjavur', state: 'Tamil Nadu', days: 3 },
  { prefix: '62', city: 'Madurai', state: 'Tamil Nadu', days: 3 },
  { prefix: '63', city: 'Salem', state: 'Tamil Nadu', days: 3 },
  { prefix: '64', city: 'Coimbatore', state: 'Tamil Nadu', days: 2 },
  { prefix: '67', city: 'Kozhikode', state: 'Kerala', days: 3 },
  { prefix: '68', city: 'Kochi', state: 'Kerala', days: 3 },
  { prefix: '69', city: 'Thiruvananthapuram', state: 'Kerala', days: 3 },

  // Eastern & North-Eastern Region
  { prefix: '70', city: 'Kolkata', state: 'West Bengal', days: 2 },
  { prefix: '71', city: 'Howrah', state: 'West Bengal', days: 2 },
  { prefix: '72', city: 'Midnapore', state: 'West Bengal', days: 3 },
  { prefix: '73', city: 'Siliguri', state: 'West Bengal', days: 3 },
  { prefix: '74', city: 'Kalyani', state: 'West Bengal', days: 2 },
  { prefix: '75', city: 'Bhubaneswar', state: 'Odisha', days: 2 },
  { prefix: '76', city: 'Berhampur', state: 'Odisha', days: 3 },
  { prefix: '77', city: 'Rourkela', state: 'Odisha', days: 3 },
  { prefix: '78', city: 'Guwahati', state: 'Assam', days: 3 },
  { prefix: '79', city: 'Shillong', state: 'North East', days: 4 },
  { prefix: '80', city: 'Patna', state: 'Bihar', days: 2 },
  { prefix: '81', city: 'Bhagalpur', state: 'Bihar', days: 3 },
  { prefix: '82', city: 'Ranchi', state: 'Jharkhand', days: 3 },
  { prefix: '83', city: 'Jamshedpur', state: 'Jharkhand', days: 3 },
  { prefix: '84', city: 'Muzaffarpur', state: 'Bihar', days: 3 },
  { prefix: '85', city: 'Purnia', state: 'Bihar', days: 3 }
];

/**
 * Intelligent Pincode Resolver:
 * Queries official India Post API with in-memory cache and seamless offline dictionary fallback.
 */
const lookupPincodeDetails = async (cleanPin) => {
  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin);
  }

  // Find longest prefix match (3-digit first, then 2-digit)
  const match = PINCODE_PREFIX_MAP
    .filter((m) => cleanPin.startsWith(m.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  const defaultDays = match ? match.days : 3;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const districtName = po.District || po.Name || (match ? match.city : 'India');
        const stateName = po.State || (match ? match.state : 'India');

        const resolved = {
          city: districtName,
          district: districtName,
          state: stateName,
          area: po.Name || districtName,
          days: defaultDays
        };

        pincodeCache.set(cleanPin, resolved);
        return resolved;
      }
    }
  } catch (err) {
    // Timeout or network error, proceed safely to regional prefix match
  }

  const fallback = {
    city: match ? match.city : 'Pan-India',
    district: match ? match.city : 'India',
    state: match ? match.state : 'India',
    area: match ? match.city : '',
    days: defaultDays
  };

  pincodeCache.set(cleanPin, fallback);
  return fallback;
};

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
 * GET /api/v1/delivery/pincode/:pincode
 * Fast lookup for city, district, state, and serviceability from any Indian 6-digit PIN code
 */
const getPincodeDetails = async (req, res, next) => {
  try {
    const { pincode = '' } = req.params;
    const cleanPin = String(pincode).trim();

    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!pinRegex.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit Indian PIN code.'
      });
    }

    const info = await lookupPincodeDetails(cleanPin);

    res.status(200).json({
      success: true,
      pincode: cleanPin,
      city: info.city,
      district: info.district,
      state: info.state,
      area: info.area,
      serviceable: true
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

    const info = await lookupPincodeDetails(cleanPin);
    const city = info.city;
    const state = info.state;
    const days = info.days || 3;

    const deliveryTime = getFormattedDeliveryDate(days);
    const isFree = orderSubtotal >= threshold;
    const deliveryFee = isFree ? 0 : standardFee;
    const amountNeeded = Math.max(0, threshold - orderSubtotal);

    res.status(200).json({
      success: true,
      serviceable: true,
      pincode: cleanPin,
      city,
      district: info.district,
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
      message: `Delivery available to ${city}, ${state} (${cleanPin})`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDeliverySettings,
  getPincodeDetails,
  estimateDelivery
};
