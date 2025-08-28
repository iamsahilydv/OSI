const DbConnetion = require("../config/pool");

const createReferPaymentTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    conn.query(`
    CREATE TABLE IF NOT EXISTS referPayments (
      id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
      user_id INT NOT NULL,
      userName VARCHAR(255) NOT NULL,
      status ENUM('done', 'pending','failed','exceeded') DEFAULT 'pending',
      paymentReason ENUM('refer','commission','ResaleCommission'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      payment DECIMAL(10, 2) NOT NULL, 
      receive_at TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES shoping_users(id)
    );
  `);
  } catch (error) {
    console.log({
      createReferPaymentTableError:
        error.message || "refer payment Table Creation Error!",
    });
  }
};

module.exports = createReferPaymentTable;
