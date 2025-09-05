const createConnectionDb = require("../config/pool");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const REGION = "ap-south-1";
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "AKIAXK2ZDP36TTWCCLUQ",
    secretAccessKey: "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",
  },
});

const setProfileImgController = async (req, res) => {
  const { user_id, name, img } = req.body;
  if (!user_id) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide user_id!" });
  }
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide the User name!" });
  }
  if (!img) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Img!" });
  }

  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    await conn.query(`DELETE FROM userProfileImg WHERE user_id =? LIMIT 1`, [
      user_id,
    ]);

    const imageFileName = `${name.replace(/\s/g, "")}_${Date.now()}.png`;
    const imageBuffer = Buffer.from(img, "base64");

    //create img in s3 web
    const s3Params = {
      Bucket: "shoppingboom",
      Key: `ProfileImages/${imageFileName}`,
      Body: imageBuffer,
      ContentType: "image/png",
    };
    await s3Client.send(new PutObjectCommand(s3Params));

    const s3ImageUrl = `https://shoppingboom.s3.ap-south-1.amazonaws.com/ProfileImages/${imageFileName}`;
    const data = [user_id, name, s3ImageUrl];
    await conn.query(
      `INSERT INTO userProfileImg (user_id, username, profile_image)
        VALUES (?, ?, ?)`,
      data
    );

    return res
      .status(201)
      .json({ success: true, message: "Your Profile Img Saved Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error.messages || "Something went wrong!",
    });
  }
};

const deleteProfileImgController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a user ID!" });
    }

    // Retrieve the current profile image path from the database
    const [result] = await conn.query(
      `SELECT profile_image FROM userProfileImg WHERE user_id = ? LIMIT 1`,
      [user_id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found!" });
    }

    const profileImageURL = result[0].profile_image;
    const profileImageFileName = profileImageURL.split("/").pop();
    const imageKey = `ProfileImages/${profileImageFileName}`;
    const s3Params = {
      Bucket: "shoppingboom", // Replace with your S3 bucket name
      Key: imageKey,
    };
    await s3Client.send(new DeleteObjectCommand(s3Params));

    // Delete the user's profile image record from the database
    await conn.query(`DELETE FROM userProfileImg WHERE user_id = ?`, [user_id]);

    return res
      .status(200)
      .json({ success: true, message: "Profile image deleted successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfileImgController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const { user_id } = req.params;
    const { img } = req.body;

    if (!user_id || !img) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide user ID and image!" });
    }

    // Retrieve the current profile image path from the database
    const [result] = await conn.query(
      `SELECT ProfileImage FROM userProfileImg WHERE user_id = ? LIMIT 1`,
      [user_id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User profile not found!" });
    }

    const profileImageURL = result[0].ProfileImage;
    const profileImageFileName = profileImageURL.split("/").pop();

    const imageFileName = `${profileImageFileName}_${Date.now()}.png`;
    const imageBuffer = Buffer.from(img, "base64");

    //create img in s3 web
    const s3Params = {
      Bucket: "shoppingboom",
      Key: `ProfileImages/${imageFileName}`,
      Body: imageBuffer,
      ContentType: "image/png",
    };
    await s3Client.send(new PutObjectCommand(s3Params));

    const s3ImageUrl = `https://shoppingboom.s3.ap-south-1.amazonaws.com/ProfileImages/${imageFileName}`;

    // Update the user's profile image record in the database
    await conn.query(
      `UPDATE userProfileImg SET ProfileImage = ? WHERE user_id = ?`,
      [s3ImageUrl, user_id]
    );
    return res
      .status(200)
      .json({ success: true, message: "Profile image updated successfully!" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProfileImgController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const { user_id } = req.params;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a user ID!" });
    }

    const [result] = await conn.query(
      `SELECT profile_image FROM userProfileImg WHERE user_id = ?`,
      [user_id]
    );

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User profile Image not found!" });
    }

    const profileImageURL = result[0].profile_image;

    // Redirect to the profile image hosted on S3
    return res.redirect(profileImageURL);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || error.messages || "Something went wrong!",
    });
  }
};

module.exports = {
  setProfileImgController,
  deleteProfileImgController,
  updateProfileImgController,
  getProfileImgController,
};
