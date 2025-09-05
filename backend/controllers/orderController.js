const createConnectionDb = require("../config/pool");
const { getUserFn } = require("../helpers/authHelper");
const getProductPrices = require("../helpers/priceHelper");
const createQikinkOrder = require("../services/qikinkOrder");
const getQikinkOrderStatus = require("../services/qikinkOrderStatus");
const { userUpdateFn } = require("./userController");
const {
  createSingleOrderComissionOfParent,
  resaleValueComission,
} = require("../helpers/referPaymentHelper");

// ✅ Get orders for logged-in user
const getAllOrdersController = async (req, res) => {
  try {
    const pool = await createConnectionDb();
    const token = req.headers.authorization?.split(" ")[1];
    const user = await getUserFn(token);
    const userId = user?.user?.[0]?.id;

    const [orders] = await pool.query(
      `
      SELECT 
        og.id AS order_group_id,
        og.user_id,
        og.total_amount,
        og.paymentMode,
        og.addressId,
        og.created_at,

        -- Address Info
        JSON_OBJECT(
          'id', a.id,
          'AddressLine1', a.AddressLine1,
          'AddressLine2', a.AddressLine2,
          'City', a.City,
          'State', a.State,
          'PostalCode', a.PostalCode,
          'Country', a.Country,
          'IsDefault', a.IsDefault,
          'IsEnabled', a.isEnabled
        ) AS address,

        -- Nested Items
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'order_id', o.id,
            'variation_id', v.id,
            'qty', o.qty,
            'price', o.price,
            'discountPercentag', o.discountPercentag,
            'original_price', o.original_price,
            'qikink_order_id', o.qikink_order_id,
            'delivered_at', o.delivered_at,

            -- Variation Info
            'sku', v.sku,
            'size', v.size,
            'color', v.color,
            'selling_price', v.selling_price,
            'is_available', v.is_available,

            -- Product Info
            'product_id', p.id,
            'product_name', p.name,
            'product_description', p.description,
            'brand', p.brand,

            -- Color-specific images
            'product_images', (
              SELECT JSON_ARRAYAGG(JSON_OBJECT('url', pi.image_url))
              FROM product_images pi
              WHERE pi.product_id = p.id AND LOWER(pi.color) = LOWER(v.color)
            ),

            -- Prices from prices table
            'prices', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', pr.id,
                  'variation_id', pr.variation_id,
                  'original', pr.original,
                  'discount_percentage', pr.discount_percentage,
                  'currency', pr.currency
                )
              )
              FROM prices pr
              WHERE pr.variation_id = v.id
            )
          )
        ) AS items

      FROM order_groups og
      JOIN orders o ON og.id = o.order_group_id
      LEFT JOIN product_variations v ON o.variation_id = v.id
      LEFT JOIN products p ON v.product_id = p.id
      LEFT JOIN UserAddresses a ON og.addressId = a.id

      WHERE og.user_id = ?

      GROUP BY og.id
      ORDER BY og.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({ success: true, result: orders });
  } catch (err) {
    console.error("getAllOrdersController error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ✅ Get single order group (with all items)
const getSingleOrdersController = async (req, res) => {
  try {
    const pool = await createConnectionDb();
    const token = req.headers.authorization?.split(" ")[1];
    const { orderId } = req.params;
    const user = await getUserFn(token);
    const userId = user?.user?.[0]?.id;

    const [[group]] = await pool.query(
      `SELECT * FROM order_groups WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const [items] = await pool.query(
      `SELECT * FROM orders WHERE order_group_id = ?`,
      [orderId]
    );

    const enrichedItems = await Promise.all(
      items.map(async (order) => {
        let qikinkStatus = null;
        if (order.qikink_order_id) {
          qikinkStatus = await getQikinkOrderStatus(order.qikink_order_id);
        }
        return { ...order, tracking: qikinkStatus || null };
      })
    );

    return res.status(200).json({
      success: true,
      result: {
        ...group,
        items: enrichedItems,
      },
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Create a new order group and items
const createOrderController = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: Token missing" });
  }

  const { items, addressId, paymentMode } = req.body;

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    !addressId ||
    !paymentMode
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid request: Provide items[], addressId, and paymentMode",
    });
  }

  const pool = await createConnectionDb();
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const user = await getUserFn(token);
    const userId = user?.user?.[0]?.id;

    // ✅ Check if address belongs to user
    const [addressCheck] = await conn.query(
      `SELECT id FROM UserAddresses WHERE id = ? AND userId = ? LIMIT 1`,
      [addressId, userId]
    );
    if (addressCheck.length === 0) {
      throw new Error("Invalid addressId: Address does not belong to user");
    }

    // ✅ Parallel fetch variations & product stock
    const variationResults = await Promise.all(
      items.map((item) =>
        conn
          .query(
            `SELECT v.*, p.id AS product_id, p.qty AS stock
             FROM product_variations v
             JOIN products p ON v.product_id = p.id
             WHERE v.id = ?`,
            [item.variation_id]
          )
          .then(([rows]) => ({
            variation: rows[0],
            item,
          }))
      )
    );

    // ✅ Validate and collect item info
    const enrichedItems = [];
    let total_amount = 0;

    const priceResults = await Promise.all(
      variationResults.map(({ item }) =>
        getProductPrices(conn, item.variation_id)
      )
    );

    for (let i = 0; i < variationResults.length; i++) {
      const { variation, item } = variationResults[i];
      const prices = priceResults[i];
      const priceObj = prices[0] || {};

      if (!variation) {
        throw new Error(`Variation ${item.variation_id} not found`);
      }

      if (variation.stock < item.qty) {
        throw new Error(
          `Insufficient stock for variation ${item.variation_id}`
        );
      }

      const totalForItem = (priceObj.current || 0) * item.qty;
      total_amount += totalForItem;

      enrichedItems.push({
        variation_id: item.variation_id,
        qty: item.qty,
        price: priceObj.current || 0,
        discountPercentag: priceObj.discountPercentage || 0,
        original_price: priceObj.original || 0,
        product_id: variation.product_id,
      });
    }

    // ✅ Insert order group
    const [orderGroupRes] = await conn.query(
      `INSERT INTO order_groups (user_id, paymentMode, addressId, total_amount)
       VALUES (?, ?, ?, ?)`,
      [userId, paymentMode, addressId, total_amount]
    );

    const order_group_id = orderGroupRes.insertId;

    // ✅ Insert orders and update stock in parallel
    const orderInsertPromises = enrichedItems.map((item) =>
      conn.query(
        `INSERT INTO orders (order_group_id, variation_id, qty, price, discountPercentag, original_price) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          order_group_id,
          item.variation_id,
          item.qty,
          item.price,
          item.discountPercentag,
          item.original_price,
        ]
      )
    );

    const stockUpdatePromises = enrichedItems.map((item) =>
      conn.query(`UPDATE products SET qty = qty - ? WHERE id = ?`, [
        item.qty,
        item.product_id,
      ])
    );

    await Promise.all([...orderInsertPromises, ...stockUpdatePromises]);

    await userUpdateFn(userId, "active");

    await conn.commit();
    return res
      .status(201)
      .json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("createOrderController error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  } finally {
    conn.release();
  }
};

// ✅ Admin Panel - All Orders
const getOrderAdminPanel = async (req, res) => {
  try {
    const conn = await createConnectionDb();
    const token = req.headers.authorization?.split(" ")[1];
    const user = await getUserFn(token);
    const currentUser = user?.user?.[0];

    if (!currentUser || currentUser.role !== "superAdmin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const [groups] = await conn.query(`
      SELECT og.*, u.name AS user_name, u.email
      FROM order_groups og
      JOIN shoping_users u ON og.user_id = u.id
      ORDER BY og.created_at DESC
    `);

    for (const group of groups) {
      const [items] = await conn.query(
        `SELECT o.*, p.name AS product_name, p.brand, p.sellby, 
                c.name AS category_name, v.color, v.size,
                GROUP_CONCAT(DISTINCT CONCAT('{"url":"', pi.image_url, '"}')) AS image_urls
         FROM orders o
         JOIN product_variations v ON o.variation_id = v.id
         JOIN products p ON v.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         LEFT JOIN product_images pi ON pi.product_id = p.id AND LOWER(pi.color) = LOWER(v.color)
         WHERE o.order_group_id = ?
         GROUP BY o.id`,
        [group.id]
      );

      group.items = items.map((item) => ({
        ...item,
        image_urls: item.image_urls
          ? item.image_urls.split(",").map((img) => JSON.parse(img).url)
          : [],
      }));
    }

    return res.status(200).json({ success: true, result: groups });
  } catch (error) {
    console.error("Admin Panel Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update order group status (admin)
const updateOrderController = async (req, res) => {
  const { orderId } = req.params;
  const { delivered, pymentStatus } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  const pool = await createConnectionDb();
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const user = await getUserFn(token);
    const currentUser = user?.user?.[0];
    if (!currentUser || currentUser.role !== "superAdmin") {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    const [[group]] = await conn.query(
      `SELECT * FROM order_groups WHERE id = ?`,
      [orderId]
    );
    if (!group) throw new Error("Order group not found");

    await conn.query(
      `UPDATE order_groups SET delivered = ?, pymentStatus = ?, paidAmount = total_amount WHERE id = ?`,
      [delivered, pymentStatus, orderId]
    );

    if (pymentStatus === true) {
      await userUpdateFn(group.user_id, "active");

      const [items] = await conn.query(
        `SELECT o.id as order_id, o.*, v.sku, p.is_pod, u.name, u.mobile, u.email,
                a.AddressLine1, a.City, a.State, a.PostalCode as pincode
         FROM orders o
         JOIN order_groups og ON o.order_group_id = og.id
         JOIN product_variations v ON o.variation_id = v.id
         JOIN products p ON v.product_id = p.id
         JOIN shoping_users u ON og.user_id = u.id
         JOIN UserAddresses a ON og.addressId = a.id
         WHERE o.order_group_id = ?`,
        [orderId]
      );

      const podItems = [];
      for (const item of items) {
        if (item.is_pod && item.sku) {
          podItems.push({
            search_from_my_products: 1,
            sku: item.sku,
            quantity: item.qty,
            price: item.price,
          });
        }
      }

      // ✅ If there are POD items, attempt Qikink order creation
      if (podItems.length > 0) {
        const qikinkPayload = {
          order_number: `ORD${orderId}`,
          qikink_shipping: "1",
          gateway: "Prepaid",
          total_order_value: group.total_amount,
          line_items: podItems,
          add_ons: [
            {
              box_packing: 1,
              gift_wrap: 0,
              rush_order: 0,
            },
          ],
          shipping_address: {
            first_name: items[0].name,
            last_name: "",
            address1: items[0].AddressLine1 || "N/A",
            phone: items[0].mobile,
            email: items[0].email || "support@onestepindia.in",
            city: items[0].City,
            zip: items[0].pincode,
            province: items[0].State,
            country_code: "IN",
          },
        };

        // console.log(qikinkPayload);
        try {
          const qikinkResponse = await createQikinkOrder(qikinkPayload);
          // console.log(qikinkResponse);

          // ✅ Optional: Store Qikink order ID in all affected POD rows
          if (qikinkResponse?.order_id) {
            for (const item of items) {
              if (item.is_pod) {
                await conn.query(
                  `UPDATE orders SET qikink_order_id = ? WHERE id = ?`,
                  [qikinkResponse.order_id, item.order_id]
                );
              }
            }
          } else {
            throw new Error("Qikink did not return order_id");
          }
        } catch (qError) {
          throw new Error("Qikink order failed: " + qError.message);
        }
      }

      // ✅ Handle commission only after Qikink succeeds (if applicable)
      const [userDetails] = await conn.query(
        `SELECT * FROM shoping_users WHERE id = ?`,
        [group.user_id]
      );

      const [parentUser] = await conn.query(
        `SELECT * FROM shoping_users WHERE referId = ?`,
        [userDetails[0].referby]
      );

      const [orderCountResult] = await conn.query(
        `SELECT COUNT(*) AS orderCount FROM order_groups WHERE user_id = ? AND pymentStatus = TRUE`,
        [userDetails[0].id]
      );

      if (userDetails[0].referby && parentUser.length > 0) {
        const count = orderCountResult[0].orderCount;

        if (count === 1) {
          await createSingleOrderComissionOfParent(
            userDetails[0].referby,
            parentUser[0].status,
            group.total_amount
          );
        } else if (count > 1 && parentUser[0].status === "active") {
          await resaleValueComission(
            userDetails[0].referby,
            parentUser[0].status,
            group.total_amount
          );
        }
      }
    }

    await conn.commit();
    return res
      .status(200)
      .json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("updateOrderController error:", error);
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  getAllOrdersController,
  createOrderController,
  getSingleOrdersController,
  updateOrderController,
  getOrderAdminPanel,
};
