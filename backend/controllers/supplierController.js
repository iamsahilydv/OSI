const createConnectionDb = require("../config/pool");

/**
 * Create Supplier Controller
 */
const createSupplierController = async (req, res) => {
  try {
    const {
      name,
      company_name,
      email,
      phone,
      website,
      address = {},
      api_config = {},
      terms = {},
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and email are required",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });

    // Check for duplicate email
    const [existingSupplier] = await conn.query(
      "SELECT id FROM suppliers WHERE email = ?",
      [email]
    );

    if (existingSupplier.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Supplier with this email already exists",
      });
    }

    // Insert supplier
    const [result] = await conn.query(
      `
      INSERT INTO suppliers (
        name, company_name, email, phone, website,
        address_line1, address_line2, city, state, country, postal_code,
        api_endpoint, api_key, api_secret, api_config,
        commission_rate, minimum_order_amount, shipping_cost, processing_time_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        company_name,
        email,
        phone,
        website,
        address.address_line1,
        address.address_line2,
        address.city,
        address.state,
        address.country,
        address.postal_code,
        api_config.api_endpoint,
        api_config.api_key,
        api_config.api_secret,
        JSON.stringify(api_config.config || {}),
        terms.commission_rate || 0,
        terms.minimum_order_amount || 0,
        terms.shipping_cost || 0,
        terms.processing_time_days || 1,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: { supplier_id: result.insertId },
    });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create supplier",
    });
  }
};

/**
 * Get All Suppliers Controller
 */
const getAllSuppliersController = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, is_active = true } = req.query;

    const offset = (page - 1) * limit;
    const conn = await createConnectionDb({ timeout: 10000 });

    let whereConditions = ["is_active = ?"];
    let queryParams = [is_active];

    if (search) {
      whereConditions.push(
        "(name LIKE ? OR company_name LIKE ? OR email LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Get suppliers with product count
    const [suppliers] = await conn.query(
      `
      SELECT 
        s.*,
        COUNT(p.id) as product_count,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_products
      FROM suppliers s
      LEFT JOIN products p ON s.id = p.supplier_id
      WHERE ${whereClause}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await conn.query(
      `
      SELECT COUNT(*) as total FROM suppliers WHERE ${whereClause}
    `,
      queryParams
    );

    const total = countResult[0].total;

    return res.status(200).json({
      success: true,
      data: {
        suppliers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get Suppliers Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch suppliers",
    });
  }
};

/**
 * Get Supplier by ID Controller
 */
const getSupplierByIdController = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const conn = await createConnectionDb({ timeout: 10000 });

    // Get supplier details
    const [supplierResult] = await conn.query(
      "SELECT * FROM suppliers WHERE id = ?",
      [supplierId]
    );

    if (supplierResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplier = supplierResult[0];

    // Get supplier's products
    const [products] = await conn.query(
      `
      SELECT 
        p.id, p.name, p.sku, p.status, p.supplier_sku, p.supplier_price,
        COUNT(pv.id) as variation_count,
        MIN(pr.amount) as min_price,
        MAX(pr.amount) as max_price
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE
      WHERE p.supplier_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
      [supplierId]
    );

    // Parse API config
    let apiConfig = {};
    try {
      apiConfig = JSON.parse(supplier.api_config || "{}");
    } catch (e) {
      apiConfig = {};
    }

    return res.status(200).json({
      success: true,
      data: {
        ...supplier,
        api_config: apiConfig,
        products,
        product_count: products.length,
      },
    });
  } catch (error) {
    console.error("Get Supplier By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supplier",
    });
  }
};

/**
 * Update Supplier Controller
 */
const updateSupplierController = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const updates = req.body;

    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if supplier exists
    const [supplierCheck] = await conn.query(
      "SELECT id FROM suppliers WHERE id = ?",
      [supplierId]
    );

    if (supplierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];

    const allowedFields = [
      "name",
      "company_name",
      "email",
      "phone",
      "website",
      "address_line1",
      "address_line2",
      "city",
      "state",
      "country",
      "postal_code",
      "api_endpoint",
      "api_key",
      "api_secret",
      "commission_rate",
      "minimum_order_amount",
      "shipping_cost",
      "processing_time_days",
      "is_active",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    // Handle api_config separately
    if (updates.api_config) {
      updateFields.push("api_config = ?");
      updateValues.push(JSON.stringify(updates.api_config));
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    updateValues.push(supplierId);

    await conn.query(
      `
      UPDATE suppliers 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `,
      updateValues
    );

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
    });
  } catch (error) {
    console.error("Update Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update supplier",
    });
  }
};

/**
 * Delete Supplier Controller
 */
const deleteSupplierController = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if supplier has associated products
    const [productCount] = await conn.query(
      "SELECT COUNT(*) as count FROM products WHERE supplier_id = ?",
      [supplierId]
    );

    if (productCount[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete supplier with associated products. Please reassign or delete products first.",
      });
    }

    // Delete supplier
    const [result] = await conn.query("DELETE FROM suppliers WHERE id = ?", [
      supplierId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete Supplier Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete supplier",
    });
  }
};

/**
 * Sync Products from Supplier API
 * This function can be used to automatically import products from supplier's API
 */
const syncSupplierProductsController = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { force_update = false } = req.body;

    const conn = await createConnectionDb({ timeout: 10000 });

    // Get supplier details
    const [supplierResult] = await conn.query(
      "SELECT * FROM suppliers WHERE id = ? AND is_active = TRUE",
      [supplierId]
    );

    if (supplierResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Active supplier not found",
      });
    }

    const supplier = supplierResult[0];

    if (!supplier.api_endpoint || !supplier.api_key) {
      return res.status(400).json({
        success: false,
        message: "Supplier API configuration is incomplete",
      });
    }

    // This is a placeholder for actual API integration
    // You would implement the actual API calls based on the supplier's API specification
    const syncResults = {
      processed: 0,
      imported: 0,
      updated: 0,
      errors: [],
    };

    // Example API call structure (implement based on supplier's API)
    /*
    try {
      const response = await fetch(supplier.api_endpoint + '/products', {
        headers: {
          'Authorization': `Bearer ${supplier.api_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const supplierProducts = await response.json();
      
      for (const supplierProduct of supplierProducts) {
        try {
          // Check if product already exists
          const [existingProduct] = await conn.query(
            "SELECT id FROM products WHERE supplier_id = ? AND supplier_sku = ?",
            [supplierId, supplierProduct.sku]
          );
          
          if (existingProduct.length > 0 && !force_update) {
            syncResults.processed++;
            continue;
          }
          
          // Import or update product logic here
          // This would involve creating/updating products, variations, prices, etc.
          
          if (existingProduct.length > 0) {
            syncResults.updated++;
          } else {
            syncResults.imported++;
          }
          syncResults.processed++;
          
        } catch (productError) {
          syncResults.errors.push({
            sku: supplierProduct.sku,
            error: productError.message
          });
        }
      }
      
    } catch (apiError) {
      throw new Error(`API Error: ${apiError.message}`);
    }
    */

    return res.status(200).json({
      success: true,
      message: "Supplier products sync completed",
      data: syncResults,
    });
  } catch (error) {
    console.error("Sync Supplier Products Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to sync supplier products",
    });
  }
};

