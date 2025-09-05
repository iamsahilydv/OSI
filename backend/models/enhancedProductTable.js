// Enhanced Table Models for Professional Product Management
const DbConnection = require("../config/pool");

// 1. Enhanced Categories Table with hierarchy
const createEnhancedCategoryTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        parent_id INT DEFAULT NULL,
        slug VARCHAR(255) UNIQUE,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_parent (parent_id),
        INDEX idx_active (is_active),
        INDEX idx_sort (sort_order)
      )
    `);

    console.log("✅ Enhanced categories table created successfully");
  } catch (error) {
    console.error("Enhanced Categories Table Error:", error.message);
  }
};

// 2. Suppliers Table for Dropshipping
const createSuppliersTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        website TEXT,
        
        -- Address
        address_line1 VARCHAR(255),
        address_line2 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        
        -- API Configuration for automated dropshipping
        api_endpoint TEXT,
        api_key VARCHAR(500),
        api_secret VARCHAR(500),
        api_config JSON,
        
        -- Terms & Conditions
        commission_rate DECIMAL(5,2) DEFAULT 0,
        minimum_order_amount DECIMAL(10,2) DEFAULT 0,
        shipping_cost DECIMAL(10,2) DEFAULT 0,
        processing_time_days INT DEFAULT 1,
        
        -- Status
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_active (is_active),
        INDEX idx_name (name)
      )
    `);

    console.log("✅ Suppliers table created successfully");
  } catch (error) {
    console.error("Suppliers Table Error:", error.message);
  }
};

// 3. Enhanced Category Attributes Table
const createEnhancedCategoryAttributesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS category_attributes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NOT NULL,
        attribute_name VARCHAR(100) NOT NULL,
        attribute_type ENUM(
          'text', 'number', 'decimal', 'select', 'multiselect', 
          'boolean', 'color', 'size', 'range', 'date', 'url', 
          'textarea', 'json', 'file'
        ) NOT NULL,
        is_required BOOLEAN DEFAULT FALSE,
        is_filterable BOOLEAN DEFAULT FALSE,
        is_searchable BOOLEAN DEFAULT FALSE,
        options JSON,
        validation_rules JSON,
        display_order INT DEFAULT 0,
        unit VARCHAR(20),
        help_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_category_attribute (category_id, attribute_name),
        INDEX idx_category (category_id),
        INDEX idx_filterable (is_filterable),
        INDEX idx_searchable (is_searchable)
      )
    `);

    console.log("✅ Enhanced category attributes table created successfully");
  } catch (error) {
    console.error("Enhanced Category Attributes Table Error:", error.message);
  }
};

// 4. Enhanced Products Table
const createEnhancedProductsTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE,
        description TEXT,
        short_description VARCHAR(1000),
        category_id INT NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        sku VARCHAR(100) UNIQUE,
        
        -- Product Type Management
        product_type ENUM('own', 'dropship', 'pod', 'affiliate') NOT NULL DEFAULT 'own',
        
        -- Inventory Management
        stock_management ENUM('track', 'no_track', 'supplier_managed') DEFAULT 'track',
        stock_quantity INT DEFAULT 0,
        low_stock_threshold INT DEFAULT 5,
        
        -- Supplier/Dropshipping Information
        supplier_id INT DEFAULT NULL,
        supplier_sku VARCHAR(100) DEFAULT NULL,
        supplier_price DECIMAL(12,2) DEFAULT NULL,
        supplier_url TEXT DEFAULT NULL,
        
        -- Shipping & Weight
        weight DECIMAL(8,2) DEFAULT NULL,
        length DECIMAL(8,2) DEFAULT NULL,
        width DECIMAL(8,2) DEFAULT NULL,
        height DECIMAL(8,2) DEFAULT NULL,
        
        -- SEO & Meta
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        
        -- Status & Visibility
        status ENUM('active', 'inactive', 'out_of_stock', 'discontinued') DEFAULT 'active',
        visibility ENUM('public', 'private', 'catalog_only') DEFAULT 'public',
        is_featured BOOLEAN DEFAULT FALSE,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
        INDEX idx_product_type (product_type),
        INDEX idx_status (status),
        INDEX idx_category (category_id),
        INDEX idx_brand (brand),
        INDEX idx_sku (sku),
        INDEX idx_featured (is_featured),
        FULLTEXT(name, description)
      )
    `);

    console.log("✅ Enhanced products table created successfully");
  } catch (error) {
    console.error("Enhanced Products Table Error:", error.message);
  }
};

