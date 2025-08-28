const jwt = require("jsonwebtoken");
const createConnectionDb = require("../config/pool");

const {
  verifyPassword,
  hashedPassword,
  Token_verification,
  create_random_string,
  createUserTable,
} = require("../helpers/userHelper");
const {
  createSubscriptionDetailsController,
} = require("./subscribeController");

const {
  createPasswordResetTokensTable,
  generateOTP,
  sendEmail,
} = require("../helpers/authHelper");
const create_binary_tree = require("../BinaryTree/main");
const StageProgressCalculator = require("../helpers/StageProgressCalculator");
// const create_payments = require("../BinaryTree/main");

//login router controller
const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ message: "email is required!", status: 400 });
  }
  if (!password) {
    return res
      .status(400)
      .json({ message: "password is required!", status: 400 });
  }
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const [users] = await conn.query(
      "SELECT * FROM shoping_users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You don't have an account!",
      });
    }

    const hashedPassword = users[0].password;
    //check password
    const isPasswordCorrect = await verifyPassword({
      password,
      hashedPassword,
    });
    if (!isPasswordCorrect) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Password!" });
    }

    const token = jwt.sign({ id: users[0].id }, process.env.SECRET_KEY, {
      expiresIn: "30 days",
    });

    // // Set the token as a cookie
    // res.cookie("token", token, {
    //   httpOnly: true, // Prevents frontend JavaScript from accessing it
    //   // secure: true, // Works only on HTTPS
    //   sameSite: "Lax", // Needed for cross-origin authentication
    //   path: "/", // Ensures cookie is accessible across site
    //   domain:
    //     process.env.ENVIRONMENT === "PROD"
    //       ? ".localhost"
    //       : ".kholaenterprises.in",
    //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days expiration (in milliseconds)
    // });

    return res.status(200).send({
      success: true,
      message: "Login Successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//register user finally
const registerController = async (req, res) => {
  const { name, otp, email, gender, mobile, password, referby } = req.body;

  if (!otp) {
    return res
      .status(400)
      .json({ success: false, message: "OTP is required!" });
  }
  if (!name) {
    return res
      .status(400)
      .json({ message: "name is required!", success: false });
  }
  // if (!gender) {
  //   return res
  //     .status(400)
  //     .json({ message: "Gender is required!", success: false });
  // }
  if (!email) {
    return res
      .status(400)
      .json({ message: "email is required!", success: false });
  }
  if (!mobile) {
    return res
      .status(400)
      .json({ message: "mobile num is required!", success: false });
  }
  if (!password) {
    return res
      .status(400)
      .json({ message: "password is required!", success: false });
  }
  if (!referby) {
    return res
      .status(403)
      .json({ message: "refer ID is required!", success: false });
  }
  if (name == "," || name == ".") {
    return res
      .status(401)
      .json({ message: "Please enter a valid name!", success: false });
  }

  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    //otp validation
    const otp_check = await conn.query(
      `SELECT * FROM loginOtp WHERE email=? LIMIT 1`,
      email
    );
    //if there is not releted otp and email
    if (otp_check[0].length == 0 || otp_check[0][0].email != email) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid OTP or Email!" });
    }
    //match the db otp with entered otp
    if (otp_check[0][0].otp != otp || otp_check[0][0].expire_at < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or Expired OTP!" });
    }

    //check duplicate email
    let duplicate_check = await conn.query(
      `SELECT * FROM shoping_users WHERE email =?`,
      email
    );
    if (duplicate_check[0].length != 0) {
      return res
        .status(409)
        .json({ succuss: false, message: "You are already registered!" });
    }
    // check how many user in database
    const [result12] = await conn.query(
      "SELECT COUNT(*) AS row_count FROM shoping_users"
    );
    const rowCount = result12[0].row_count;

    //check referby id
    let result = await conn.query(
      `SELECT * FROM shoping_users WHERE referId =? LIMIT 1`,
      referby
    );
    if (result[0].length == 0 && rowCount > 0) {
      return res
        .status(409)
        .send({ success: false, message: "Invalid referral ID!" });
    }
    if (result[0].length !== 0) {
      if (result[0][0].status == "inactive") {
        return res.status(409).json({
          success: false,
          message: "Your referal Id`s person is inactive!",
        });
      }
    }

    const securePassword = await hashedPassword(password);
    const referId = await create_random_string(10);
    const role = rowCount != 0 ? "user" : "superAdmin";
    const data = [
      name,
      email,
      mobile,
      gender,
      securePassword,
      referId,
      referby,
      role,
    ];

    await conn.query(
      "INSERT INTO shoping_users(name, email, mobile, gender, password, referId, referby,role) VALUES (?)",
      [data]
    );

    const [userIdResult] = await conn.query(
      "SELECT id FROM shoping_users WHERE email = ? LIMIT 1",
      email
    );
    const userId = userIdResult[0].id;
    const token = jwt.sign({ id: userIdResult[0].id }, process.env.SECRET_KEY, {
      expiresIn: "30 days",
    });
    console.log(userId);
    const userSubscriptionCreation = await createSubscriptionDetailsController(
      { params: { id: userId } },
      res
    );
    if (userSubscriptionCreation) {
      await conn.query(`DELETE FROM loginOtp WHERE email =?`, email);
      await create_binary_tree();
      return res.send({
        message: "Data is saved successfully",
        status: 201,
        token: token,
      });
    } else {
      return res.send({
        message: "Issue in User Subscription Creation",
        status: 500,
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//pre register user otp sender
const preRegisterController = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP(6).toString();

    //set time with 10 min validation
    const expire_time = new Date();
    expire_time.setMinutes(expire_time.getMinutes() + 10);

    // Check if the table exists in the database and create it if not
    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if the table exists
    const tableExists = await conn.query(`SHOW TABLES LIKE 'shoping_users'`);
    if (tableExists[0].length != 0) {
      //check user is registered or not before
      const user_check = await conn.query(
        `SELECT * FROM shoping_users WHERE email = ? LIMIT 1`,
        [email]
      );
      console.log(user_check[0]);
      if (user_check[0].length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "You are already registered!" });
      }
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS loginOtp (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expire_at TIMESTAMP NOT NULL)
    `);
    const subject = "LOGIN VERIFICATION CODE";
    await conn.query(`DELETE FROM loginOtp WHERE email = ?`, email);
    await sendEmail({ otp, email, subject });
    await conn.query(
      "INSERT INTO loginOtp (email, otp, expire_at) VALUES (?, ?, ?)",
      [email, otp, expire_time]
    );
    return res.status(201).json({
      success: true,
      message: `OTP SENT TO YOUR EMAIL ${email}`,
      otp,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

//get all user from data
const getUserController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    const rows = await conn.query("SELECT * FROM shoping_users");

    const usersWithStages = [];
    for (const user of rows[0]) {
      const [downlines] = await conn.query(
        `SELECT * FROM shoping_users WHERE referby = ? and status =?`,
        [user.referId, "active"]
      );
      const stage = await StageProgressCalculator(downlines.length);
      // for syncing user subscription status with subscription table
      const isActive = await conn.query(
        `SELECT * FROM user_subscriptions where user_id = ? and status = ?`,
        [user.id, "active"]
      );
      isActive[0].length > 0
        ? (user.subscription = true)
        : (user.subscription = false);
      // syncing user subscription status with subscription table ends here
      const totalRefered = downlines.length;
      usersWithStages.push({
        ...user,
        stage,
        totalRefered,
      });
    }

    return res.status(200).json({ success: true, Users: usersWithStages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//get particular user from data
const getUserByIdController = async (req, res) => {
  try {
    const { user_id } = req.params;
    const conn = await createConnectionDb({ timeout: 10000 });

    const [user] = await conn.query("SELECT * FROM shoping_users WHERE id =?", [
      user_id,
    ]);
    if (!user || user.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found!" });
    }
    const [downlines] = await conn.query(
      `SELECT * FROM shoping_users WHERE referby = ? `,
      [user[0].referId]
    );
    let stage = await StageProgressCalculator(downlines.length);
    return res.status(200).json({ success: true, user: user[0], stage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// update value in particular user profile
const updateUserStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Please Provide User Id!" });
    }
    const conn = await createConnectionDb({ timeout: 10000 });
    let check_id = await conn.query(
      `SELECT * FROM shoping_users WHERE id =?`,
      id
    );
    if (check_id[0].length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Please Provide a valid Id!" });
    }
    let response = userUpdateFn(id, status);
    if (response) {
      return res
        .status(200)
        .json({ success: true, message: "Status Updated Successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Error in binary tree response" });
    }
  } catch (error) {
    return res.status(500), json({ success: false, error: error });
  }
};
const updateValueController = async (req, res) => {
  try {
    const { id } = req.body;
    // console.log(`id is ${id}`);
    if (!id) {
      return res
        .status(401)
        .json({ success: false, message: "Please Provide User Id!" });
    }
    if (req.body.status) {
      return res.status(404).json({
        success: false,
        message: "You Can't Update a User Status by this API",
      });
    }
    const conn = await createConnectionDb({ timeout: 10000 });
    let check_id = await conn.query(
      `SELECT * FROM shoping_users WHERE id =?`,
      id
    );
    if (check_id[0].length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Please Provide a valid Id!" });
    }
    //  limit parent id two AND  validate it
    // if (parent_ref_id) {
    //   let validate_parent = await conn.query(
    //     `SELECT * FROM shoping_users WHERE referId = ? LIMIT 1`,
    //     parent_ref_id
    //   );
    //   if (validate_parent[0] == 0) {
    //     return res
    //       .status(400)
    //       .json({ success: false, message: "Invalid Parent Refferal ID!" });
    //   }
    //   let check_parent = await conn.query(
    //     `SELECT * FROM shoping_users WHERE parent_ref_id = ?`,
    //     parent_ref_id
    //   );
    //   //LIMIT AS  A USER ADD ONLY TWO CHILDREN
    //   if (check_parent[0].length >= 2) {
    //     return res.status(400).json({
    //       success: true,
    //       message: "You can share Id only with two User!",
    //     });
    //   }
    // }
    const data = req.body;
    await conn.query("UPDATE shoping_users SET ? WHERE id = ?", [
      data,
      data.id,
    ]);

    return res
      .status(200)
      .json({ message: "Data updated successfully!", success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const userUpdateFn = async (id, status) => {
  try {
    console.log("in update user function", id, status);
    const conn = await createConnectionDb({ timeout: 10000 });
    let check_id = await conn.query(
      `SELECT * FROM shoping_users WHERE id =?`,
      id
    );
    let dbResponse = await conn.query(
      `UPDATE shoping_users SET status = ? WHERE id = ?`,
      [status, id]
    );

    // Correctly check for errors or affected rows
    if (dbResponse[0].affectedRows === 0) {
      console.log("No rows updated. User with given ID might not exist.");
      return false; // Or handle this case differently, maybe throw an error
    } else if (dbResponse[1]) {
      // dbResponse[1] contains errors if any
      console.error("Database error:", dbResponse[1]);
      return false;
    } else {
      const parent_id = check_id[0][0].referby; // Make sure check_id is defined and has the expected structure
      console.log("this function");
      const response = await create_binary_tree(); // Pass parent_id to the tree function
      if (!response) {
        console.log("hiiii");
        return false;
      } else {
        console.log("hellooo");
        return true;
      }
    }
  } catch (error) {
    return false;
  }
};

//forgot password
const fortgotPasswordController = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      res
        .status(401)
        .json({ success: false, message: "Please provide a eamil Id!" });
    }
    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if the email exists in the database
    const result = await conn.query(
      `SELECT * FROM shoping_users WHERE email = ?`,
      email
    );

    //if email is not valid
    if (result[0].length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email Id!" });
    }
    //check table is exist in database
    const [tableExists] = await conn.query(
      "SHOW TABLES LIKE 'PasswordResetOtps'"
    );
    if (tableExists.length == 0) {
      await createPasswordResetTokensTable();
    }
    //if table is exist and search if email data is exist or not
    const checkResetUser = await conn.query(
      `SELECT * FROM PasswordResetOtps WHERE email = ?`,
      email
    );
    if (checkResetUser[0].length > 0) {
      const query = `
      DELETE FROM PasswordResetOtps
      WHERE email = ?
    `;
      await conn.query(query, [email]);
    }
    const otp = generateOTP(6);
    // create otp expire time with add 10 minutes
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);
    //insert otp in database
    const query = `
    INSERT INTO PasswordResetOtps (user_id,email, otp, expirationDate)
    VALUES (?, ?, ?, ?)
  `;
    let user_id = await result[0][0].id;
    const data = [user_id, email, otp, expirationDate];
    await conn.query(query, data);
    const subject = "RESET PASSWORD CODE";
    await sendEmail({ otp, email, subject });
    return res
      .status(200)
      .json({ success: true, message: "OTP sent in your registered email Id" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//verify otp
const verifyOtpController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide email, otp or New Password!",
    });
  }
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const result = await conn.query(
      `SELECT * FROM PasswordResetOtps WHERE email= ? AND otp= ? LIMIT 1`,
      [email, otp]
    );
    if (result[0].length == 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email Id or OTP!" });
    }
    //check if user new password and old password is same
    const user = await conn.query(
      `SELECT * FROM shoping_users WHERE email=? LIMIT 1`,
      email
    );
    const check_password = await verifyPassword({
      password: newPassword,
      hashedPassword: user[0][0].password,
    });
    if (check_password) {
      return res.status(409).json({
        success: false,
        message: "You can not replace with same password!",
      });
    }
    if (result[0][0].expirationDate < new Date()) {
      return res.status(410).json({ success: false, message: "OTP Expired!" });
    }
    //reset password
    const hash_password = await hashedPassword(newPassword);
    await conn.query("UPDATE shoping_users SET password = ? WHERE email = ?", [
      hash_password,
      email,
    ]);
    await conn.query(`DELETE FROM PasswordResetOtps WHERE email=?`, email);
    return res
      .status(200)
      .json({ success: true, message: "Password Changed Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// reset password
const resetPasswordController = async (req, res) => {
  const { email, password, newPassword } = req.body;
  if (!email || !password || !newPassword) {
    return res
      .status(401)
      .json({ success: false, message: "Please Provide Proper Value!" });
  }
  try {
    //email validate
    const conn = await createConnectionDb({ timeout: 10000 });
    const user = await conn.query(
      `SELECT * FROM shoping_users WHERE email = ?`,
      email
    );
    if (user[0].length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Email not Found!" });
    }
    let dbPassword = user[0][0].password;
    let matchPassword = await verifyPassword({
      password,
      hashedPassword: dbPassword,
    });
    if (!matchPassword) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Pasword!",
        password,
        dbPassword,
      });
    }

    let makeHashPassword = await hashedPassword(newPassword);
    const query2 = `
      UPDATE shoping_users
      SET password = ?
      WHERE email = ?
    `;
    await conn.query(query2, [makeHashPassword, email]);
    return res
      .status(200)
      .json({ success: true, message: "Password updated Successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const disableUser = async () => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    // console.log(conn);
    const [user] = await conn.query(
      `UPDATE shoping_users SET isUserEnabled = ? WHERE status = ? AND created_at < NOW() - INTERVAL 1 MONTH;`,
      [false, "inactive"]
    );
    if (user.affectedRows) {
      console.log("User Updated Successfully!");
    }
    // const [users] = await conn.query(`select * from shoping_users;`);
    // console.log(users.affectedRows);
    // res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Personalized product recommendations for user dashboard
 * GET /api/v1/users/:user_id/dashboard-recommendations
 */
const getDashboardRecommendations = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "User Id is required!" });
    }
    const conn = await createConnectionDb({ timeout: 10000 });
    // 1. Get product IDs from user's order history
    const [orderRows] = await conn.query(
      `SELECT o.variation_id, v.product_id FROM orders o
       JOIN order_groups og ON o.order_group_id = og.id
       JOIN product_variations v ON o.variation_id = v.id
       WHERE og.user_id = ?`,
      [user_id]
    );
    // 2. Get product IDs from user's cart
    const [cartRows] = await conn.query(
      `SELECT variation_id FROM cart WHERE user_id = ?`,
      [user_id]
    );
    // 3. Aggregate product IDs
    const purchasedProductIds = new Set(orderRows.map((r) => r.product_id));
    const cartProductIds = new Set();
    if (cartRows.length > 0) {
      const [cartProducts] = await conn.query(
        `SELECT product_id FROM product_variations WHERE id IN (?)`,
        [cartRows.map((r) => r.variation_id)]
      );
      cartProducts.forEach((r) => cartProductIds.add(r.product_id));
    }
    // 4. Recommend products from the same categories as purchased/cart products, excluding already purchased/carted
    let categoryIds = [];
    if (purchasedProductIds.size > 0 || cartProductIds.size > 0) {
      const allProductIds = Array.from(
        new Set([...purchasedProductIds, ...cartProductIds])
      );
      const [categories] = await conn.query(
        `SELECT DISTINCT category_id FROM products WHERE id IN (?)`,
        [allProductIds]
      );
      categoryIds = categories.map((c) => c.category_id);
    }
    let recommendations = [];
    if (categoryIds.length > 0) {
      const excludeIds = Array.from(
        new Set([...purchasedProductIds, ...cartProductIds])
      );
      const [recs] = await conn.query(
        `SELECT * FROM products WHERE category_id IN (?) AND id NOT IN (?) LIMIT 10`,
        [categoryIds, excludeIds.length > 0 ? excludeIds : [0]]
      );
      recommendations = recs;
    } else {
      // fallback: recommend top 10 products
      const [recs] = await conn.query(
        `SELECT * FROM products ORDER BY id DESC LIMIT 10`
      );
      recommendations = recs;
    }
    // 5. Attach images to recommendations
    const productIds = recommendations.map((p) => p.id);
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
    const recommendationsWithImages = recommendations.map((p) => ({
      ...p,
      images: imagesMap[p.id] || [],
    }));
    return res
      .status(200)
      .json({ success: true, data: recommendationsWithImages });
  } catch (error) {
    console.error("getDashboardRecommendations error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

/**
 * Customer Segmentation using K-means-like clustering (simple, in-memory)
 * GET /api/v1/users/customer-segments
 */
const getCustomerSegments = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    // 1. Get all users
    const [users] = await conn.query(
      `SELECT id, gender, total_income, total_withdraw, today_income, created_at FROM shoping_users WHERE role = 'user' AND isUserEnabled = TRUE`
    );
    // 2. Get order counts and total spent for each user
    const [orderStats] = await conn.query(
      `SELECT og.user_id, COUNT(o.id) AS order_count, SUM(o.price * o.qty) AS total_spent
       FROM order_groups og
       JOIN orders o ON og.id = o.order_group_id
       GROUP BY og.user_id`
    );
    const orderMap = {};
    orderStats.forEach((row) => {
      orderMap[row.user_id] = {
        order_count: Number(row.order_count),
        total_spent: Number(row.total_spent || 0),
      };
    });
    // 3. Prepare feature vectors
    const featureVectors = users.map((u) => {
      const stats = orderMap[u.id] || { order_count: 0, total_spent: 0 };
      return {
        id: u.id,
        gender: u.gender === "male" ? 0 : u.gender === "female" ? 1 : 2,
        total_income: Number(u.total_income),
        total_withdraw: Number(u.total_withdraw),
        today_income: Number(u.today_income),
        order_count: stats.order_count,
        total_spent: stats.total_spent,
        account_age_days: Math.floor(
          (Date.now() - new Date(u.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
    });
    // 4. Simple K-means-like clustering (3 clusters: low, medium, high value)
    // We'll use total_spent and order_count as main features
    const k = 3;
    const centroids = [
      { total_spent: 0, order_count: 0 },
      { total_spent: 1000, order_count: 5 },
      { total_spent: 5000, order_count: 20 },
    ];
    let changed = true;
    let assignments = new Array(featureVectors.length).fill(0);
    let iter = 0;
    while (changed && iter < 10) {
      changed = false;
      // Assign
      for (let i = 0; i < featureVectors.length; i++) {
        const fv = featureVectors[i];
        let minDist = Infinity;
        let best = 0;
        for (let c = 0; c < k; c++) {
          const dist =
            Math.pow(fv.total_spent - centroids[c].total_spent, 2) +
            Math.pow(fv.order_count - centroids[c].order_count, 2);
          if (dist < minDist) {
            minDist = dist;
            best = c;
          }
        }
        if (assignments[i] !== best) {
          assignments[i] = best;
          changed = true;
        }
      }
      // Update centroids
      for (let c = 0; c < k; c++) {
        const cluster = featureVectors.filter((_, i) => assignments[i] === c);
        if (cluster.length > 0) {
          centroids[c].total_spent =
            cluster.reduce((sum, fv) => sum + fv.total_spent, 0) /
            cluster.length;
          centroids[c].order_count =
            cluster.reduce((sum, fv) => sum + fv.order_count, 0) /
            cluster.length;
        }
      }
      iter++;
    }
    // 5. Return segments
    const segments = featureVectors.map((fv, i) => ({
      user_id: fv.id,
      segment: assignments[i], // 0: low, 1: medium, 2: high value
      total_spent: fv.total_spent,
      order_count: fv.order_count,
      account_age_days: fv.account_age_days,
    }));
    return res.status(200).json({ success: true, segments });
  } catch (error) {
    console.error("getCustomerSegments error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

/**
 * Sales Forecasting using simple moving average
 * GET /api/v1/orders/sales-forecast
 */
const getSalesForecast = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    // 1. Get daily sales for the last 60 days
    const [salesRows] = await conn.query(
      `SELECT DATE(created_at) as date, SUM(price * qty) as total_sales
       FROM orders
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 60`
    );
    // 2. Prepare time series (reverse to chronological order)
    const salesSeries = salesRows.reverse();
    // 3. Use moving average (window=7) for forecast
    const window = 7;
    const forecasts = [];
    for (let i = 0; i < 7; i++) {
      const recent = salesSeries.slice(-window);
      const avg =
        recent.reduce((sum, r) => sum + Number(r.total_sales || 0), 0) /
        (recent.length || 1);
      forecasts.push({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
        forecast: Math.round(avg * 100) / 100,
      });
      salesSeries.push({ date: forecasts[i].date, total_sales: avg });
    }
    return res.status(200).json({ success: true, forecasts });
  } catch (error) {
    console.error("getSalesForecast error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};
/**
 * Basic Fraud Detection (rule-based & anomaly detection)
 * GET /api/v1/orders/fraud-detection
 */
const getFraudDetection = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    // 1. Get recent orders and transactions
    const [orders] = await conn.query(
      `SELECT og.id as order_group_id, og.user_id, og.total_amount, og.created_at, o.qty, o.price
       FROM order_groups og
       JOIN orders o ON og.id = o.order_group_id
       WHERE og.created_at > NOW() - INTERVAL 30 DAY`
    );
    // 2. Rule-based: flag orders with unusually high amount or quantity
    const suspiciousOrders = orders.filter(
      (o) => o.total_amount > 10000 || o.qty > 10
    );
    // 3. Anomaly: flag users with >3 orders/day or >3x their average order amount
    const userOrderMap = {};
    orders.forEach((o) => {
      if (!userOrderMap[o.user_id]) userOrderMap[o.user_id] = [];
      userOrderMap[o.user_id].push(o);
    });
    const flaggedUsers = [];
    for (const userId in userOrderMap) {
      const userOrders = userOrderMap[userId];
      const avgAmount =
        userOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) /
        userOrders.length;
      const byDay = {};
      userOrders.forEach((o) => {
        const day = o.created_at.toISOString().slice(0, 10);
        if (!byDay[day]) byDay[day] = 0;
        byDay[day]++;
      });
      const maxOrdersPerDay = Math.max(...Object.values(byDay));
      if (maxOrdersPerDay > 3)
        flaggedUsers.push({ user_id: userId, reason: "High order frequency" });
      if (userOrders.some((o) => o.total_amount > 3 * avgAmount))
        flaggedUsers.push({ user_id: userId, reason: "Order amount anomaly" });
    }
    return res
      .status(200)
      .json({ success: true, suspiciousOrders, flaggedUsers });
  } catch (error) {
    console.error("getFraudDetection error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

module.exports = {
  loginController,
  updateValueController,
  registerController,
  getUserController,
  fortgotPasswordController,
  resetPasswordController,
  verifyOtpController,
  preRegisterController,
  getUserByIdController,
  userUpdateFn,
  updateUserStatus,
  disableUser,
  getDashboardRecommendations,
  getCustomerSegments,
  getSalesForecast,
  getFraudDetection,
};
