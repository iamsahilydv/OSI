const DbConnetion = require("../config/pool");

async function createSubscribeTable() {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        FOREIGN KEY(user_id) REFERENCES shoping_users(id)
      )
    `);
  } catch (error) {
    console.log({
      SubscriptionCreationError:
        error.message || "Subscription Table Creation Error!",
    });
  }
}
module.exports = createSubscribeTable;
