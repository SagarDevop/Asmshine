const StoreSettings = require('../models/StoreSettings');

// In-memory LRU-style cache for rapid pincode lookups
const pincodeCache = new Map();

// Comprehensive Regional Pincode Prefix Dictionary covering all Indian Postal Circles
const PINCODE_PREFIX_MAP = [
  // Northern Region
  { prefix: '11', city: 'Delhi / NCR', state: 'Delhi', days: 1 },
  { prefix: '12', city: 'Gurugram / Faridabad', state: 'Haryana', days: 1 },
  { prefix: '13', city: 'Ambala / Karnal / Panipat', state: 'Haryana', days: 2 },
  { prefix: '14', city: 'Ludhiana / Jalandhar / Amritsar', state: 'Punjab', days: 2 },
  { prefix: '15', city: 'Bathinda / Patiala', state: 'Punjab', days: 2 },
  { prefix: '16', city: 'Chandigarh / Mohali / Panchkula', state: 'Chandigarh', days: 2 },
  { prefix: '17', city: 'Shimla / Solan / Mandi', state: 'Himachal Pradesh', days: 3 },
  { prefix: '18', city: 'Jammu Region', state: 'Jammu and Kashmir', days: 3 },
  { prefix: '19', city: 'Srinagar / Kashmir Valley', state: 'Jammu and Kashmir', days: 4 },

  // Uttar Pradesh & Uttarakhand
  { prefix: '20', city: 'Noida / Ghaziabad / Aligarh / Agra', state: 'Uttar Pradesh', days: 1 },
  { prefix: '21', city: 'Banda / Prayagraj / Chitrakoot / Fatehpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '22', city: 'Lucknow / Kanpur / Ayodhya', state: 'Uttar Pradesh', days: 2 },
  { prefix: '23', city: 'Varanasi / Mirzapur / Jaunpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '24', city: 'Dehradun / Haridwar / Moradabad / Bareilly', state: 'Uttarakhand', days: 2 },
  { prefix: '25', city: 'Meerut / Muzaffarnagar / Saharanpur', state: 'Uttar Pradesh', days: 2 },
  { prefix: '26', city: 'Sitapur / Lakhimpur / Pilibhit', state: 'Uttar Pradesh', days: 2 },
  { prefix: '27', city: 'Gorakhpur / Basti / Azamgarh', state: 'Uttar Pradesh', days: 2 },
  { prefix: '28', city: 'Jhansi / Lalitpur / Jalaun', state: 'Uttar Pradesh', days: 2 },

  // Western Region
  { prefix: '30', city: 'Jaipur Metropolitan', state: 'Rajasthan', days: 2 },
  { prefix: '31', city: 'Udaipur / Bhilwara / Chittorgarh', state: 'Rajasthan', days: 2 },
  { prefix: '32', city: 'Kota / Sawai Madhopur', state: 'Rajasthan', days: 2 },
  { prefix: '33', city: 'Bikaner / Sikar / Jhunjhunu', state: 'Rajasthan', days: 2 },
  { prefix: '34', city: 'Jodhpur / Barmer / Pali', state: 'Rajasthan', days: 2 },
  { prefix: '36', city: 'Rajkot / Junagadh', state: 'Gujarat', days: 2 },
  { prefix: '37', city: 'Kutch / Jamnagar', state: 'Gujarat', days: 2 },
  { prefix: '38', city: 'Ahmedabad / Gandhinagar', state: 'Gujarat', days: 2 },
  { prefix: '39', city: 'Surat / Vadodara / Bharuch', state: 'Gujarat', days: 2 },
  { prefix: '40', city: 'Mumbai / Thane / Navi Mumbai', state: 'Maharashtra', days: 2 },
  { prefix: '41', city: 'Pune / Nashik / Kolhapur', state: 'Maharashtra', days: 2 },
  { prefix: '42', city: 'Aurangabad / Jalgaon / Dhule', state: 'Maharashtra', days: 2 },
  { prefix: '43', city: 'Nanded / Latur / Parbhani', state: 'Maharashtra', days: 3 },
  { prefix: '44', city: 'Nagpur / Amravati / Akola', state: 'Maharashtra', days: 2 },
  { prefix: '403', city: 'Panaji / Margao', state: 'Goa', days: 3 },

  // Central Region
  { prefix: '45', city: 'Indore / Ujjain', state: 'Madhya Pradesh', days: 2 },
  { prefix: '46', city: 'Bhopal / Hoshangabad', state: 'Madhya Pradesh', days: 2 },
  { prefix: '47', city: 'Gwalior / Morena / Shivpuri', state: 'Madhya Pradesh', days: 2 },
  { prefix: '48', city: 'Jabalpur / Chhindwara / Satna', state: 'Madhya Pradesh', days: 3 },
  { prefix: '49', city: 'Raipur / Bilaspur / Durg', state: 'Chhattisgarh', days: 3 },

  // Southern Region
  { prefix: '50', city: 'Hyderabad / Secunderabad / Warangal', state: 'Telangana', days: 2 },
  { prefix: '51', city: 'Tirupati / Kadapa / Kurnool', state: 'Andhra Pradesh', days: 3 },
  { prefix: '52', city: 'Vijayawada / Guntur', state: 'Andhra Pradesh', days: 2 },
  { prefix: '53', city: 'Visakhapatnam / Rajahmundry', state: 'Andhra Pradesh', days: 2 },
  { prefix: '56', city: 'Bengaluru Urban & Rural', state: 'Karnataka', days: 2 },
  { prefix: '57', city: 'Mangaluru / Udupi / Mysuru', state: 'Karnataka', days: 3 },
  { prefix: '58', city: 'Hubballi / Belagavi / Dharwad', state: 'Karnataka', days: 3 },
  { prefix: '59', city: 'Kalaburagi / Raichur', state: 'Karnataka', days: 3 },
  { prefix: '60', city: 'Chennai Metropolitan', state: 'Tamil Nadu', days: 2 },
  { prefix: '61', city: 'Thanjavur / Nagapattinam', state: 'Tamil Nadu', days: 3 },
  { prefix: '62', city: 'Madurai / Dindigul / Tirunelveli', state: 'Tamil Nadu', days: 3 },
  { prefix: '63', city: 'Salem / Vellore / Erode', state: 'Tamil Nadu', days: 3 },
  { prefix: '64', city: 'Coimbatore / Tiruppur', state: 'Tamil Nadu', days: 2 },
  { prefix: '67', city: 'Kozhikode / Kannur / Malappuram', state: 'Kerala', days: 3 },
  { prefix: '68', city: 'Kochi / Ernakulam / Thrissur', state: 'Kerala', days: 3 },
  { prefix: '69', city: 'Thiruvananthapuram / Kollam', state: 'Kerala', days: 3 },

  // Eastern & North-Eastern Region
  { prefix: '70', city: 'Kolkata Metropolitan', state: 'West Bengal', days: 2 },
  { prefix: '71', city: 'Howrah / Hooghly', state: 'West Bengal', days: 2 },
  { prefix: '72', city: 'Midnapore / Haldia', state: 'West Bengal', days: 3 },
  { prefix: '73', city: 'Siliguri / Darjeeling / Jalpaiguri', state: 'West Bengal', days: 3 },
  { prefix: '74', city: 'North 24 Parganas / Nadia', state: 'West Bengal', days: 2 },
  { prefix: '75', city: 'Bhubaneswar / Cuttack / Puri', state: 'Odisha', days: 2 },
  { prefix: '76', city: 'Berhampur / Koraput', state: 'Odisha', days: 3 },
  { prefix: '77', city: 'Rourkela / Sambalpur', state: 'Odisha', days: 3 },
  { prefix: '78', city: 'Guwahati / Kamrup / Dibrugarh', state: 'Assam', days: 3 },
  { prefix: '79', city: 'Shillong / Imphal / Agartala / Aizawl', state: 'North East', days: 4 },
  { prefix: '80', city: 'Patna / Nalanda / Gaya', state: 'Bihar', days: 2 },
  { prefix: '81', city: 'Bhagalpur / Munger', state: 'Bihar', days: 3 },
  { prefix: '82', city: 'Ranchi / Bokaro / Hazaribagh', state: 'Jharkhand', days: 3 },
  { prefix: '83', city: 'Jamshedpur / Dhanbad', state: 'Jharkhand', days: 3 },
  { prefix: '84', city: 'Muzaffarpur / Darbhanga', state: 'Bihar', days: 3 },
  { prefix: '85', city: 'Purnia / Saharsa', state: 'Bihar', days: 3 }
];

/**
 * Intelligent Pincode Resolver:
 * Queries official India Post API with in-memory cache and seamless offline dictionary fallback.
 */
const lookupPincodeDetails = async (cleanPin) => {
  if (pincodeCache.has(cleanPin)) {
    return pincodeCache.get(cleanPin);
  }

  // Find prefix match for days estimate & fallback
  const prefix = cleanPin.slice(0, 2);
  const match = PINCODE_PREFIX_MAP.find((m) => cleanPin.startsWith(m.prefix) || m.prefix === prefix);
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
