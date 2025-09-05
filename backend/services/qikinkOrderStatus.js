const axios = require("axios");

const getQikinkOrderStatus = async (qikink_order_id) => {
  try {
    const response = await axios.get(`${process.env.QIKINK_API}/api/order`, {
      headers: {
        ClientId: process.env.QIKINK_CLIENT_ID,
        Accesstoken: process.env.QIKINK_ACCESS_TOKEN,
      },
      params: {
        id: orderId,
      },
    });

    const order = response.data;

    return order;
  } catch (err) {
    console.error(
      "❌ Failed to fetch Qikink order status:",
      err.response?.data || err.message
    );
    return null;
  }
};

module.exports = getQikinkOrderStatus;
