const axios = require("axios");
const qs = require("qs");

let cachedToken = null;
let tokenExpiry = null;

const getQikinkAccessToken = async () => {
  const now = Date.now();

  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const data = qs.stringify({
    ClientId: process.env.QIKINK_CLIENT_ID,
    client_secret: process.env.QIKINK_CLIENT_SECRET,
  });
  console.log(data);

  try {
    const res = await axios.post(`${process.env.QIKINK_API}/api/token`, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log("Qikink Access Token:", res.data.Accesstoken);

    cachedToken = res.data.Accesstoken;
    tokenExpiry = now + res.data.expires_in * 1000;

    return cachedToken;
  } catch (error) {
    console.error("Token error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Qikink");
  }
};
// getQikinkAccessToken();
module.exports = getQikinkAccessToken;
