// const createConnectionDb = require("../config/pool");
// const {
//   getProductFeaturesByProductId,
//   getCustomerReviewsByProductId,
//   getProductSpecifications,
// } = require("../helpers/productHelper");
// const {
//   validateProductVariations,
//   formatVariationsForDisplay,
// } = require("../helpers/categoryHelper");
// const fs = require("fs");
// const path = require("path");
// const { v4: uuidv4 } = require("uuid");
// const DbConnection = require("../config/pool");

// const registerProductController = async (req, res) => {
//   const {
//     name,
//     description,
//     qty = 1,
//     category_id,
//     brand,
//     sellby,
//     is_pod = false,
//     productImages = [],
//     variations = [],
//   } = req.body;

//   if (!name || !description || !category_id || !brand || !sellby) {
//     return res.status(400).json({
//       status: 400,
//       message: "All required fields must be filled",
//     });
//   }

//   // Validate variations if provided
//   if (Array.isArray(variations) && variations.length > 0) {
//     const validation = await validateProductVariations(category_id, variations);
//     if (!validation.isValid) {
//       return res.status(400).json({
//         status: 400,
//         message: "Variation validation failed",
//         errors: validation.errors,
//       });
//     }
//   }

//   const pool = await DbConnection();
//   const conn = await pool.getConnection();

//   try {
//     await conn.beginTransaction();

//     const [existing] = await conn.query(
//       "SELECT id FROM products WHERE name = ?",
//       [name]
//     );
//     if (existing.length > 0) {
//       await conn.rollback();
//       return res.status(409).json({
//         status: 409,
//         message: "Product with the same name already exists",
//       });
//     }

//     const [productResult] = await conn.query(
//       `INSERT INTO products (name, qty, category_id, brand, sellby, description, is_pod)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [name, qty, category_id, brand, sellby, description, is_pod]
//     );
//     const product_id = productResult.insertId;

//     const imageDir = path.join(__dirname, "../image");
//     if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

//     const baseURL =
//       process.env.ENVIRONMENT === "development"
//         ? "http://localhost:8080/"
//         : "https://api.onestepindia.in/";

//     const uploadedColorImages = new Set();

//     if (Array.isArray(variations) && variations.length > 0) {
//       for (const variation of variations) {
//         const {
//           sku,
//           variation_name,
//           attributes = {},
//           qikink_sku = null,
//           qikink_price = null,
//           selling_price = null,
//           stock_quantity = 0,
//           is_available = true,
//           print_type_id = null,
//           design_code = null,
//           design_link = null,
//           mockup_link = null,
//           placement_sku = null,
//           price = {},
//           images = [],
//         } = variation;

//         if (!sku || !variation_name) {
//           await conn.rollback();
//           return res.status(400).json({
//             status: 400,
//             message: "Each variation must include SKU and variation_name",
//           });
//         }

//         const [variationResult] = await conn.query(
//           `INSERT INTO product_variations
//             (product_id, sku, variation_name, attributes, selling_price, stock_quantity, is_available)
//            VALUES (?, ?, ?, ?, ?, ?, ?)`,
//           [
//             product_id,
//             sku,
//             variation_name,
//             JSON.stringify(attributes),
//             selling_price,
//             stock_quantity,
//             is_available,
//           ]
//         );
//         const variation_id = variationResult.insertId;

//         if (qikink_sku) {
//           await conn.query(
//             `INSERT INTO qikink_pod_details
//               (product_id, variation_id, qikink_sku, qikink_price, print_type_id,
//                design_code, design_link, mockup_link, placement_sku, selling_price)
//              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//             [
//               product_id,
//               variation_id,
//               qikink_sku,
//               qikink_price,
//               print_type_id,
//               design_code,
//               design_link,
//               mockup_link,
//               placement_sku,
//               selling_price,
//             ]
//           );
//         }

//         if (price.original) {
//           await conn.query(
//             `INSERT INTO prices (variation_id, original, discount_percentage, currency)
//              VALUES (?, ?, ?, ?)`,
//             [
//               variation_id,
//               price.original,
//               price.discount_percentage || 0,
//               price.currency || "INR",
//             ]
//           );
//         }

//         const variationKey = `${product_id}_${sku}`;
//         if (!uploadedColorImages.has(variationKey)) {
//           for (const base64Img of images) {
//             const filename = `${sku}_${uuidv4()}.png`;
//             const filepath = path.join(imageDir, filename);
//             fs.writeFileSync(filepath, Buffer.from(base64Img, "base64"));
//             const imageUrl = `${baseURL}image/${filename}`;

//             await conn.query(
//               `INSERT INTO product_images (product_id, variation_id, image_url)
//                VALUES (?, ?, ?)`,
//               [product_id, variation_id, imageUrl]
//             );
//           }
//           uploadedColorImages.add(variationKey);
//         }
//       }
//     } else {
//       for (const base64Img of productImages) {
//         const filename = `${name.replace(/\s+/g, "_")}_${uuidv4()}.png`;
//         const filepath = path.join(imageDir, filename);
//         fs.writeFileSync(filepath, Buffer.from(base64Img, "base64"));
//         const imageUrl = `${baseURL}image/${filename}`;

//         await conn.query(
//           `INSERT INTO product_images (product_id, variation_id, image_url)
//            VALUES (?, NULL, ?)`,
//           [product_id, imageUrl]
//         );
//       }
//     }

