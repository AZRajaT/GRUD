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

// Send notification (WhatsApp/SMS placeholder)
exports.sendNotification = (order, status, message) => {
  // TODO: Integrate with WhatsApp Business API, SMS gateway, or Firebase Cloud Messaging
  console.log(`Notification to ${order.phone}: ${message} (Order #${order._id.toString().slice(-6)})`);

  // WhatsApp message template
  const whatsappMessage = `Hi ${order.customerName},\n${message}\n\nOrder ID: ${order._id.toString().slice(-6).toUpperCase()}\nTracking ID: ${order.trackingId}\n\nEstimated Delivery: ${new Date(order.estimatedDeliveryDate).toLocaleDateString()}\n\nThank you for choosing AROW Mart!`;
  // Log for demonstration
  return {
    success: true,
    notification: {
      to: order.phone,
      message: whatsappMessage,
      type: 'whatsapp',
      timestamp: new Date()
    }
  };
};