// 5. Product Attributes Table
const createProductAttributesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_attributes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        category_attribute_id INT NOT NULL,
        attribute_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_attribute_id) REFERENCES category_attributes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_attribute (product_id, category_attribute_id),
        INDEX idx_product (product_id),
        INDEX idx_attribute (category_attribute_id)
      )
    `);

    console.log("✅ Product attributes table created successfully");
  } catch (error) {
    console.error("Product Attributes Table Error:", error.message);
  }
};

// 6. Enhanced Product Variations Table
const createEnhancedProductVariationsTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        variation_name VARCHAR(200) NOT NULL,
        
        -- Pricing
        cost_price DECIMAL(12,2),
        selling_price DECIMAL(12,2),
        compare_at_price DECIMAL(12,2),
        
        -- Stock for this variation
        stock_quantity INT DEFAULT 0,
        reserved_quantity INT DEFAULT 0,
        available_quantity INT GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
        
        -- Supplier info for dropship variations
        supplier_variation_id VARCHAR(100),
        supplier_sku VARCHAR(100),
        
        -- Physical attributes
        weight DECIMAL(8,2),
        length DECIMAL(8,2),
        width DECIMAL(8,2),
        height DECIMAL(8,2),
        
        -- Status
        is_available BOOLEAN DEFAULT TRUE,
        is_default BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_sku (sku),
        INDEX idx_product (product_id),
        INDEX idx_availability (is_available),
        INDEX idx_default (is_default)
      )
    `);

    console.log("✅ Enhanced product variations table created successfully");
  } catch (error) {
    console.error("Enhanced Product Variations Table Error:", error.message);
  }
};

// 7. Product Variation Attributes Table
const createProductVariationAttributesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_variation_attributes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        variation_id INT NOT NULL,
        category_attribute_id INT NOT NULL,
        attribute_value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
        FOREIGN KEY (category_attribute_id) REFERENCES category_attributes(id) ON DELETE CASCADE,
        UNIQUE KEY unique_variation_attribute (variation_id, category_attribute_id),
        INDEX idx_variation (variation_id),
        INDEX idx_attribute (category_attribute_id)
      )
    `);

    console.log("✅ Product variation attributes table created successfully");
  } catch (error) {
    console.error("Product Variation Attributes Table Error:", error.message);
  }
};

// 8. Enhanced Pricing Table with tier support
const createEnhancedPricesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        variation_id INT NOT NULL,
        price_type ENUM('regular', 'sale', 'wholesale', 'tier1', 'tier2', 'tier3') DEFAULT 'regular',
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        min_quantity INT DEFAULT 1,
        max_quantity INT DEFAULT NULL,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_to TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
        INDEX idx_variation_price (variation_id, price_type, is_active),
        INDEX idx_active_prices (is_active, valid_from, valid_to)
      )
    `);

    console.log("✅ Enhanced prices table created successfully");
  } catch (error) {
    console.error("Enhanced Prices Table Error:", error.message);
  }
};

// 9. Enhanced Product Images Table
const createEnhancedProductImagesTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        variation_id INT DEFAULT NULL,
        image_url VARCHAR(800) NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INT DEFAULT 0,
        image_type ENUM('main', 'gallery', 'thumbnail', '360', 'video_thumbnail') DEFAULT 'gallery',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
        INDEX idx_product_images (product_id, variation_id),
        INDEX idx_primary (is_primary),
        INDEX idx_sort (sort_order)
      )
    `);

    console.log("✅ Enhanced product images table created successfully");
  } catch (error) {
    console.error("Enhanced Product Images Table Error:", error.message);
  }
};

// 10. Enhanced Cart Table
const createEnhancedCartTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        variation_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
        unit_price DECIMAL(12,2) NOT NULL,
        total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES shoping_users(id) ON DELETE CASCADE,
        FOREIGN KEY (variation_id) REFERENCES product_variations(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_variation (user_id, variation_id),
        INDEX idx_user (user_id)
      )
    `);

    console.log("✅ Enhanced cart table created successfully");
  } catch (error) {
    console.error("Enhanced Cart Table Error:", error.message);
  }
};