//     await conn.commit();
//     return res.status(201).json({
//       status: 201,
//       message: "Product registered successfully",
//       product_id,
//     });
//   } catch (error) {
//     await conn.rollback();
//     console.error("\u274C Product Registration Error:", error);
//     return res.status(500).json({
//       status: 500,
//       message: "Server error. All changes reverted.",
//       error: error.message,
//     });
//   } finally {
//     conn.release();
//   }
// };

// const searchProductsController = async (req, res) => {
//   const query = req.body.query;

//   if (!query) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Missing search term." });
//   }

//   try {
//     const conn = await createConnectionDb({ timeout: 10000 });

//     const [searchResults] = await conn.query(
//       `
//       SELECT p.*, i.image_url, pr.id AS price_id, pr.current, pr.original, pr.discountPercentage, pr.currency, c.name AS category_name
//       FROM products AS p
//       LEFT JOIN product_img AS i ON p.id = i.product_id
//       LEFT JOIN prices AS pr ON p.id = pr.product_id
//       LEFT JOIN categories AS c ON p.category_id = c.id
//       WHERE
//         p.name LIKE ? OR
//         c.name LIKE ? OR
//         p.brand LIKE ? OR
//         pr.current LIKE ? OR
//         pr.original LIKE ?
//     `,
//       [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
//     );

//     const products = searchResults.reduce((result, row) => {
//       const existingProduct = result.find((product) => product.id === row.id);
//       if (!existingProduct) {
//         result.push({
//           id: row.id,
//           name: row.name,
//           qty: row.qty,
//           category: row.category_name,
//           brand: row.brand,
//           sellby: row.sellby,
//           images: row.image_url ? [row.image_url] : [],
//           prices: row.price_id
//             ? [
//                 {
//                   id: row.price_id,
//                   current: row.current,
//                   original: row.original,
//                   discountPercentage: row.discountPercentage,
//                   currency: row.currency,
//                 },
//               ]
//             : [],
//         });
//       } else if (row.image_url) {
//         existingProduct.images.push(row.image_url);
//       } else if (row.price_id) {
//         existingProduct.prices.push({
//           id: row.price_id,
//           current: row.current,
//           original: row.original,
//           discountPercentage: row.discountPercentage,
//           currency: row.currency,
//         });
//       }
//       return result;
//     }, []);

//     if (products.length == 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Data is not found!" });
//     }

//     return res.status(200).json({ success: true, data: products });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || error.messages || "something went wrong!",
//     });
//   }
// };

// const getImageController = async (req, res) => {
//   try {
//     const imageName = req.params.imageName;
//     const imagePath = path.join(
//       __dirname,
//       "..",
//       "Product_Img",
//       "images",
//       imageName
//     );

//     // Check if the image file exists
//     fs.access(imagePath, fs.constants.F_OK, (err) => {
//       if (err) {
//         return res.status(404).json({ message: "Image not found" });
//       }
//       // If the file exists, send it
//       return res.sendFile(imagePath);
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message || error.messages || "something went wrong!",
//     });
//   }
// };

// const updateProductController = async (req, res) => {
//   const { id, name, img, price, category, qty, sellby } = req.body;
//   if (!id) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Product ID is required!" });
//   }

//   try {
//     const conn = await createConnectionDb({ timeout: 10000 });
//     //check product is exist or not
//     const [existingProduct] = await conn.query(
//       "SELECT * FROM products WHERE id = ? LIMIT 1",
//       id
//     );
//     if (existingProduct.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found!" });
//     }

//     const updateFields = {};
//     if (name) {
//       updateFields.name = name;
//     }
//     if (img) {
//       updateFields.img = img;
//     }
//     if (price) {
//       updateFields.price = price;
//     }
//     if (category) {
//       updateFields.category = category;
//     }
//     if (qty !== undefined) {
//       updateFields.qty = qty;
//     }
//     if (sellby) {
//       updateFields.sellby = sellby;
//     }

//     if (Object.keys(updateFields).length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "No update fields provided!" });
//     }

//     await conn.query("UPDATE products SET ? WHERE id = ?", [updateFields, id]);

//     return res.status(200).json({
//       success: true,
//       message: "Product updated successfully!",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || error.messages || "something went wrong!",
//     });
//   }
// };

// const getAllProductsController = async (req, res) => {
//   try {
//     const conn = await createConnectionDb({ timeout: 10000 });

//     // 1. Get all products with category info
//     const [products] = await conn.query(`
//       SELECT
//         p.id, p.name, p.qty, p.brand, p.sellby, p.description, p.is_pod,
//         c.id AS categoryId, c.name AS category
//       FROM products AS p
//       LEFT JOIN categories AS c ON p.category_id = c.id
//       ORDER BY p.id DESC;
//     `);

//     // 2. Get all product images
//     const [images] = await conn.query(`
//       SELECT product_id, variation_id, image_url FROM product_images;
//     `);

//     // 3. Get all product variations
//     const [variations] = await conn.query(`
//       SELECT * FROM product_variations;
//     `);

//     // 4. Get all Qikink POD details
//     const [qikinkDetails] = await conn.query(`
//       SELECT * FROM qikink_pod_details;
//     `);

//     // 5. Get all prices (for versioned price history)
//     const [prices] = await conn.query(`
//       SELECT * FROM prices ORDER BY created_at DESC;
//     `);

//     // 6. Build variation-image map
//     const productVariationImageMap = {}; // key = `${product_id}_${variation_id}`

