const DbConnetion = require("../config/pool");

//create user table schema and create table in db
const createUserTable = async () => {
  try {
    const conn = await DbConnetion({ timeout: 10000 });
    await conn.query(`
       CREATE TABLE IF NOT EXISTS shoping_users (
         id INT AUTO_INCREMENT PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         email VARCHAR(255) UNIQUE,
         mobile VARCHAR(20) NOT NULL,
         gender ENUM('male','female','other') NOT NULL,
         password VARCHAR(255) NOT NULL,
         KYC BOOLEAN NOT NULL DEFAULT FALSE,
         status ENUM('active' , 'inactive') DEFAULT 'inactive',
         pancard VARCHAR(20) DEFAULT 0,
         referby VARCHAR(255) NOT NULL,
         referId VARCHAR(255) UNIQUE,
         position ENUM('left','right','') DEFAULT '',
         subscription ENUM('true', 'false') NOT NULL DEFAULT 'false',
         total_income INT(255)  NOT NULL DEFAULT 0,
         total_withdraw INT(255) NOT NULL DEFAULT 0,
         role ENUM('user', 'admin','merchant','superAdmin'),
         wallet INT(255) AS (total_income - total_withdraw),
         today_income INT(255) DEFAULT 0,
         isUserEnabled BOOLEAN NOT NULL DEFAULT TRUE,
         leftCount INT DEFAULT 0,
         rightCount INT DEFAULT 0,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
  } catch (error) {
    console.log({
      UserTableCreationError: error.message || "User Table Creation Error!",
    });
  }
};

module.exports = createUserTable;
