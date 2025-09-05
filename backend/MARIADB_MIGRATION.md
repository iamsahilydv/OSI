# MySQL to MariaDB Migration Guide

This document outlines the changes made to migrate the ShoppingBoom project from MySQL to MariaDB.

## Overview

MariaDB is a popular open-source relational database that provides better performance, security, and features compared to MySQL. This migration maintains full backward compatibility with existing MySQL queries and database structure.

## Changes Made

### 1. Package Dependencies

**File: `package.json`**
- Removed: `mysql2` package (version 3.3.3)
- Added: `mariadb` package (version 3.2.2)

```bash
npm install mariadb
npm uninstall mysql2
```

### 2. Database Connection Configuration

**File: `config/pool.js`**

#### Major Changes:
- Replaced `mysql2/promise` with `mariadb` driver
- Created wrapper classes to maintain compatibility with existing codebase
- Updated connection pool configuration for MariaDB optimization
- Added backward compatibility for environment variable names

#### Key Features:
- **MariaDBConnection Class**: Wraps MariaDB connections to maintain mysql2 API compatibility
- **MariaDBPool Class**: Wraps MariaDB pool to provide identical interface to mysql2
- **Query Result Compatibility**: Returns results in `[rows, fields]` format like mysql2
- **Transaction Support**: Full support for `beginTransaction()`, `commit()`, and `rollback()`

### 3. Environment Variables

The configuration now supports both MySQL and MariaDB environment variable naming:

#### New (Preferred):
```env
MARIADB_HOST=your_mariadb_host
MARIADB_PORT=3306
MARIADB_USER=your_username
MARIADB_PASSWORD=your_password
DATABASE_NAME=your_database_name
```

#### Legacy (Still Supported):
```env
MYSQL_HOST=your_mariadb_host
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
DATABASE_NAME=your_database_name
```

### 4. SQL Compatibility

All existing SQL queries remain unchanged because:
- MariaDB is highly compatible with MySQL syntax
- All table creation scripts use standard SQL that works in both systems
- Transaction patterns are identical
- Query execution patterns remain the same

## What Doesn't Need to Change

### Database Queries
All existing queries in the following areas work without modification:
- **Models**: All table creation scripts (`models/*.js`)
- **Controllers**: All CRUD operations (`controllers/*.js`)
- **Helpers**: All database helper functions (`helpers/*.js`)
- **Scripts**: Database setup and migration scripts (`scripts/*.js`)

### Application Logic
- Authentication and authorization logic
- Business logic and data processing
- API endpoints and routing
- Middleware and validation

## Migration Steps

### For Development Environment:

1. **Install MariaDB Server**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install mariadb-server
   
   # CentOS/RHEL
   sudo yum install mariadb-server
   
   # macOS
   brew install mariadb
   ```

2. **Install Node.js Dependencies**:
   ```bash
   npm install
   ```

3. **Update Environment Variables**:
   - Update your `.env` file with MariaDB connection details
   - Use either `MARIADB_*` or `MYSQL_*` prefixes (both supported)

4. **Import Existing Database**:
   ```bash
   # Export from MySQL
   mysqldump -u username -p database_name > backup.sql
   
   # Import to MariaDB
   mariadb -u username -p database_name < backup.sql
   ```

### For Production Environment:

1. **Database Migration**:
   - Set up MariaDB server
   - Migrate data from MySQL to MariaDB
   - Update connection strings

2. **Application Deployment**:
   - Deploy updated codebase
   - Update environment variables
   - Restart application services

## Performance Benefits

MariaDB offers several advantages over MySQL:

- **Better Performance**: Improved query optimization and execution
- **Enhanced Security**: Advanced security features and regular security updates
- **Storage Engines**: More storage engine options (Aria, TokuDB, etc.)
- **JSON Support**: Better JSON data type support
- **Compatibility**: Full MySQL compatibility with additional features

## Troubleshooting

### Common Issues:

1. **Connection Errors**:
   - Verify MariaDB server is running
   - Check firewall settings
   - Confirm connection credentials

2. **SSL Certificate Issues**:
   ```js
   // Add to pool configuration if needed
   ssl: {
     rejectUnauthorized: false
   }
   ```

3. **Charset Issues**:
   ```js
   // Add to pool configuration
   charset: 'utf8mb4'
   ```

### Testing Connection:

Create a simple test script to verify connectivity:

```javascript
const DbConnection = require("./config/pool");

async function testConnection() {
  try {
    const pool = await DbConnection();
    const [result] = await pool.query("SELECT 1 as test");
    console.log("✅ MariaDB connection successful:", result);
  } catch (error) {
    console.error("❌ Connection failed:", error);
  }
}

testConnection();
```

## Rollback Plan

If you need to rollback to MySQL:

1. **Restore Package Dependencies**:
   ```bash
   npm uninstall mariadb
   npm install mysql2@^3.3.3
   ```

2. **Revert Database Configuration**:
   - Replace `mariadb` require with `mysql2/promise`
   - Remove wrapper classes
   - Restore original pool configuration

3. **Database Migration**:
   - Export data from MariaDB
   - Import back to MySQL server

## Support

For any issues related to this migration:
- Check MariaDB documentation: https://mariadb.org/documentation/
- Review connection configuration in `config/pool.js`
- Verify environment variables are correctly set
- Test database connectivity independently

---

**Migration completed successfully!** 🎉

The application now uses MariaDB while maintaining full compatibility with the existing codebase.