//     images.forEach((img) => {
//       const variationKey = `${img.product_id}_${img.variation_id}`;
//       if (!productVariationImageMap[variationKey]) {
//         productVariationImageMap[variationKey] = [];
//       }
//       productVariationImageMap[variationKey].push(img.image_url);
//     });

//     // 7. Compose full product data
//     const fullProducts = products.map((product) => {
//       const defaultImages =
//         productVariationImageMap[`${product.id}_default`] || [];

//       const productVariations = variations
//         .filter((v) => v.product_id === product.id)
//         .map((v) => {
//           const variationKey = `${product.id}_${v.id}`;
//           const variationImages =
//             productVariationImageMap[variationKey] || defaultImages;

//           const qikink = qikinkDetails.find((q) => q.variation_id === v.id);

//           const variationPrices = prices.filter((p) => p.variation_id === v.id);

//           return {
//             ...v,
//             attributes:
//               typeof v.attributes === "string"
//                 ? JSON.parse(v.attributes)
//                 : v.attributes,
//             images: variationImages,
//             qikink_details: qikink || null,
//             prices: variationPrices, // entire history
//             latest_price: variationPrices[0]?.amount || null, // latest price
//           };
//         });

//       return {
//         ...product,
//         images: defaultImages, // for product-level fallback
//         variations: productVariations,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       data: fullProducts,
//     });
//   } catch (error) {
//     console.error("getAllProductsController error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong!",
//     });
//   }
// };

// const deleteProductController = async (req, res) => {
//   const { productId } = req.body;
//   if (!productId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Please provide productId" });
//   }

//   let conn;
//   try {
//     conn = await createConnectionDb({ timeout: 10000 });

//     // Check if product exists
//     const [product] = await conn.query(
//       "SELECT * FROM products WHERE id = ? LIMIT 1",
//       [productId]
//     );
//     if (product.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found!" });
//     }

//     // Get image URLs for the product
//     const [images] = await conn.query(
//       "SELECT image_url FROM product_img WHERE product_id = ?",
//       [productId]
//     );

//     // Delete image files from local 'image' folder
//     images.forEach(({ image_url }) => {
//       const filename = image_url.split("/").pop();
//       const imagePath = path.join(__dirname, "../image", filename);

//       try {
//         if (fs.existsSync(imagePath)) {
//           fs.unlinkSync(imagePath);
//           console.log(`🗑️ Deleted image: ${filename}`);
//         } else {
//           console.warn(`⚠️ Image not found: ${filename}`);
//         }
//       } catch (err) {
//         console.error(`❌ Error deleting image ${filename}:`, err.message);
//       }
//     });

//     // Remove image records
//     await conn.query("DELETE FROM product_img WHERE product_id = ?", [
//       productId,
//     ]);

//     // Remove product
//     await conn.query("DELETE FROM products WHERE id = ?", [productId]);

//     return res.status(200).json({
//       success: true,
//       message: "Product and its images deleted successfully.",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting product:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong!",
//     });
//   }
// };

// const getProductByIdController = async (req, res) => {
//   try {
//     const { pid } = req.params;
//     if (!pid) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Product Id is required!" });
//     }

//     const conn = await DbConnection({ timeout: 10000 });

//     // 1. Get product
//     const [productRes] = await conn.query(
//       `SELECT * FROM products WHERE id = ? LIMIT 1`,
//       [pid]
//     );
//     if (productRes.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found!" });
//     }
//     const product = productRes[0];

//     // 2. Get category name
//     let [categoryRes] = await conn.query(
//       `SELECT name FROM categories WHERE id = ? LIMIT 1`,
//       [product.category_id]
//     );
//     const category = categoryRes[0]?.name || "Uncategorized";

//     // 3. Get product-level images
//     const [allImages] = await conn.query(
//       `SELECT image_url, variation_id, color FROM product_images WHERE product_id = ?`,
//       [pid]
//     );

//     // Group images by color
//     const colorImageMap = {};
//     const defaultImages = [];

//     allImages.forEach((img) => {
//       const colorKey = img.color?.toLowerCase()?.trim();
//       if (colorKey) {
//         if (!colorImageMap[colorKey]) {
//           colorImageMap[colorKey] = [];
//         }
//         colorImageMap[colorKey].push(img.image_url);
//       } else {
//         defaultImages.push(img.image_url);
//       }
//     });

//     // 4. Get all variations
//     const [variationsRes] = await conn.query(
//       `SELECT * FROM product_variations WHERE product_id = ?`,
//       [pid]
//     );

//     // 5. Get all prices
//     const [priceRes] = await conn.query(
//       `SELECT * FROM prices WHERE variation_id IN (?) ORDER BY created_at DESC`,
//       [variationsRes.map((v) => v.id)]
//     );

//     const priceMap = {}; // variation_id => [prices]
//     priceRes.forEach((price) => {
//       if (!priceMap[price.variation_id]) {
//         priceMap[price.variation_id] = [];
//       }
//       priceMap[price.variation_id].push(price);
//     });

//     // 6. Get Qikink mapping
//     const [qikinkRes] = await conn.query(
//       `SELECT * FROM qikink_pod_details WHERE product_id = ?`,
//       [pid]
//     );

//     const qikinkMap = {};
//     qikinkRes.forEach((q) => {
//       qikinkMap[q.variation_id] = q;
//     });

