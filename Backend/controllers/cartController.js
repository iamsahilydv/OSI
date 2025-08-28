const createConnectionDb = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");
const getProductPrices = require("../helpers/priceHelper");

//save item into cart
const saveItemCartController = async (req, res) => {
  const { variation_id } = req.body;
  let token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ success: false, message: "Token required" });
  token = token.split(" ")[1];

  try {
    const user = await getUserFn(token);
    const user_id = user.user[0].id;
    const conn = await createConnectionDb({ timeout: 10000 });

    // Validate variation
    const [variation] = await conn.query(
      "SELECT * FROM product_variations WHERE id = ? LIMIT 1",
      [variation_id]
    );
    if (!variation.length)
      return res
        .status(404)
        .json({ success: false, message: "Variation not found!" });

    // Check duplicate
    const [duplicate] = await conn.query(
      `SELECT * FROM cart WHERE user_id = ? AND variation_id = ?`,
      [user_id, variation_id]
    );
    if (duplicate.length)
      return res
        .status(400)
        .json({ success: false, message: "Already in cart" });

    await conn.query(`INSERT INTO cart (user_id, variation_id) VALUES (?, ?)`, [
      user_id,
      variation_id,
    ]);

    return res
      .status(201)
      .json({ success: true, message: "Item added to cart" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Retrieve all cart items from the database
const getItemCartController = async (req, res) => {
  let token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ success: false, message: "Token required" });

  token = token.split(" ")[1];

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const user = await getUserFn(token);
    const user_id = user.user[0].id;

    const [result] = await conn.query(
      `
      SELECT
        cart.id AS cart_id,
        cart.qty,
        v.id AS variation_id,
        p.id AS product_id,
        p.name AS product_name,
        p.brand,
        p.sellby,
        c.name AS category_name,
        v.sku,
        v.color,
        v.size,
        GROUP_CONCAT(DISTINCT CONCAT('{"url":"', pi.image_url, '"}')) AS image_urls,
        prices.prices
      FROM cart
      JOIN product_variations v ON cart.variation_id = v.id
      JOIN products p ON v.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON pi.product_id = p.id AND LOWER(pi.color) = LOWER(v.color)
      LEFT JOIN (
        SELECT
          variation_id,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'original', original,
              'discountPercentage', discount_percentage,
              'currency', currency
            )
          ) AS prices
        FROM prices
        GROUP BY variation_id
      ) AS prices ON v.id = prices.variation_id

      WHERE cart.user_id = ?
      GROUP BY cart.id, v.id, p.id, p.name, p.brand, p.sellby, c.name, v.sku, v.color, v.size, prices.prices
    `,
      [user_id]
    );

    const processed = result.map((item) => {
      let parsedPrices;
      if (typeof item.prices === "string") {
        try {
          parsedPrices = JSON.parse(item.prices);
        } catch {
          parsedPrices = [];
        }
      } else if (Array.isArray(item.prices)) {
        parsedPrices = item.prices;
      } else {
        parsedPrices = [];
      }

      return {
        cart_id: item.cart_id,
        qty: item.qty,
        product_id: item.product_id,
        product_name: item.product_name,
        brand: item.brand,
        sellby: item.sellby,
        category: item.category_name,
        variation_id: item.variation_id,
        sku: item.sku,
        color: item.color,
        size: item.size,
        image_urls: item.image_urls
          ? item.image_urls
              .split(",")
              .map((img) => {
                try {
                  return JSON.parse(img).url;
                } catch {
                  return null;
                }
              })
              .filter(Boolean)
          : [],
        prices: parsedPrices,
        latest_price: parsedPrices[0]?.original || null,
      };
    });

    return res.status(200).json({
      success: true,
      result: processed,
    });
  } catch (error) {
    console.error("getItemCartController error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//Retrieve a particular user cart item from data
const getParticularUserCartItemController = async (req, res) => {
  const user_id = req.params.userId;
  const conn = await createConnectionDb({ timeout: 10000 });
  //validate user id
  try {
    const [user] = await conn.query(
      "SELECT * FROM shoping_users WHERE id = ? LIMIT 1",
      [user_id]
    );

    console.log(user);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You don't have an account!",
      });
    }
    let token = req.headers.authorization;
    token = token.split(" ");
    token = token[1];
    console.log(token);
    const usermain = await getUserFn(token);
    // console.log(usermain.user[0].id);
    if (usermain.user[0].id == user[0].id) {
      const result = await conn.query(
        `
        SELECT
          cart.id,
          cart.product_id,
          cart.qty,
          su.name AS user_name,
          su.email,
          p.name AS product_name,
          p.brand,
          p.sellby,
          c.name AS category_name,
          GROUP_CONCAT(DISTINCT CONCAT('{"url":"', pi.image_url, '"}')) AS image_urls
        FROM cart
        JOIN shoping_users su ON cart.user_id = su.id
        JOIN products p ON cart.product_id = p.id
        LEFT JOIN product_img pi ON p.id = pi.product_id
        JOIN categories c ON p.category_id = c.id
        WHERE user_id = ?
        GROUP BY cart.id,  cart.product_id, su.name, su.email, p.name, p.brand, p.sellby, c.name;
      `,
        [user_id]
      );

      // Convert the concatenated string to an array of image URLs
      // Inside your try block
      const processedResult = await Promise.all(
        result[0].map(async (item) => {
          const prices = await getProductPrices(conn, item.product_id);
          return {
            ...item,
            image_urls: item.image_urls
              ? item.image_urls.split(",").map((img) => JSON.parse(img).url)
              : [],
            prices,
          };
        })
      );

      if (processedResult.length === 0) {
        return res
          .status(200)
          .json({ success: true, message: "Cart is empty" });
      }

      return res.status(200).json({ success: true, result: processedResult });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "UserId and TokenId doesn't Match" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//delete item from cart table
const removeItemCartController = async (req, res) => {
  const { cart_id } = req.params;
  let token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ success: false, message: "Token required" });
  token = token.split(" ")[1];

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const user = await getUserFn(token);
    const user_id = user.user[0].id;

    const [check] = await conn.query(
      `SELECT * FROM cart WHERE id = ? AND user_id = ? LIMIT 1`,
      [cart_id, user_id]
    );
    if (!check.length) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    await conn.query(`DELETE FROM cart WHERE id = ? AND user_id = ?`, [
      cart_id,
      user_id,
    ]);
    return res
      .status(200)
      .json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//update cart item quantity
const updateCartItemQtyController = async (req, res) => {
  const { itemId } = req.params;
  const { payload } = req.body;
  let token = req.headers.authorization;
  if (!token)
    return res.status(401).json({ success: false, message: "Token required" });
  token = token.split(" ")[1];

  if (!payload)
    return res
      .status(400)
      .json({ success: false, message: "Payload required" });

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const user = await getUserFn(token);
    const user_id = user.user[0].id;

    const [result] = await conn.query(
      `SELECT * FROM cart WHERE id = ? AND user_id = ?`,
      [itemId, user_id]
    );

    if (!result.length)
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });

    const newQty = payload;
    if (newQty <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });

    await conn.query(`UPDATE cart SET qty = ? WHERE id = ?`, [newQty, itemId]);

    return res.status(200).json({ success: true, message: "Quantity updated" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveItemCartController,
  getItemCartController,
  removeItemCartController,
  updateCartItemQtyController,
  getParticularUserCartItemController,
};
