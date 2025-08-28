const DbConnetion = require("../config/pool");

const createUserBankDetailsTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
      CREATE TABLE IF NOT EXISTS userBankDetails (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        account_holder_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(20) NOT NULL,
        bank_name VARCHAR(255) NOT NULL,
        branch_name VARCHAR(255),
        ifsc_code VARCHAR(20),
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log({
      BankTableCreationError:
        error.message || "userBankDetails Table Creation Error!",
    });
  }
};

const createUserUpiDetailsTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });

    // Create userUpiDetails table without trigger
    await conn.query(`
      CREATE TABLE IF NOT EXISTS userUpiDetails (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        upi_id VARCHAR(255) NOT NULL,
        upi_provider VARCHAR(50), 
        is_default BOOLEAN DEFAULT false, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id) ON DELETE CASCADE
      )
    `);
  } catch (error) {
    console.log({
      UpiTableCreationError:
        error.message || "userUpiDetails Table Creation Error!",
    });
  }
};

module.exports = { createUserBankDetailsTable, createUserUpiDetailsTable };
