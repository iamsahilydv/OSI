const createConnectionDb = require("../config/pool");
const {
  getProductFeaturesByProductId,
  getCustomerReviewsByProductId,
  getProductSpecifications,
} = require("../helpers/productHelper");
const {
  validateProductVariations,
  formatVariationsForDisplay,
} = require("../helpers/categoryHelper");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const DbConnection = require("../config/pool");

const registerProductController = async (req, res) => {
  const {
    name,
    description,
    qty = 1,
    category_id,
    brand,
    sellby,
    is_pod = false,
    productImages = [],
    variations = [],
  } = req.body;

  if (!name || !description || !category_id || !brand || !sellby) {
    return res.status(400).json({
      status: 400,
      message: "All required fields must be filled",
    });
  }

  // Validate variations if provided
  if (Array.isArray(variations) && variations.length > 0) {
    const validation = await validateProductVariations(category_id, variations);
    if (!validation.isValid) {
      return res.status(400).json({
        status: 400,
        message: "Variation validation failed",
        errors: validation.errors,
      });
    }
  }

  const pool = await DbConnection();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      "SELECT id FROM products WHERE name = ?",
      [name]
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        status: 409,
        message: "Product with the same name already exists",
      });
    }

    const [productResult] = await conn.query(
      `INSERT INTO products (name, qty, category_id, brand, sellby, description, is_pod)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, qty, category_id, brand, sellby, description, is_pod]
    );
    const product_id = productResult.insertId;

    const imageDir = path.join(__dirname, "../image");
    if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

    const baseURL =
      process.env.ENVIRONMENT === "development"
        ? "http://localhost:8080/"
        : "https://api.onestepindia.in/";

    const uploadedColorImages = new Set();

    if (Array.isArray(variations) && variations.length > 0) {
      for (const variation of variations) {
        const {
          sku,
          variation_name,
          attributes = {},
          qikink_sku = null,
          qikink_price = null,
          selling_price = null,
          stock_quantity = 0,
          is_available = true,
          print_type_id = null,
          design_code = null,
          design_link = null,
          mockup_link = null,
          placement_sku = null,
          price = {},
          images = [],
        } = variation;

        if (!sku || !variation_name) {
          await conn.rollback();
          return res.status(400).json({
            status: 400,
            message: "Each variation must include SKU and variation_name",
          });
        }

        const [variationResult] = await conn.query(
          `INSERT INTO product_variations 
            (product_id, sku, variation_name, attributes, selling_price, stock_quantity, is_available) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            product_id,
            sku,
            variation_name,
            JSON.stringify(attributes),
            selling_price,
            stock_quantity,
            is_available,
          ]
        );
        const variation_id = variationResult.insertId;

        if (qikink_sku) {
          await conn.query(
            `INSERT INTO qikink_pod_details 
              (product_id, variation_id, qikink_sku, qikink_price, print_type_id, 
               design_code, design_link, mockup_link, placement_sku, selling_price)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              product_id,
              variation_id,
              qikink_sku,
              qikink_price,
              print_type_id,
              design_code,
              design_link,
              mockup_link,
              placement_sku,
              selling_price,
            ]
          );
        }

        if (price.original) {
          await conn.query(
            `INSERT INTO prices (variation_id, original, discount_percentage, currency)
             VALUES (?, ?, ?, ?)`,
            [
              variation_id,
              price.original,
              price.discount_percentage || 0,
              price.currency || "INR",
            ]
          );
        }

        const variationKey = `${product_id}_${sku}`;
        if (!uploadedColorImages.has(variationKey)) {
          for (const base64Img of images) {
            const filename = `${sku}_${uuidv4()}.png`;
            const filepath = path.join(imageDir, filename);
            fs.writeFileSync(filepath, Buffer.from(base64Img, "base64"));
            const imageUrl = `${baseURL}image/${filename}`;

            await conn.query(
              `INSERT INTO product_images (product_id, variation_id, image_url)
               VALUES (?, ?, ?)`,
              [product_id, variation_id, imageUrl]
            );
          }
          uploadedColorImages.add(variationKey);
        }
      }
    } else {
      for (const base64Img of productImages) {
        const filename = `${name.replace(/\s+/g, "_")}_${uuidv4()}.png`;
        const filepath = path.join(imageDir, filename);
        fs.writeFileSync(filepath, Buffer.from(base64Img, "base64"));
        const imageUrl = `${baseURL}image/${filename}`;

        await conn.query(
          `INSERT INTO product_images (product_id, variation_id, image_url)
           VALUES (?, NULL, ?)`,
          [product_id, imageUrl]
        );
      }
    }

    await conn.commit();
    return res.status(201).json({
      status: 201,
      message: "Product registered successfully",
      product_id,
    });
  } catch (error) {
    await conn.rollback();
    console.error("\u274C Product Registration Error:", error);
    return res.status(500).json({
      status: 500,
      message: "Server error. All changes reverted.",
      error: error.message,
    });
  } finally {
    conn.release();
  }
};

const searchProductsController = async (req, res) => {
  const query = req.body.query;

  if (!query) {
    return res
      .status(400)
      .json({ success: false, message: "Missing search term." });
  }

  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const [searchResults] = await conn.query(
      `
      SELECT p.*, i.image_url, pr.id AS price_id, pr.current, pr.original, pr.discountPercentage, pr.currency, c.name AS category_name
      FROM products AS p
      LEFT JOIN product_img AS i ON p.id = i.product_id
      LEFT JOIN prices AS pr ON p.id = pr.product_id
      LEFT JOIN categories AS c ON p.category_id = c.id
      WHERE
        p.name LIKE ? OR
        c.name LIKE ? OR
        p.brand LIKE ? OR
        pr.current LIKE ? OR
        pr.original LIKE ?
    `,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    const products = searchResults.reduce((result, row) => {
      const existingProduct = result.find((product) => product.id === row.id);
      if (!existingProduct) {
        result.push({
          id: row.id,
          name: row.name,
          qty: row.qty,
          category: row.category_name,
          brand: row.brand,
          sellby: row.sellby,
          images: row.image_url ? [row.image_url] : [],
          prices: row.price_id
            ? [
                {
                  id: row.price_id,
                  current: row.current,
                  original: row.original,
                  discountPercentage: row.discountPercentage,
                  currency: row.currency,
                },
              ]
            : [],
        });
      } else if (row.image_url) {
        existingProduct.images.push(row.image_url);
      } else if (row.price_id) {
        existingProduct.prices.push({
          id: row.price_id,
          current: row.current,
          original: row.original,
          discountPercentage: row.discountPercentage,
          currency: row.currency,
        });
      }
      return result;
    }, []);

    if (products.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Data is not found!" });
    }

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error.messages || "something went wrong!",
    });
  }
};

const getImageController = async (req, res) => {
  try {
    const imageName = req.params.imageName;
    const imagePath = path.join(
      __dirname,
      "..",
      "Product_Img",
      "images",
      imageName
    );

    // Check if the image file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).json({ message: "Image not found" });
      }
      // If the file exists, send it
      return res.sendFile(imagePath);
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error.messages || "something went wrong!",
    });
  }
};

const updateProductController = async (req, res) => {
  const { id, name, img, price, category, qty, sellby } = req.body;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Product ID is required!" });
  }

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    //check product is exist or not
    const [existingProduct] = await conn.query(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      id
    );
    if (existingProduct.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    const updateFields = {};
    if (name) {
      updateFields.name = name;
    }
    if (img) {
      updateFields.img = img;
    }
    if (price) {
      updateFields.price = price;
    }
    if (category) {
      updateFields.category = category;
    }
    if (qty !== undefined) {
      updateFields.qty = qty;
    }
    if (sellby) {
      updateFields.sellby = sellby;
    }

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No update fields provided!" });
    }

    await conn.query("UPDATE products SET ? WHERE id = ?", [updateFields, id]);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || error.messages || "something went wrong!",
    });
  }
};

const getAllProductsController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    // 1. Get all products with category info
    const [products] = await conn.query(`
      SELECT 
        p.id, p.name, p.qty, p.brand, p.sellby, p.description, p.is_pod,
        c.id AS categoryId, c.name AS category
      FROM products AS p
      LEFT JOIN categories AS c ON p.category_id = c.id
      ORDER BY p.id DESC;
    `);

    // 2. Get all product images
    const [images] = await conn.query(`
      SELECT product_id, variation_id, image_url FROM product_images;
    `);

    // 3. Get all product variations
    const [variations] = await conn.query(`
      SELECT * FROM product_variations;
    `);

    // 4. Get all Qikink POD details
    const [qikinkDetails] = await conn.query(`
      SELECT * FROM qikink_pod_details;
    `);

    // 5. Get all prices (for versioned price history)
    const [prices] = await conn.query(`
      SELECT * FROM prices ORDER BY created_at DESC;
    `);

    // 6. Build variation-image map
    const productVariationImageMap = {}; // key = `${product_id}_${variation_id}`

    images.forEach((img) => {
      const variationKey = `${img.product_id}_${img.variation_id}`;
      if (!productVariationImageMap[variationKey]) {
        productVariationImageMap[variationKey] = [];
      }
      productVariationImageMap[variationKey].push(img.image_url);
    });

    // 7. Compose full product data
    const fullProducts = products.map((product) => {
      const defaultImages =
        productVariationImageMap[`${product.id}_default`] || [];

      const productVariations = variations
        .filter((v) => v.product_id === product.id)
        .map((v) => {
          const variationKey = `${product.id}_${v.id}`;
          const variationImages =
            productVariationImageMap[variationKey] || defaultImages;

          const qikink = qikinkDetails.find((q) => q.variation_id === v.id);

          const variationPrices = prices.filter((p) => p.variation_id === v.id);

          return {
            ...v,
            attributes:
              typeof v.attributes === "string"
                ? JSON.parse(v.attributes)
                : v.attributes,
            images: variationImages,
            qikink_details: qikink || null,
            prices: variationPrices, // entire history
            latest_price: variationPrices[0]?.amount || null, // latest price
          };
        });

      return {
        ...product,
        images: defaultImages, // for product-level fallback
        variations: productVariations,
      };
    });

    return res.status(200).json({
      success: true,
      data: fullProducts,
    });
  } catch (error) {
    console.error("getAllProductsController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

const deleteProductController = async (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide productId" });
  }

  let conn;
  try {
    conn = await createConnectionDb({ timeout: 10000 });

    // Check if product exists
    const [product] = await conn.query(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [productId]
    );
    if (product.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }

    // Get image URLs for the product
    const [images] = await conn.query(
      "SELECT image_url FROM product_img WHERE product_id = ?",
      [productId]
    );

    // Delete image files from local 'image' folder
    images.forEach(({ image_url }) => {
      const filename = image_url.split("/").pop();
      const imagePath = path.join(__dirname, "../image", filename);

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🗑️ Deleted image: ${filename}`);
        } else {
          console.warn(`⚠️ Image not found: ${filename}`);
        }
      } catch (err) {
        console.error(`❌ Error deleting image ${filename}:`, err.message);
      }
    });

    // Remove image records
    await conn.query("DELETE FROM product_img WHERE product_id = ?", [
      productId,
    ]);

    // Remove product
    await conn.query("DELETE FROM products WHERE id = ?", [productId]);

    return res.status(200).json({
      success: true,
      message: "Product and its images deleted successfully.",
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

const getProductByIdController = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid) {
      return res
        .status(400)
        .json({ success: false, message: "Product Id is required!" });
    }

    const conn = await DbConnection({ timeout: 10000 });

    // 1. Get product
    const [productRes] = await conn.query(
      `SELECT * FROM products WHERE id = ? LIMIT 1`,
      [pid]
    );
    if (productRes.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }
    const product = productRes[0];

    // 2. Get category name
    let [categoryRes] = await conn.query(
      `SELECT name FROM categories WHERE id = ? LIMIT 1`,
      [product.category_id]
    );
    const category = categoryRes[0]?.name || "Uncategorized";

    // 3. Get product-level images
    const [allImages] = await conn.query(
      `SELECT image_url, variation_id, color FROM product_images WHERE product_id = ?`,
      [pid]
    );

    // Group images by color
    const colorImageMap = {};
    const defaultImages = [];

    allImages.forEach((img) => {
      const colorKey = img.color?.toLowerCase()?.trim();
      if (colorKey) {
        if (!colorImageMap[colorKey]) {
          colorImageMap[colorKey] = [];
        }
        colorImageMap[colorKey].push(img.image_url);
      } else {
        defaultImages.push(img.image_url);
      }
    });

    // 4. Get all variations
    const [variationsRes] = await conn.query(
      `SELECT * FROM product_variations WHERE product_id = ?`,
      [pid]
    );

    // 5. Get all prices
    const [priceRes] = await conn.query(
      `SELECT * FROM prices WHERE variation_id IN (?) ORDER BY created_at DESC`,
      [variationsRes.map((v) => v.id)]
    );

    const priceMap = {}; // variation_id => [prices]
    priceRes.forEach((price) => {
      if (!priceMap[price.variation_id]) {
        priceMap[price.variation_id] = [];
      }
      priceMap[price.variation_id].push(price);
    });

    // 6. Get Qikink mapping
    const [qikinkRes] = await conn.query(
      `SELECT * FROM qikink_pod_details WHERE product_id = ?`,
      [pid]
    );

    const qikinkMap = {};
    qikinkRes.forEach((q) => {
      qikinkMap[q.variation_id] = q;
    });

    // 7. Ratings, Features, Specifications, Reviews
    const [ratings] = await conn.query(
      `SELECT * FROM ratings WHERE product_id = ? LIMIT 1`,
      [pid]
    );
    const productFeatures = await getProductFeaturesByProductId({
      productId: pid,
    });
    const specifications = await getProductSpecifications({ productId: pid });
    const customerReviews = await getCustomerReviewsByProductId({
      productId: pid,
    });

    // 8. Map images & prices to variations using color
    const variations = variationsRes.map((v) => {
      const colorKey = v.color?.toLowerCase()?.trim();
      return {
        ...v,
        images: colorImageMap[colorKey] || defaultImages,
        prices: priceMap[v.id] || [],
        qikink_details: qikinkMap[v.id] || null,
      };
    });

    // 9. Return the final response
    return res.status(200).json({
      success: true,
      data: {
        ...product,
        category,
        images: defaultImages,
        variations,
        ratings: ratings[0] || null,
        features: productFeatures,
        specifications,
        customerReviews,
      },
    });
  } catch (error) {
    console.error("getProductByIdController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

// --- DATA MINING: Product Recommendation for Single Product Page ---
/**
 * Recommend similar products based on category and brand.
 * Optionally, can be extended to use user behavior in the future.
 * GET /api/v1/products/:pid/recommendations
 */
const getProductRecommendations = async (req, res) => {
  try {
    const { pid } = req.params;
    if (!pid) {
      return res
        .status(400)
        .json({ success: false, message: "Product Id is required!" });
    }
    const conn = await DbConnection({ timeout: 10000 });
    // 1. Get the current product
    const [productRes] = await conn.query(
      `SELECT * FROM products WHERE id = ? LIMIT 1`,
      [pid]
    );
    if (productRes.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found!" });
    }
    const product = productRes[0];
    // 2. Find similar products (same category or brand, exclude self)
    const [similarProducts] = await conn.query(
      `SELECT * FROM products WHERE id != ? AND (category_id = ? OR brand = ?) LIMIT 10`,
      [pid, product.category_id, product.brand]
    );
    // 3. Optionally, fetch images for these products
    const productIds = similarProducts.map((p) => p.id);
    let imagesMap = {};
    if (productIds.length > 0) {
      const [images] = await conn.query(
        `SELECT product_id, image_url FROM product_images WHERE product_id IN (?)`,
        [productIds]
      );
      imagesMap = images.reduce((acc, img) => {
        if (!acc[img.product_id]) acc[img.product_id] = [];
        acc[img.product_id].push(img.image_url);
        return acc;
      }, {});
    }
    // 4. Attach images to products
    const recommendations = similarProducts.map((p) => ({
      ...p,
      images: imagesMap[p.id] || [],
    }));
    return res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.error("getProductRecommendations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

module.exports = {
  registerProductController,
  updateProductController,
  getAllProductsController,
  deleteProductController,
  getImageController,
  searchProductsController,
  getProductByIdController,
  getProductRecommendations,
};