//     // 7. Ratings, Features, Specifications, Reviews
//     const [ratings] = await conn.query(
//       `SELECT * FROM ratings WHERE product_id = ? LIMIT 1`,
//       [pid]
//     );
//     const productFeatures = await getProductFeaturesByProductId({
//       productId: pid,
//     });
//     const specifications = await getProductSpecifications({ productId: pid });
//     const customerReviews = await getCustomerReviewsByProductId({
//       productId: pid,
//     });

//     // 8. Map images & prices to variations using color
//     const variations = variationsRes.map((v) => {
//       const colorKey = v.color?.toLowerCase()?.trim();
//       return {
//         ...v,
//         images: colorImageMap[colorKey] || defaultImages,
//         prices: priceMap[v.id] || [],
//         qikink_details: qikinkMap[v.id] || null,
//       };
//     });

//     // 9. Return the final response
//     return res.status(200).json({
//       success: true,
//       data: {
//         ...product,
//         category,
//         images: defaultImages,
//         variations,
//         ratings: ratings[0] || null,
//         features: productFeatures,
//         specifications,
//         customerReviews,
//       },
//     });
//   } catch (error) {
//     console.error("getProductByIdController error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong!",
//     });
//   }
// };

// // --- DATA MINING: Product Recommendation for Single Product Page ---
// /**
//  * Recommend similar products based on category and brand.
//  * Optionally, can be extended to use user behavior in the future.
//  * GET /api/v1/products/:pid/recommendations
//  */
// const getProductRecommendations = async (req, res) => {
//   try {
//     const { pid } = req.params;
//     if (!pid) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Product Id is required!" });
//     }
//     const conn = await DbConnection({ timeout: 10000 });
//     // 1. Get the current product
//     const [productRes] = await conn.query(
//       `SELECT * FROM products WHERE id = ? LIMIT 1`,
//       [pid]
//     );
//     if (productRes.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found!" });
//     }
//     const product = productRes[0];
//     // 2. Find similar products (same category or brand, exclude self)
//     const [similarProducts] = await conn.query(
//       `SELECT * FROM products WHERE id != ? AND (category_id = ? OR brand = ?) LIMIT 10`,
//       [pid, product.category_id, product.brand]
//     );
//     // 3. Optionally, fetch images for these products
//     const productIds = similarProducts.map((p) => p.id);
//     let imagesMap = {};
//     if (productIds.length > 0) {
//       const [images] = await conn.query(
//         `SELECT product_id, image_url FROM product_images WHERE product_id IN (?)`,
//         [productIds]
//       );
//       imagesMap = images.reduce((acc, img) => {
//         if (!acc[img.product_id]) acc[img.product_id] = [];
//         acc[img.product_id].push(img.image_url);
//         return acc;
//       }, {});
//     }
//     // 4. Attach images to products
//     const recommendations = similarProducts.map((p) => ({
//       ...p,
//       images: imagesMap[p.id] || [],
//     }));
//     return res.status(200).json({ success: true, data: recommendations });
//   } catch (error) {
//     console.error("getProductRecommendations error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Something went wrong!",
//     });
//   }
// };

// module.exports = {
//   registerProductController,
//   updateProductController,
//   getAllProductsController,
//   deleteProductController,
//   getImageController,
//   searchProductsController,
//   getProductByIdController,
//   getProductRecommendations,
// };

const createConnectionDb = require("../config/pool");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

/**
 * Enhanced Product Registration Controller
 * Supports both own products and dropshipping products with dynamic attributes
 */