/**
 * Get Supplier Analytics
 */
const getSupplierAnalyticsController = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const {
      start_date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      end_date = new Date().toISOString().split("T")[0],
    } = req.query;

    const conn = await createConnectionDb({ timeout: 10000 });

    // Verify supplier exists
    const [supplierCheck] = await conn.query(
      "SELECT name FROM suppliers WHERE id = ?",
      [supplierId]
    );

    if (supplierCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    // Get product performance analytics
    const [productAnalytics] = await conn.query(
      `
      SELECT 
        COUNT(p.id) as total_products,
        COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_products,
        COUNT(CASE WHEN p.status = 'out_of_stock' THEN 1 END) as out_of_stock_products,
        AVG(pr.amount) as avg_price,
        MIN(pr.amount) as min_price,
        MAX(pr.amount) as max_price
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE
      WHERE p.supplier_id = ?
    `,
      [supplierId]
    );

    // Get sales analytics (if you have orders data)
    const [salesAnalytics] = await conn.query(
      `
      SELECT 
        COUNT(DISTINCT og.id) as total_orders,
        SUM(o.qty) as total_quantity_sold,
        SUM(o.price * o.qty) as total_revenue,
        AVG(o.price) as avg_order_value
      FROM order_groups og
      JOIN orders o ON og.id = o.order_group_id
      JOIN product_variations pv ON o.variation_id = pv.id
      JOIN products p ON pv.product_id = p.id
      WHERE p.supplier_id = ? 
      AND og.created_at BETWEEN ? AND ?
      AND og.pymentStatus = TRUE
    `,
      [supplierId, start_date, end_date]
    );

    // Get top performing products
    const [topProducts] = await conn.query(
      `
      SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(o.id) as order_count,
        SUM(o.qty) as quantity_sold,
        SUM(o.price * o.qty) as revenue
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      LEFT JOIN orders o ON pv.id = o.variation_id
      LEFT JOIN order_groups og ON o.order_group_id = og.id
      WHERE p.supplier_id = ? 
      AND og.pymentStatus = TRUE
      AND og.created_at BETWEEN ? AND ?
      GROUP BY p.id, p.name, p.sku
      ORDER BY revenue DESC
      LIMIT 10
    `,
      [supplierId, start_date, end_date]
    );

    return res.status(200).json({
      success: true,
      data: {
        supplier_name: supplierCheck[0].name,
        period: { start_date, end_date },
        product_analytics: productAnalytics[0],
        sales_analytics: salesAnalytics[0],
        top_products: topProducts,
      },
    });
  } catch (error) {
    console.error("Get Supplier Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supplier analytics",
    });
  }
};

module.exports = {
  createSupplierController,
  getAllSuppliersController,
  getSupplierByIdController,
  updateSupplierController,
  deleteSupplierController,
  syncSupplierProductsController,
  getSupplierAnalyticsController,
};
