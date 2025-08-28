const formatOrderForQikink = (order) => {
  return {
    number: order._id || order.orderId,
    shipping: {
      first_name: order.name,
      phone: order.phone,
      city: order.city,
      zip: order.pincode,
      province: order.state,
      country_code: "IN",
    },
    line_items: order.items.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
      price: item.price,
      designs: item.designs || [],
    })),
  };
};

module.exports = { formatOrderForQikink };
