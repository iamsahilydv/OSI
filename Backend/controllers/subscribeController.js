const createConnectionDb = require("../config/pool");

const insertSubscriptionDetailsController = async (req, res) => {
  const { id } = req.params;
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // Add 1 month to the start date
  endDate.setDate(1); // Set the day of the month to 1
  endDate.setHours(0, 0, 0, 0);
  console.log({ endDate });
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if there's an existing subscription for the user that hasn't expired
    const existingSubscription = await conn.query(
      `SELECT * FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY end_date DESC LIMIT 1`,
      [id]
    );

    if (
      existingSubscription[0].length === 0 ||
      existingSubscription[0].end_date <= new Date()
    ) {
      // Insert details into subscription table
      const current_date = new Date();
      current_date.setHours(0, 0, 0, 0);
      await conn.query(
        `INSERT INTO user_subscriptions (user_id, start_date, end_date) VALUES (?, ?, ?)`,
        [id, current_date, endDate]
      );
      return res
        .status(200)
        .json({ success: true, message: "Subscription record inserted" });
    } else {
      return res.status(400).json({
        success: false,
        message: "Existing subscription is still active",
        res: existingSubscription[0],
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
const createSubscriptionDetailsController = async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const current_date = new Date();
    current_date.setHours(0, 0, 0, 0);
    const end_date = new Date();
    end_date.setHours(0, 0, 0, 0);
    await conn.query(
      `INSERT INTO user_subscriptions (user_id, start_date, end_date, status) VALUES (?, ?, ?, 'inactive')`,
      [id, current_date, end_date]
    );
    return true;
  } catch (error) {
    return false;
  }
};

const getAllSubscriptionsDetailsController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const result = await conn.query("SELECT * FROM user_subscriptions");
    return res.status(200).json({ success: true, message: result[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSubscriptionDetailsForOneUserController = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const result = await conn.query(
      "SELECT * FROM user_subscriptions WHERE user_id = ?",
      [id]
    );
    if (result[0].length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Subscription not found!" });
    }
    return res.status(200).json(result[0]);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  insertSubscriptionDetailsController,
  createSubscriptionDetailsController,
  getAllSubscriptionsDetailsController,
  getAllSubscriptionDetailsForOneUserController,
};
