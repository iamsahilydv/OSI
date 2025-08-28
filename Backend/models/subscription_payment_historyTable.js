const DbConnetion = require("../config/pool");

const subscription_payment_historyTableCreate = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
    CREATE TABLE IF NOT EXISTS subscription_payment_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      execution_month INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  } catch (error) {
    console.log({
      subscription_payment_historyTableCreateError:
        error.message ||
        "subscription_payment_history Table Creation Error!",
    });
  }
};

module.exports = subscription_payment_historyTableCreate;
