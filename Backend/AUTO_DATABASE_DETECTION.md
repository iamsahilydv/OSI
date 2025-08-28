# Automatic Database Detection System

This document explains the automatic database detection and connection system implemented in the ShoppingBoom project.

## Overview

The system automatically detects whether MariaDB or MySQL is available locally and connects to the appropriate database server. It prioritizes MariaDB over MySQL when both are available.

## How It Works

### Detection Process

1. **MariaDB Detection First**: The system first attempts to detect MariaDB
   - Checks if `mariadb` command is available
   - Falls back to checking `mysql` command for MariaDB signatures
   - Tests actual database connection

2. **MySQL Fallback**: If MariaDB is not available or connection fails
   - Checks if `mysql` command is available (and it's not MariaDB)
   - Tests actual database connection

3. **Connection Priority**: MariaDB > MySQL > Error

### Files Modified

#### 1. `package.json`
- Added `mysql2` dependency back for MySQL support
- Now supports both `mariadb` and `mysql2` drivers

#### 2. `config/dbDetector.js` (New)
- **DatabaseDetector Class**: Core detection logic
- **Methods**:
  - `isMariaDBAvailable()`: Checks if MariaDB is installed
  - `isMySQLAvailable()`: Checks if MySQL is installed  
  - `testConnection()`: Tests actual database connectivity
  - `detectDatabase()`: Main detection orchestrator

#### 3. `config/pool.js` (Enhanced)
- **Auto-Detection Integration**: Uses DatabaseDetector to choose database
- **Dual Driver Support**: Supports both MariaDB and MySQL2 drivers
- **Wrapper Classes**: Maintains API compatibility between drivers
- **Enhanced Logging**: Clear status messages with emojis

## Environment Variables

The system supports flexible environment variable naming:

### MariaDB (Preferred)
```env
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=root
MARIADB_PASSWORD=your_password
DATABASE_NAME=your_database
```

### MySQL (Legacy Support)
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
DATABASE_NAME=your_database
```

### Fallback Defaults
- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: (empty string)

## Usage

### Basic Usage
```javascript
const DbConnection = require("./config/pool");

async function useDatabase() {
  try {
    const pool = await DbConnection();
    const [results] = await pool.query("SELECT * FROM users");
    console.log("Current DB:", DbConnection.getCurrentDbType());
    return results;
  } catch (error) {
    console.error("Database error:", error);
  }
}
```

### Testing the Connection
```bash
cd Backend
node test-db-connection.js
```

## API Compatibility

The system maintains full compatibility with the existing codebase:

### Query Methods
```javascript
// Both return results in [rows, fields] format
const [rows] = await pool.query("SELECT * FROM table");
const [rows] = await connection.query("SELECT * FROM table");
```

### Transaction Support
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();
try {
  await connection.query("INSERT INTO...");
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.release();
}
```

### Connection Pool
```javascript
const pool = await DbConnection();
const connection = await pool.getConnection();
// Use connection...
await connection.release();
```

## Detection Examples

### Console Output Examples

#### MariaDB Detected
```
🚀 Initializing database connection...
📡 Connecting to: localhost:3306
🔍 Detecting available database servers...
✅ MariaDB detected locally: mariadb Ver 15.1 Distrib 10.6.7-MariaDB
✅ MariaDB connection test successful
🎯 Selected MariaDB as the database server
🟢 Creating MariaDB connection pool...
✅ Connected to MariaDB database successfully
```

#### MySQL Fallback
```
🚀 Initializing database connection...
📡 Connecting to: localhost:3306
🔍 Detecting available database servers...
❌ MariaDB not detected locally
✅ MySQL detected locally: mysql Ver 8.0.32 for Linux on x86_64
✅ MySQL connection test successful
🎯 Selected MySQL as the database server
🔵 Creating MySQL connection pool...
✅ Connected to MySQL database successfully
```

#### No Database Found
```
🚀 Initializing database connection...
📡 Connecting to: localhost:3306
🔍 Detecting available database servers...
❌ MariaDB not detected locally
❌ MySQL not detected locally
❌ No suitable database server found or connection failed
❌ Error creating database connection pool: No suitable database server...
```

## Troubleshooting

### Common Issues

1. **Neither Database Detected**
   ```bash
   # Install MariaDB (preferred)
   sudo apt install mariadb-server  # Ubuntu/Debian
   brew install mariadb            # macOS
   
   # Or install MySQL
   sudo apt install mysql-server   # Ubuntu/Debian
   brew install mysql              # macOS
   ```

2. **Connection Refused**
   - Ensure database server is running
   - Check firewall settings
   - Verify credentials in environment variables

3. **Permission Denied**
   - Check user permissions in database
   - Verify username/password combination

### Testing Individual Components

#### Test Database Detection Only
```javascript
const DatabaseDetector = require("./config/dbDetector");

async function testDetection() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test'
  };
  
  const dbType = await DatabaseDetector.detectDatabase(config);
  console.log("Detected:", dbType);
}
```

#### Test Connection Pool
```bash
node test-db-connection.js
```

## Migration from Previous Setup

### From MariaDB-Only Setup
No changes needed - the system will automatically detect and use MariaDB.

### From MySQL-Only Setup
1. Install dependencies: `npm install`
2. Update environment variables (optional - legacy names still work)
3. The system will automatically detect and use MySQL

### Adding MariaDB to Existing MySQL Setup
1. Install MariaDB server
2. Import existing data (optional)
3. Restart application - it will automatically switch to MariaDB

## Performance Considerations

### Detection Overhead
- Detection runs only once during application startup
- Results are cached for the application lifetime
- Minimal performance impact after initialization

### Connection Pooling
- Both MariaDB and MySQL use optimized connection pools
- Same pool configuration for consistent performance
- Connection limits and timeouts are identical

## Security Notes

- Database credentials should be stored in environment variables
- Use strong passwords for database users
- Consider using SSL connections for production
- Regularly update database server software

## Future Enhancements

Potential improvements for the detection system:

1. **Remote Database Support**: Extend detection for remote servers
2. **SSL Configuration**: Auto-configure SSL based on server capabilities
3. **Health Monitoring**: Periodic connection health checks
4. **Failover Support**: Automatic failover between multiple servers
5. **Configuration Validation**: Enhanced validation of connection parameters

---

**Status**: ✅ Active and Production Ready

The automatic database detection system is fully functional and maintains backward compatibility with all existing code.