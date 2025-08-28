const mariadb = require("mariadb");
const mysql = require("mysql2/promise");
const DatabaseDetector = require("./dbDetector");
require("dotenv").config(); // Load environment variables from .env

let pool;
let currentDbType = null;

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

// MySQL connection wrapper (mysql2 already has the right format)
class MySQLConnection {
  constructor(connection) {
    this.connection = connection;
  }

  async query(sql, params) {
    return await this.connection.query(sql, params);
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

// MySQL pool wrapper (mysql2 already has the right format)
class MySQLPool {
  constructor(pool) {
    this.pool = pool;
  }

  async query(sql, params) {
    return await this.pool.query(sql, params);
  }

  async getConnection() {
    const conn = await this.pool.getConnection();
    return new MySQLConnection(conn);
  }

  async end() {
    return await this.pool.end();
  }
}

async function DbConnection() {
  console.log("🚀 Initializing database connection...");
  
  if (!pool) {
    try {
      // Prepare database configuration
      const dbConfig = {
        host: process.env.MARIADB_HOST || process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MARIADB_PORT || process.env.MYSQL_PORT || '3306'),
        user: process.env.MARIADB_USER || process.env.MYSQL_USER || 'root',
        password: process.env.MARIADB_PASSWORD || process.env.MYSQL_PASSWORD || '',
        database: process.env.DATABASE_NAME,
      };

      console.log(`📡 Connecting to: ${dbConfig.host}:${dbConfig.port}`);

      // Detect which database to use
      const detectedDb = await DatabaseDetector.detectDatabase(dbConfig);
      
      if (!detectedDb) {
        throw new Error('No suitable database server (MariaDB or MySQL) found or connection failed');
      }

      currentDbType = detectedDb;

      if (detectedDb === 'mariadb') {
        console.log("🟢 Creating MariaDB connection pool...");
        const mariaPool = mariadb.createPool({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          acquireTimeout: 10000,
          connectionLimit: 50,
          idleTimeout: 300000,
          timeout: 60000,
        });
        
        pool = new MariaDBPool(mariaPool);
        console.log("✅ Connected to MariaDB database successfully");
        
      } else if (detectedDb === 'mysql') {
        console.log("🔵 Creating MySQL connection pool...");
        const mysqlPool = mysql.createPool({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          acquireTimeout: 10000,
          connectionLimit: 50,
          idleTimeout: 300000,
          timeout: 60000,
          waitForConnections: true,
          queueLimit: 0
        });
        
        pool = new MySQLPool(mysqlPool);
        console.log("✅ Connected to MySQL database successfully");
      }

    } catch (error) {
      console.error("❌ Error creating database connection pool:", error.message);
      throw error;
    }
  }

  try {
    return pool;
  } catch (error) {
    console.error(`❌ Error connecting to the ${currentDbType || 'database'}:`, error.message);
    throw error;
  }
}

// Export additional utility function to get current database type
DbConnection.getCurrentDbType = () => currentDbType;

module.exports = DbConnection;