const registerProductController = async (req, res) => {
  const {
    // Basic product info
    name,
    description,
    short_description,
    category_id,
    brand,
    model,
    sku,

    // Product type and supplier info
    product_type = "own", // 'own', 'dropship', 'pod', 'affiliate'
    supplier_id = null,
    supplier_sku = null,
    supplier_price = null,
    supplier_url = null,

    // Inventory management
    stock_management = "track",
    stock_quantity = 0,
    low_stock_threshold = 5,

    // Physical attributes
    weight = null,
    dimensions = {}, // {length, width, height}

    // SEO
    meta_title = null,
    meta_description = null,
    meta_keywords = null,

    // Product attributes (dynamic based on category)
    attributes = {}, // Key-value pairs of attribute_name: value

    // Product variations
    variations = [],

    // Images
    images = [],

    // Status
    status = "active",
    visibility = "public",
    is_featured = false,
  } = req.body;

  // Validation
  if (!name || !category_id) {
    return res.status(400).json({
      success: false,
      message: "Product name and category are required",
    });
  }

  const pool = await createConnectionDb();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Validate category exists
    const [categoryCheck] = await conn.query(
      "SELECT id FROM categories WHERE id = ? AND is_active = TRUE",
      [category_id]
    );

    if (categoryCheck.length === 0) {
      throw new Error("Invalid or inactive category");
    }

    // 2. Validate supplier if dropshipping
    if (product_type === "dropship" && supplier_id) {
      const [supplierCheck] = await conn.query(
        "SELECT id FROM suppliers WHERE id = ? AND is_active = TRUE",
        [supplier_id]
      );

      if (supplierCheck.length === 0) {
        throw new Error("Invalid or inactive supplier");
      }
    }

    // 3. Generate unique SKU if not provided
    const productSku =
      sku ||
      `${product_type.toUpperCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;

    // 4. Check for duplicate SKU
    const [skuCheck] = await conn.query(
      "SELECT id FROM products WHERE sku = ?",
      [productSku]
    );

    if (skuCheck.length > 0) {
      throw new Error("SKU already exists");
    }

    // 5. Generate slug from name
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-") +
      "-" +
      Math.random().toString(36).substr(2, 5);

    // 6. Insert main product
    const [productResult] = await conn.query(
      `
      INSERT INTO products (
        name, slug, description, short_description, category_id, 
        brand, model, sku, product_type, supplier_id, supplier_sku, 
        supplier_price, supplier_url, stock_management, stock_quantity, 
        low_stock_threshold, weight, length, width, height, 
        meta_title, meta_description, meta_keywords, status, 
        visibility, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        name,
        slug,
        description,
        short_description,
        category_id,
        brand,
        model,
        productSku,
        product_type,
        supplier_id,
        supplier_sku,
        supplier_price,
        supplier_url,
        stock_management,
        stock_quantity,
        low_stock_threshold,
        weight,
        dimensions.length,
        dimensions.width,
        dimensions.height,
        meta_title,
        meta_description,
        meta_keywords,
        status,
        visibility,
        is_featured,
      ]
    );

    const product_id = productResult.insertId;

    // 7. Get category attributes for validation
    const [categoryAttributes] = await conn.query(
      `
      SELECT id, attribute_name, attribute_type, is_required, options, validation_rules
      FROM category_attributes 
      WHERE category_id = ? OR category_id IN (
        SELECT parent_id FROM categories WHERE id = ?
      )
      ORDER BY display_order
    `,
      [category_id, category_id]
    );

    // 8. Validate and insert product attributes
    for (const attr of categoryAttributes) {
      const value = attributes[attr.attribute_name];

      // Check required attributes
      if (attr.is_required && (!value || value === "")) {
        throw new Error(
          `Required attribute '${attr.attribute_name}' is missing`
        );
      }

      if (value !== undefined && value !== null && value !== "") {
        // Validate attribute value based on type
        const validationError = validateAttributeValue(attr, value);
        if (validationError) {
          throw new Error(`Invalid ${attr.attribute_name}: ${validationError}`);
        }

        // Insert attribute
        await conn.query(
          `
          INSERT INTO product_attributes (product_id, category_attribute_id, attribute_value)
          VALUES (?, ?, ?)
        `,
          [product_id, attr.id, JSON.stringify(value)]
        );
      }
    }

    // 9. Handle product images
    if (images && images.length > 0) {
      await insertProductImages(conn, product_id, null, images);
    }

    // 10. Handle variations if provided
    if (variations && variations.length > 0) {
      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        await insertProductVariation(
          conn,
          product_id,
          variation,
          categoryAttributes,
          i === 0
        );
      }
    } else {
      // Create default variation if no variations provided
      const defaultVariationSku = `${productSku}-DEFAULT`;
      await conn.query(
        `
        INSERT INTO product_variations (
          product_id, sku, variation_name, stock_quantity, is_default, is_available
        ) VALUES (?, ?, ?, ?, TRUE, TRUE)
      `,
        [product_id, defaultVariationSku, "Default", stock_quantity]
      );

      const [defaultVariation] = await conn.query(
        "SELECT id FROM product_variations WHERE product_id = ? AND is_default = TRUE",
        [product_id]
      );

      // Insert default pricing if provided
      if (req.body.price) {
        await conn.query(
          `
          INSERT INTO prices (variation_id, amount, price_type, is_active)
          VALUES (?, ?, 'regular', TRUE)
        `,
          [defaultVariation[0].id, req.body.price]
        );
      }
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Product registered successfully",
      data: {
        product_id,
        sku: productSku,
        slug,
      },
    });
  } catch (error) {
    await conn.rollback();
    console.error("Product Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register product",
    });
  } finally {
    conn.release();
  }
};

/**
 * Enhanced Get All Products Controller
 * Returns products with their dynamic attributes and variations
 */
