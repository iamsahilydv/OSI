const DbConnection = require("../config/pool");

const createWithdrawlTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    conn.query(`CREATE TABLE IF NOT EXISTS withdrawal (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    amount INT NOT NULL,
    bankKey INT,
    upiKey INT,
    status ENUM('pending' , 'done', 'failed') DEFAULT 'pending',
    transactionID VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES shoping_users(id),
    FOREIGN KEY (bankKey) REFERENCES userBankDetails(id),
    FOREIGN KEY (upiKey) REFERENCES userUpiDetails(id)
   )
  `);
  } catch (error) {
    console.log({
      CartTableCreationError:
        error.message || "withdrawal Table Creation Error!",
    });
  }
};

module.exports = createWithdrawlTable;
