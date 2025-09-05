const axios = require("axios");
const getQikinkAccessToken = require("./qikinkAuth");

const createQikinkOrder = async (formattedOrder) => {
  const accessToken = await getQikinkAccessToken();

  try {
    const res = await axios.post(
      `${process.env.QIKINK_API}/api/order/create`,
      formattedOrder,
      {
        headers: {
          ClientId: process.env.QIKINK_CLIENT_ID,
          Accesstoken: accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Qikink order error:", error.response?.data || error.message);
    throw new Error("Failed to create order on Qikink");
  }
};

module.exports = createQikinkOrder;