const getAllProductsController = async (req, res) => {
  try {
    const {
      category_id,
      product_type,
      brand,
      status = "active",
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "DESC",
      search,
      filters = {},
    } = req.query;

    const offset = (page - 1) * limit;
    const conn = await createConnectionDb({ timeout: 10000 });

    // Build WHERE clause
    let whereConditions = ["p.status = ?"];
    let queryParams = [status];

    if (category_id) {
      whereConditions.push("p.category_id = ?");
      queryParams.push(category_id);
    }

    if (product_type) {
      whereConditions.push("p.product_type = ?");
      queryParams.push(product_type);
    }

    if (brand) {
      whereConditions.push("p.brand = ?");
      queryParams.push(brand);
    }

    if (search) {
      whereConditions.push(
        "(p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";

    // Get products with category info
    const [products] = await conn.query(
      `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        s.name as supplier_name,
        COUNT(DISTINCT pv.id) as variation_count,
        MIN(pr.amount) as min_price,
        MAX(pr.amount) as max_price
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_available = TRUE
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE AND pr.price_type = 'regular'
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.${sort_by} ${sort_order}
      LIMIT ? OFFSET ?
    `,
      [...queryParams, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const [countResult] = await conn.query(
      `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${whereClause}
    `,
      queryParams.slice(0, -2)
    ); // Remove limit and offset

    const total = countResult[0].total;

    // Enrich products with attributes, images, and variations
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        // Get product attributes
        const attributes = await getProductAttributes(conn, product.id);

        // Get primary image
        const [images] = await conn.query(
          `
          SELECT image_url, alt_text 
          FROM product_images 
          WHERE product_id = ? AND variation_id IS NULL AND is_primary = TRUE
          ORDER BY sort_order ASC
          LIMIT 1
        `,
          [product.id]
        );

        // Get first few variations
        const [variations] = await conn.query(
          `
          SELECT pv.*, pr.amount as price
          FROM product_variations pv
          LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE AND pr.price_type = 'regular'
          WHERE pv.product_id = ? AND pv.is_available = TRUE
          ORDER BY pv.is_default DESC, pv.created_at ASC
          LIMIT 3
        `,
          [product.id]
        );

        return {
          ...product,
          attributes,
          primary_image: images[0] || null,
          variations: variations,
          total_variations: product.variation_count,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        products: enrichedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch products",
    });
  }
};

/**
 * Enhanced Get Product By ID Controller
 */
const getProductByIdController = async (req, res) => {
  try {
    const { pid } = req.params;
    const conn = await createConnectionDb({ timeout: 10000 });

    // Get product with category and supplier info
    const [productResult] = await conn.query(
      `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        c.description as category_description,
        s.name as supplier_name,
        s.company_name as supplier_company,
        s.commission_rate,
        s.processing_time_days
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `,
      [pid]
    );

    if (productResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = productResult[0];

    // Get product attributes
    const attributes = await getProductAttributes(conn, pid);

    // Get all images
    const [images] = await conn.query(
      `
      SELECT * FROM product_images 
      WHERE product_id = ? AND variation_id IS NULL
      ORDER BY is_primary DESC, sort_order ASC
    `,
      [pid]
    );

    // Get all variations with their attributes and prices
    const [variations] = await conn.query(
      `
      SELECT 
        pv.*,
        GROUP_CONCAT(
          CONCAT('{"type":"', pr.price_type, '","amount":', pr.amount, ',"currency":"', pr.currency, '"}')
        ) as prices
      FROM product_variations pv
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE
      WHERE pv.product_id = ?
      GROUP BY pv.id
      ORDER BY pv.is_default DESC, pv.created_at ASC
    `,
      [pid]
    );

    // Enrich variations with their attributes and images
    const enrichedVariations = await Promise.all(
      variations.map(async (variation) => {
        // Get variation attributes
        const variationAttributes = await getVariationAttributes(
          conn,
          variation.id
        );

        // Get variation images
        const [variationImages] = await conn.query(
          `
          SELECT * FROM product_images 
          WHERE variation_id = ?
          ORDER BY is_primary DESC, sort_order ASC
        `,
          [variation.id]
        );

        return {
          ...variation,
          attributes: variationAttributes,
          images: variationImages,
          prices: variation.prices ? JSON.parse(`[${variation.prices}]`) : [],
        };
      })
    );

    // Get related products
    const [relatedProducts] = await conn.query(
      `
      SELECT p.id, p.name, p.slug, pi.image_url, pr.amount as price
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_default = TRUE
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE AND pr.price_type = 'regular'
      WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
      ORDER BY p.created_at DESC
      LIMIT 8
    `,
      [product.category_id, pid]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        attributes,
        images,
        variations: enrichedVariations,
        related_products: relatedProducts,
      },
    });
  } catch (error) {
    console.error("Get Product By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product",
    });
  }
};

/**
 * Update Product Controller
 */
const updateProductController = async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;

  const pool = await createConnectionDb();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Check if product exists
    const [productCheck] = await conn.query(
      "SELECT id, category_id FROM products WHERE id = ?",
      [pid]
    );

    if (productCheck.length === 0) {
      throw new Error("Product not found");
    }

    // Update main product fields
    const productFields = [
      "name",
      "description",
      "short_description",
      "brand",
      "model",
      "product_type",
      "supplier_id",
      "supplier_sku",
      "supplier_price",
      "supplier_url",
      "stock_management",
      "stock_quantity",
      "low_stock_threshold",
      "weight",
      "length",
      "width",
      "height",
      "meta_title",
      "meta_description",
      "meta_keywords",
      "status",
      "visibility",
      "is_featured",
    ];

    const updateFields = [];
    const updateValues = [];

    productFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });

    if (updateFields.length > 0) {
      updateValues.push(pid);
      await conn.query(
        `
        UPDATE products SET ${updateFields.join(
          ", "
        )}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        updateValues
      );
    }

    // Update attributes if provided
    if (updates.attributes) {
      // Get current category attributes
      const category_id = updates.category_id || productCheck[0].category_id;
      const [categoryAttributes] = await conn.query(
        `
        SELECT id, attribute_name, attribute_type, is_required, options, validation_rules
        FROM category_attributes 
        WHERE category_id = ?
      `,
        [category_id]
      );

      // Validate and update attributes
      for (const attr of categoryAttributes) {
        const value = updates.attributes[attr.attribute_name];

        if (value !== undefined) {
          if (value === null || value === "") {
            // Delete attribute if value is null/empty
            await conn.query(
              `
              DELETE FROM product_attributes 
              WHERE product_id = ? AND category_attribute_id = ?
            `,
              [pid, attr.id]
            );
          } else {
            // Validate and upsert attribute
            const validationError = validateAttributeValue(attr, value);
            if (validationError) {
              throw new Error(
                `Invalid ${attr.attribute_name}: ${validationError}`
              );
            }

            await conn.query(
              `
              INSERT INTO product_attributes (product_id, category_attribute_id, attribute_value)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE 
              attribute_value = VALUES(attribute_value),
              updated_at = CURRENT_TIMESTAMP
            `,
              [pid, attr.id, JSON.stringify(value)]
            );
          }
        }
      }
    }

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    await conn.rollback();
    console.error("Update Product Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  } finally {
    conn.release();
  }
};

/**
 * Search Products Controller with advanced filtering
 */
const searchProductsController = async (req, res) => {
  try {
    const {
      query,
      category_id,
      brand,
      min_price,
      max_price,
      attributes = {},
      product_type,
      page = 1,
      limit = 20,
      sort_by = "relevance",
    } = req.body;

    const offset = (page - 1) * limit;
    const conn = await createConnectionDb({ timeout: 10000 });

    let baseQuery = `
      SELECT DISTINCT
        p.id, p.name, p.slug, p.brand, p.product_type,
        c.name as category_name,
        MIN(pr.amount) as min_price,
        MAX(pr.amount) as max_price,
        pi.image_url as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_available = TRUE
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
    `;

    let whereConditions = ['p.status = "active"', 'p.visibility = "public"'];
    let queryParams = [];

    // Text search
    if (query) {
      whereConditions.push(`(
        MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) OR
        p.name LIKE ? OR p.brand LIKE ?
      )`);
      queryParams.push(query, `%${query}%`, `%${query}%`);
    }

    // Category filter
    if (category_id) {
      whereConditions.push("p.category_id = ?");
      queryParams.push(category_id);
    }

    // Brand filter
    if (brand) {
      whereConditions.push("p.brand = ?");
      queryParams.push(brand);
    }

    // Product type filter
    if (product_type) {
      whereConditions.push("p.product_type = ?");
      queryParams.push(product_type);
    }

    // Price range filter
    if (min_price || max_price) {
      if (min_price) {
        whereConditions.push("pr.amount >= ?");
        queryParams.push(min_price);
      }
      if (max_price) {
        whereConditions.push("pr.amount <= ?");
        queryParams.push(max_price);
      }
    }

    // Attribute filters
    let attributeJoins = "";
    let attributeIndex = 0;

    Object.entries(attributes).forEach(([attrName, attrValue]) => {
      attributeIndex++;
      const alias = `pa${attributeIndex}`;
      const caAlias = `ca${attributeIndex}`;

      attributeJoins += `
        INNER JOIN product_attributes ${alias} ON p.id = ${alias}.product_id
        INNER JOIN category_attributes ${caAlias} ON ${alias}.category_attribute_id = ${caAlias}.id
      `;

      whereConditions.push(
        `${caAlias}.attribute_name = ? AND JSON_UNQUOTE(${alias}.attribute_value) = ?`
      );
      queryParams.push(attrName, attrValue);
    });

    baseQuery += attributeJoins;

    const whereClause =
      whereConditions.length > 0
        ? `WHERE ${whereConditions.join(" AND ")}`
        : "";
    const groupBy = "GROUP BY p.id";

    // Sorting
    let orderBy = "";
    switch (sort_by) {
      case "price_low":
        orderBy = "ORDER BY min_price ASC";
        break;
      case "price_high":
        orderBy = "ORDER BY min_price DESC";
        break;
      case "newest":
        orderBy = "ORDER BY p.created_at DESC";
        break;
      case "name":
        orderBy = "ORDER BY p.name ASC";
        break;
      case "relevance":
      default:
        if (query) {
          orderBy = `ORDER BY 
            MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE) DESC,
            p.created_at DESC`;
          queryParams.push(query);
        } else {
          orderBy = "ORDER BY p.created_at DESC";
        }
        break;
    }

    const fullQuery = `${baseQuery} ${whereClause} ${groupBy} ${orderBy} LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const [products] = await conn.query(fullQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id AND pv.is_available = TRUE
      LEFT JOIN prices pr ON pv.id = pr.variation_id AND pr.is_active = TRUE
      ${attributeJoins}
      ${whereClause}
    `;

    const countParams = queryParams.slice(0, -2); // Remove limit and offset
    if (sort_by === "relevance" && query) {
      countParams.pop(); // Remove the extra query param for relevance sorting
    }

    const [countResult] = await conn.query(countQuery, countParams);
    const total = countResult[0].total;

    return res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Search Products Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
};

/**
 * Helper Functions
 */

// Validate attribute values based on type
const validateAttributeValue = (attribute, value) => {
  const { attribute_type, options, validation_rules } = attribute;

  switch (attribute_type) {
    case "number":
      if (isNaN(value)) return "Must be a number";
      break;
    case "decimal":
      if (isNaN(parseFloat(value))) return "Must be a decimal number";
      break;
    case "select":
      if (options) {
        const validOptions = JSON.parse(options);
        if (!validOptions.includes(value)) {
          return `Must be one of: ${validOptions.join(", ")}`;
        }
      }
      break;
    case "multiselect":
      if (options && Array.isArray(value)) {
        const validOptions = JSON.parse(options);
        for (const v of value) {
          if (!validOptions.includes(v)) {
            return `Invalid option: ${v}`;
          }
        }
      }
      break;
    case "boolean":
      if (typeof value !== "boolean" && value !== "true" && value !== "false") {
        return "Must be true or false";
      }
      break;
    case "url":
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(value)) return "Must be a valid URL";
      break;
    case "color":
      const colorPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (
        !colorPattern.test(value) &&
        !["red", "blue", "green", "black", "white"].includes(
          value.toLowerCase()
        )
      ) {
        return "Must be a valid color code or name";
      }
      break;
  }

  // Apply validation rules if defined
  if (validation_rules) {
    const rules = JSON.parse(validation_rules);

    if (rules.min && value.length < rules.min) {
      return `Must be at least ${rules.min} characters`;
    }
    if (rules.max && value.length > rules.max) {
      return `Must be at most ${rules.max} characters`;
    }
    if (rules.regex && !new RegExp(rules.regex).test(value)) {
      return `Invalid format`;
    }
  }

  return null;
};

// Get product attributes with category info
const getProductAttributes = async (conn, productId) => {
  const [attributes] = await conn.query(
    `
    SELECT 
      ca.attribute_name,
      ca.attribute_type,
      ca.unit,
      pa.attribute_value
    FROM product_attributes pa
    JOIN category_attributes ca ON pa.category_attribute_id = ca.id
    WHERE pa.product_id = ?
    ORDER BY ca.display_order
  `,
    [productId]
  );

  return attributes.reduce((acc, attr) => {
    let value = attr.attribute_value;
    try {
      value = JSON.parse(value);
    } catch (e) {
      // Keep as string if not valid JSON
    }

    acc[attr.attribute_name] = {
      value,
      type: attr.attribute_type,
      unit: attr.unit,
    };
    return acc;
  }, {});
};

// Get variation attributes
const getVariationAttributes = async (conn, variationId) => {
  const [attributes] = await conn.query(
    `
    SELECT 
      ca.attribute_name,
      ca.attribute_type,
      ca.unit,
      pva.attribute_value
    FROM product_variation_attributes pva
    JOIN category_attributes ca ON pva.category_attribute_id = ca.id
    WHERE pva.variation_id = ?
    ORDER BY ca.display_order
  `,
    [variationId]
  );

  return attributes.reduce((acc, attr) => {
    let value = attr.attribute_value;
    try {
      value = JSON.parse(value);
    } catch (e) {
      // Keep as string if not valid JSON
    }

    acc[attr.attribute_name] = {
      value,
      type: attr.attribute_type,
      unit: attr.unit,
    };
    return acc;
  }, {});
};

// Insert product images
const insertProductImages = async (conn, productId, variationId, images) => {
  const imageDir = path.join(__dirname, "../image");
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir, { recursive: true });
  }

  const baseURL =
    process.env.ENVIRONMENT === "development"
      ? "http://localhost:8080/"
      : "https://api.onestepindia.in/";

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const filename = `${productId}_${
      variationId || "main"
    }_${i}_${uuidv4()}.png`;
    const filepath = path.join(imageDir, filename);

    // Handle base64 images
    if (typeof image === "string" && image.startsWith("data:")) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));
    } else if (typeof image === "string") {
      // Assume it's already base64
      fs.writeFileSync(filepath, Buffer.from(image, "base64"));
    }

    const imageUrl = `${baseURL}image/${filename}`;

    await conn.query(
      `
      INSERT INTO product_images (product_id, variation_id, image_url, is_primary, sort_order)
      VALUES (?, ?, ?, ?, ?)
    `,
      [productId, variationId, imageUrl, i === 0, i]
    );
  }
};

// Insert product variation
const insertProductVariation = async (
  conn,
  productId,
  variation,
  categoryAttributes,
  isDefault = false
) => {
  const {
    sku,
    variation_name,
    cost_price,
    selling_price,
    compare_at_price,
    stock_quantity = 0,
    supplier_variation_id,
    supplier_sku,
    weight,
    dimensions = {},
    attributes = {},
    images = [],
    prices = [],
  } = variation;

  // Insert variation
  const [variationResult] = await conn.query(
    `
    INSERT INTO product_variations (
      product_id, sku, variation_name, cost_price, selling_price,
      compare_at_price, stock_quantity, supplier_variation_id, supplier_sku,
      weight, length, width, height, is_default, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
  `,
    [
      productId,
      sku,
      variation_name,
      cost_price,
      selling_price,
      compare_at_price,
      stock_quantity,
      supplier_variation_id,
      supplier_sku,
      weight,
      dimensions.length,
      dimensions.width,
      dimensions.height,
      isDefault,
    ]
  );

  const variationId = variationResult.insertId;

  // Insert variation attributes
  for (const attr of categoryAttributes) {
    const value = attributes[attr.attribute_name];
    if (value !== undefined && value !== null && value !== "") {
      await conn.query(
        `
        INSERT INTO product_variation_attributes (variation_id, category_attribute_id, attribute_value)
        VALUES (?, ?, ?)
      `,
        [variationId, attr.id, JSON.stringify(value)]
      );
    }
  }

  // Insert variation images
  if (images && images.length > 0) {
    await insertProductImages(conn, productId, variationId, images);
  }

  // Insert prices
  if (prices && prices.length > 0) {
    for (const price of prices) {
      await conn.query(
        `
        INSERT INTO prices (variation_id, amount, price_type, currency, min_quantity, max_quantity, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
      `,
        [
          variationId,
          price.amount,
          price.type || "regular",
          price.currency || "INR",
          price.min_quantity || 1,
          price.max_quantity,
        ]
      );
    }
  } else if (selling_price) {
    // Insert default price
    await conn.query(
      `
      INSERT INTO prices (variation_id, amount, price_type, is_active)
      VALUES (?, ?, 'regular', TRUE)
    `,
      [variationId, selling_price]
    );
  }

  return variationId;
};

module.exports = {
  registerProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
  searchProductsController,
};
