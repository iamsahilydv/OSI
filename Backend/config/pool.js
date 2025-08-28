const mariadb = require("mariadb");
require("dotenv").config(); // Load environment variables from .env

let pool;

// MariaDB connection wrapper to maintain compatibility with mysql2 syntax
class MariaDBConnection {
  constructor(connection) {
    this.connection = connection;
  }

  async query(sql, params) {
    try {
      const result = await this.connection.query(sql, params);
      // Return results in mysql2 format [rows, fields] for compatibility
      return [result, null]; // MariaDB doesn't return fields in the same way
    } catch (error) {
      throw error;
    }
  }

  async beginTransaction() {
    return await this.connection.beginTransaction();
  }

  async commit() {
    return await this.connection.commit();
  }

  async rollback() {
    return await this.connection.rollback();
  }

  async release() {
    return await this.connection.release();
  }

  async end() {
    return await this.connection.end();
  }
}

// Pool wrapper to maintain compatibility
class MariaDBPool {
  constructor(pool) {
    this.pool = pool;
  }

  async query(sql, params) {
    try {
      const result = await this.pool.query(sql, params);
      // Return results in mysql2 format [rows, fields] for compatibility
      return [result, null];
    } catch (error) {
      throw error;
    }
  }

  async getConnection() {
    const conn = await this.pool.getConnection();
    return new MariaDBConnection(conn);
  }

  async end() {
    return await this.pool.end();
  }
}

async function DbConnection() {
  console.log("Connecting to the MariaDB database...");
  console.log("Host:", process.env.MARIADB_HOST || process.env.MYSQL_HOST); // Support both env var names for backward compatibility

  if (!pool) {
    try {
      const mariaPool = mariadb.createPool({
        host: process.env.MARIADB_HOST || process.env.MYSQL_HOST,
        port: process.env.MARIADB_PORT || process.env.MYSQL_PORT,
        user: process.env.MARIADB_USER || process.env.MYSQL_USER,
        password: process.env.MARIADB_PASSWORD || process.env.MYSQL_PASSWORD,
        database: process.env.DATABASE_NAME,
        // host: "shoppingboom.cp6666w6eeiw.ap-south-1.rds.amazonaws.com",
        // port: 3306,
        // user: "admin",
        // password: "SahilShoppingboom",
        // database: "shoppingboom",
        acquireTimeout: 10000,
        connectionLimit: 50,
        idleTimeout: 300000,
        timeout: 60000,
      });
      
      pool = new MariaDBPool(mariaPool);
      console.log("Connected to the MariaDB database successfully");
    } catch (error) {
      console.error("Error creating MariaDB connection pool:", error.message);
      throw error;
    }
  }

  try {
    return pool;
  } catch (error) {
    console.error("Error connecting to the MariaDB database:", error.message);
    throw error;
  }
}

module.exports = DbConnection;