// 11. Product Search Index Table for better search performance
const createProductSearchIndexTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_search_index (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        search_text TEXT NOT NULL,
        category_path VARCHAR(500),
        brand VARCHAR(100),
        attributes_text TEXT,
        price_min DECIMAL(12,2),
        price_max DECIMAL(12,2),
        is_available BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product (product_id),
        FULLTEXT(search_text, attributes_text),
        INDEX idx_price_range (price_min, price_max),
        INDEX idx_availability (is_available)
      )
    `);

    console.log("✅ Product search index table created successfully");
  } catch (error) {
    console.error("Product Search Index Table Error:", error.message);
  }
};

// 12. Product Analytics Table for tracking views, sales, etc.
const createProductAnalyticsTable = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    await conn.query(`
      CREATE TABLE IF NOT EXISTS product_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        date DATE NOT NULL,
        views INT DEFAULT 0,
        cart_additions INT DEFAULT 0,
        purchases INT DEFAULT 0,
        revenue DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_product_date (product_id, date),
        INDEX idx_date (date),
        INDEX idx_views (views),
        INDEX idx_purchases (purchases)
      )
    `);

    console.log("✅ Product analytics table created successfully");
  } catch (error) {
    console.error("Product Analytics Table Error:", error.message);
  }
};

// 13. Initialize predefined categories and attributes
const initializePredefinedData = async () => {
  try {
    const conn = await DbConnection({ timeout: 10000 });

    // Insert main categories
    await conn.query(`
      INSERT IGNORE INTO categories (name, description, slug, sort_order) VALUES
      ('Electronics', 'Electronic devices and accessories', 'electronics', 1),
      ('Clothing & Fashion', 'Apparel and fashion items', 'clothing-fashion', 2),
      ('Home & Kitchen', 'Home appliances and kitchen items', 'home-kitchen', 3),
      ('Books & Media', 'Books, movies, music and educational materials', 'books-media', 4),
      ('Sports & Fitness', 'Sports equipment and fitness accessories', 'sports-fitness', 5),
      ('Beauty & Personal Care', 'Beauty and personal care products', 'beauty-personal-care', 6),
      ('Automotive', 'Vehicle parts and automotive accessories', 'automotive', 7),
      ('Health & Wellness', 'Health supplements and wellness products', 'health-wellness', 8)
    `);

    // Insert subcategories for Electronics
    const [electronics] = await conn.query("SELECT id FROM categories WHERE slug = 'electronics'");
    if (electronics.length > 0) {
      const electronicsId = electronics[0].id;
      
      await conn.query(`
        INSERT IGNORE INTO categories (name, description, slug, parent_id, sort_order) VALUES
        ('Mobile Phones', 'Smartphones and mobile devices', 'mobile-phones', ?, 1),
        ('Laptops & Computers', 'Laptops, desktops and computer accessories', 'laptops-computers', ?, 2),
        ('Tablets', 'Tablets and e-readers', 'tablets', ?, 3),
        ('Headphones & Audio', 'Headphones, speakers and audio equipment', 'headphones-audio', ?, 4),
        ('Cameras', 'Digital cameras and photography equipment', 'cameras', ?, 5),
        ('Gaming', 'Gaming consoles and accessories', 'gaming', ?, 6),
        ('Wearables', 'Smartwatches and fitness trackers', 'wearables', ?, 7),
        ('Home Electronics', 'TVs, home theater and smart home devices', 'home-electronics', ?, 8)
      `, [electronicsId, electronicsId, electronicsId, electronicsId, electronicsId, electronicsId, electronicsId, electronicsId]);
    }

    // Insert subcategories for Clothing
    const [clothing] = await conn.query("SELECT id FROM categories WHERE slug = 'clothing-fashion'");
    if (clothing.length > 0) {
      const clothingId = clothing[0].id;
      
      await conn.query(`
        INSERT IGNORE INTO categories (name, description, slug, parent_id, sort_order) VALUES
        ('Men Clothing', 'Men apparel and accessories', 'men-clothing', ?, 1),
        ('Women Clothing', 'Women apparel and accessories', 'women-clothing', ?, 2),
        ('Kids Clothing', 'Children clothing and accessories', 'kids-clothing', ?, 3),
        ('Footwear', 'Shoes, sandals and footwear', 'footwear', ?, 4),
        ('Bags & Luggage', 'Handbags, backpacks and luggage', 'bags-luggage', ?, 5),
        ('Jewelry & Watches', 'Jewelry, watches and accessories', 'jewelry-watches', ?, 6)
      `, [clothingId, clothingId, clothingId, clothingId, clothingId, clothingId]);
    }

    console.log("✅ Predefined categories initialized successfully");

    // Initialize category attributes for Mobile Phones
    const [mobilePhones] = await conn.query("SELECT id FROM categories WHERE slug = 'mobile-phones'");
    if (mobilePhones.length > 0) {
      const mobileId = mobilePhones[0].id;
      
      await conn.query(`
        INSERT IGNORE INTO category_attributes (category_id, attribute_name, attribute_type, is_required, is_filterable, is_searchable, options, unit, display_order) VALUES
        (?, 'RAM', 'select', TRUE, TRUE, TRUE, '["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB", "32GB"]', 'GB', 1),
        (?, 'Storage', 'select', TRUE, TRUE, TRUE, '["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB"]', 'GB', 2),
        (?, 'Display Size', 'decimal', TRUE, TRUE, TRUE, NULL, 'inches', 3),
        (?, 'Display Resolution', 'select', FALSE, TRUE, FALSE, '["HD", "HD+", "Full HD", "Full HD+", "2K", "QHD", "4K"]', NULL, 4),
        (?, 'Processor', 'text', TRUE, FALSE, TRUE, NULL, NULL, 5),
        (?, 'Processor Brand', 'select', TRUE, TRUE, FALSE, '["Qualcomm", "MediaTek", "Samsung Exynos", "Apple", "Unisoc", "HiSilicon Kirin"]', NULL, 6),
        (?, 'Operating System', 'select', TRUE, TRUE, FALSE, '["Android", "iOS", "Windows", "Other"]', NULL, 7),
        (?, 'Rear Camera', 'text', FALSE, TRUE, FALSE, NULL, 'MP', 8),
        (?, 'Front Camera', 'number', FALSE, TRUE, FALSE, NULL, 'MP', 9),
        (?, 'Battery Capacity', 'number', FALSE, TRUE, FALSE, NULL, 'mAh', 10),
        (?, 'Color', 'select', TRUE, TRUE, FALSE, '["Black", "White", "Gold", "Silver", "Blue", "Red", "Green", "Purple", "Pink", "Rose Gold", "Space Gray", "Midnight", "Starlight"]', NULL, 11),
        (?, '5G Support', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 12),
        (?, 'Dual SIM', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 13),
        (?, 'Fast Charging', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 14),
        (?, 'Wireless Charging', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 15),
        (?, 'Water Resistance', 'select', FALSE, TRUE, FALSE, '["IP54", "IP67", "IP68", "None"]', NULL, 16),
        (?, 'Fingerprint Scanner', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 17),
        (?, 'Face Unlock', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 18)
      `, Array(18).fill(mobileId));
    }

    // Initialize category attributes for Laptops
    const [laptops] = await conn.query("SELECT id FROM categories WHERE slug = 'laptops-computers'");
    if (laptops.length > 0) {
      const laptopId = laptops[0].id;
      
      await conn.query(`
        INSERT IGNORE INTO category_attributes (category_id, attribute_name, attribute_type, is_required, is_filterable, is_searchable, options, unit, display_order) VALUES
        (?, 'RAM', 'select', TRUE, TRUE, TRUE, '["4GB", "8GB", "16GB", "32GB", "64GB", "128GB"]', 'GB', 1),
        (?, 'Storage Type', 'select', TRUE, TRUE, FALSE, '["HDD", "SSD", "eMMC", "Hybrid (HDD+SSD)"]', NULL, 2),
        (?, 'Storage Capacity', 'select', TRUE, TRUE, TRUE, '["128GB", "256GB", "512GB", "1TB", "2TB", "4TB"]', 'GB', 3),
        (?, 'Processor Brand', 'select', TRUE, TRUE, FALSE, '["Intel", "AMD", "Apple", "Qualcomm"]', NULL, 4),
        (?, 'Processor Series', 'text', TRUE, FALSE, TRUE, NULL, NULL, 5),
        (?, 'Graphics Card', 'text', FALSE, TRUE, FALSE, NULL, NULL, 6),
        (?, 'Graphics Type', 'select', FALSE, TRUE, FALSE, '["Integrated", "Dedicated", "Hybrid"]', NULL, 7),
        (?, 'Display Size', 'decimal', TRUE, TRUE, TRUE, NULL, 'inches', 8),
        (?, 'Display Resolution', 'select', FALSE, TRUE, FALSE, '["HD", "Full HD", "2K", "4K", "Retina"]', NULL, 9),
        (?, 'Display Type', 'select', FALSE, TRUE, FALSE, '["LCD", "LED", "OLED", "IPS", "TN"]', NULL, 10),
        (?, 'Operating System', 'select', TRUE, TRUE, FALSE, '["Windows 10", "Windows 11", "macOS", "Linux", "Chrome OS", "DOS"]', NULL, 11),
        (?, 'Weight', 'decimal', FALSE, TRUE, FALSE, NULL, 'kg', 12),
        (?, 'Battery Life', 'number', FALSE, TRUE, FALSE, NULL, 'hours', 13),
        (?, 'Keyboard Type', 'select', FALSE, TRUE, FALSE, '["Standard", "Backlit", "RGB Backlit", "Chiclet"]', NULL, 14),
        (?, 'Touchscreen', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 15),
        (?, 'Convertible', 'boolean', FALSE, TRUE, FALSE, NULL, NULL, 16),
        (?, 'Color', 'select', TRUE, TRUE, FALSE, '["Black", "Silver", "Gold", "Space Gray", "Blue", "Red", "White", "Rose Gold"]', NULL, 17)
      `, Array(17).fill(laptopId));
    }

    // Initialize category attributes for Clothing
    const [menClothing] = await conn.query("SELECT id FROM categories WHERE slug = 'men-clothing'");
    const [womenClothing] = await conn.query("SELECT id FROM categories WHERE slug = 'women-clothing'");
    
    const clothingIds = [];
    if (menClothing.length > 0) clothingIds.push(menClothing[0].id);
    if (womenClothing.length > 0) clothingIds.push(womenClothing[0].id);

    for (const clothingId of clothingIds) {
      await conn.query(`
        INSERT IGNORE INTO category_attributes (category_id, attribute_name, attribute_type, is_required, is_filterable, is_searchable, options, unit, display_order) VALUES
        (?, 'Size', 'select', TRUE, TRUE, FALSE, '["XS", "S", "M", "L", "XL", "XXL", "XXXL", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46"]', NULL, 1),
        (?, 'Color', 'select', TRUE, TRUE, FALSE, '["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Gray", "Brown", "Navy", "Maroon", "Olive", "Beige", "Cream"]', NULL, 2),
        (?, 'Material', 'select', TRUE, TRUE, FALSE, '["Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Leather", "Synthetic", "Blend", "Viscose", "Rayon", "Spandex"]', NULL, 3),
        (?, 'Fit', 'select', FALSE, TRUE, FALSE, '["Regular", "Slim", "Loose", "Skinny", "Relaxed", "Comfort", "Athletic"]', NULL, 4),
        (?, 'Pattern', 'select', FALSE, TRUE, FALSE, '["Solid", "Striped", "Checked", "Printed", "Floral", "Abstract", "Geometric", "Polka Dots"]', NULL, 5),
        (?, 'Sleeve Type', 'select', FALSE, TRUE, FALSE, '["Full Sleeve", "Half Sleeve", "Sleeveless", "3/4 Sleeve", "Cap Sleeve"]', NULL, 6),
        (?, 'Neck Type', 'select', FALSE, TRUE, FALSE, '["Round Neck", "V-Neck", "Crew Neck", "Turtle Neck", "Polo Neck", "Boat Neck", "Off Shoulder"]', NULL, 7),
        (?, 'Occasion', 'multiselect', FALSE, TRUE, FALSE, '["Casual", "Formal", "Party", "Wedding", "Work", "Sports", "Beach", "Travel"]', NULL, 8),
        (?, 'Season', 'multiselect', FALSE, TRUE, FALSE, '["Spring", "Summer", "Monsoon", "Winter", "All Season"]', NULL, 9),
        (?, 'Care Instructions', 'textarea', FALSE, FALSE, FALSE, NULL, NULL, 10)
      `, Array(10).fill(clothingId));
    }

    console.log("✅ Category attributes initialized successfully");

  } catch (error) {
    console.error("Initialize Predefined Data Error:", error.message);
  }
};

// Master function to create all enhanced tables
const createAllEnhancedTables = async () => {
  try {
    console.log("🚀 Creating enhanced database schema...");
    
    // Create tables in proper order due to foreign key dependencies
    await createEnhancedCategoryTable();
    await createSuppliersTable();
    await createEnhancedCategoryAttributesTable();
    await createEnhancedProductsTable();
    await createProductAttributesTable();
    await createEnhancedProductVariationsTable();
    await createProductVariationAttributesTable();
    await createEnhancedPricesTable();
    await createEnhancedProductImagesTable();
    await createEnhancedCartTable();
    await createProductSearchIndexTable();
    await createProductAnalyticsTable();
    
    // Initialize predefined data
    await initializePredefinedData();
    
    console.log("✅ All enhanced tables created successfully!");
    console.log("🎉 Professional product management system is ready!");
    
  } catch (error) {
    console.error("❌ Error creating enhanced tables:", error.message);
  }
};

module.exports = {
  createEnhancedCategoryTable,
  createSuppliersTable,
  createEnhancedCategoryAttributesTable,
  createEnhancedProductsTable,
  createProductAttributesTable,
  createEnhancedProductVariationsTable,
  createProductVariationAttributesTable,
  createEnhancedPricesTable,
  createEnhancedProductImagesTable,
  createEnhancedCartTable,
  createProductSearchIndexTable,
  createProductAnalyticsTable,
  initializePredefinedData,
  createAllEnhancedTables
};