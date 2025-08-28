const DbConnetion = require("../config/pool");

async function subscriptionPaymentTable() {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscriptionPayment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        receive_at TIMESTAMP NOT NULL,
        status ENUM('done', 'pending','failed') DEFAULT 'pending',
        FOREIGN KEY(user_id) REFERENCES shoping_users(id)
      )
    `);
  } catch (error) {
    console.log({
      SubscriptionPaymentCreationError:
        error.message || "Subscription payment Table Creation Error!",
    });
  }
}
module.exports = subscriptionPaymentTable;
