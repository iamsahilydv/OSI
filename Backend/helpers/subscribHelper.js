const createConnectionDb = require("../config/pool");

async function updateSubscriptionStatus() {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    // Get subscriptions with end_date less than or equal to the current date
    const curDate = new Date();
    const subscriptionsToUpdate = await conn.query(
      "SELECT id FROM user_subscriptions WHERE end_date <= ? AND status = ?",
      [curDate, "active"]
    );

    // Update the status of subscriptions to 'inactive'
    for (const subscription of subscriptionsToUpdate[0]) {
      await conn.query(
        "UPDATE user_subscriptions SET status = ? WHERE id = ?",
        ["inactive", subscription.id]
      );
    }

    console.log("Subscription status updated.");
  } catch (error) {
    console.error("Error updating subscription status:", error.message);
  }
}

module.exports =  updateSubscriptionStatus;
