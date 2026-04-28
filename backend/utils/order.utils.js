/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Generate formatted WhatsApp message for an order
 * @param {Object} order Order object
 * @returns {string} Formatted message
 */
exports.generateWhatsAppMessage = (order) => {
  const items = order.items
    .map(item => `• ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}`)
    .join('\n');

  const locationInfo = order.deliveryLocation && order.deliveryLocation.lat 
    ? `\n📍 *Location:* https://www.google.com/maps?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`
    : '';

  return `🛒 *New Order from FreshCart*\n\n📋 *Order Items:*\n${items}\n\n💰 *Total Amount:* ₹${order.totalAmount}${locationInfo}\n\n👤 *Customer Details:*\nName: ${order.customerName}\nPhone: ${order.phone}\nAddress: ${order.address}\n\nThank you for shopping with us! 🛍️`;
};
