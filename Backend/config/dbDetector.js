const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Database detection utility to determine which database server is available locally
 */
class DatabaseDetector {
  /**
   * Check if MariaDB is available locally
   * @returns {Promise<boolean>} True if MariaDB is available, false otherwise
   */
  static async isMariaDBAvailable() {
    try {
      // Try to connect to MariaDB using command line
      const { stdout, stderr } = await execAsync('mariadb --version', { timeout: 5000 });
      if (stdout && stdout.toLowerCase().includes('mariadb')) {
        console.log('✅ MariaDB detected locally:', stdout.trim());
        return true;
      }
    } catch (error) {
      // MariaDB command not found, try alternative methods
      try {
        // Try mysql command but check if it's actually MariaDB
        const { stdout } = await execAsync('mysql --version', { timeout: 5000 });
        if (stdout && stdout.toLowerCase().includes('mariadb')) {
          console.log('✅ MariaDB detected (via mysql command):', stdout.trim());
          return true;
        }
      } catch (mysqlError) {
        // Neither command worked
      }
    }
    
    console.log('❌ MariaDB not detected locally');
    return false;
  }

  /**
   * Check if MySQL is available locally
   * @returns {Promise<boolean>} True if MySQL is available, false otherwise
   */
  static async isMySQLAvailable() {
    try {
      const { stdout, stderr } = await execAsync('mysql --version', { timeout: 5000 });
      if (stdout && !stdout.toLowerCase().includes('mariadb')) {
        console.log('✅ MySQL detected locally:', stdout.trim());
        return true;
      }
    } catch (error) {
      // MySQL command not found
    }
    
    console.log('❌ MySQL not detected locally');
    return false;
  }

  /**
   * Test database connection by attempting to connect
   * @param {string} dbType - 'mariadb' or 'mysql'
   * @param {object} config - Database configuration
   * @returns {Promise<boolean>} True if connection successful, false otherwise
   */
  static async testConnection(dbType, config) {
    // Try multiple authentication methods for better compatibility
    const authVariants = [
      // Original config
      { ...config },
      // Try with empty password
      { ...config, password: '' },
      // Try with default MySQL password
      { ...config, password: 'root' },
      // Try without specifying database
      { ...config, database: undefined },
      // Try with different user
      { ...config, user: 'mysql', password: '' }
    ];

    for (const authConfig of authVariants) {
      try {
        let connection;
        
        if (dbType === 'mariadb') {
          const mariadb = require('mariadb');
          connection = await mariadb.createConnection({
            host: authConfig.host,
            port: authConfig.port,
            user: authConfig.user,
            password: authConfig.password,
            database: authConfig.database,
            timeout: 5000,
            acquireTimeout: 5000
          });
          await connection.query('SELECT 1');
          await connection.end();
        } else if (dbType === 'mysql') {
          const mysql = require('mysql2/promise');
          connection = await mysql.createConnection({
            host: authConfig.host,
            port: authConfig.port,
            user: authConfig.user,
            password: authConfig.password,
            database: authConfig.database,
            connectTimeout: 5000
          });
          await connection.query('SELECT 1');
          await connection.end();
        }
        
        console.log(`✅ ${dbType.toUpperCase()} connection test successful with user: ${authConfig.user}`);
        // Update the original config with working credentials
        Object.assign(config, authConfig);
        return true;
        
      } catch (error) {
        // Continue to next auth variant
        continue;
      }
    }
    
    console.log(`❌ ${dbType.toUpperCase()} connection test failed with all authentication methods`);
    return false;
  }

  /**
   * Detect and return the preferred database type
   * @param {object} config - Database configuration object
   * @returns {Promise<string>} 'mariadb' or 'mysql' or null if none available
   */
  static async detectDatabase(config) {
    console.log('🔍 Detecting available database servers...');
    
    // First, check if MariaDB is available and can connect
    const mariadbAvailable = await this.isMariaDBAvailable();
    if (mariadbAvailable) {
      const mariadbConnects = await this.testConnection('mariadb', config);
      if (mariadbConnects) {
        console.log('🎯 Selected MariaDB as the database server');
        return 'mariadb';
      }
    }
    
    // If MariaDB is not available or can't connect, try MySQL
    const mysqlAvailable = await this.isMySQLAvailable();
    if (mysqlAvailable) {
      const mysqlConnects = await this.testConnection('mysql', config);
      if (mysqlConnects) {
        console.log('🎯 Selected MySQL as the database server');
        return 'mysql';
      }
    }
    
    console.log('❌ No suitable database server found or connection failed');
    return null;
  }
}

module.exports = DatabaseDetector;