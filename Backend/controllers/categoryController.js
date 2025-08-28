const createConnectionDb = require("../config/pool");
const { getCategoryVariationTemplate } = require("../helpers/categoryHelper");

const createCategoryController = async (req, res) => {
  try {
    const { category, des } = req.body;

    if (!category || !des) {
      return res.status(400).json({
        success: false,
        message: "Please Provide category & description!",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });
    await conn.query(
      `INSERT INTO categories (name, description) VALUES(?, ?)`,
      [category, des]
    );

    return res
      .status(201)
      .json({ success: true, message: "Category added Successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// get all categories
const getAllCategoryController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const [categories] = await conn.query(`SELECT * FROM categories`);
    if (categories.length == 0) {
      return res
        .status(401)
        .json({ success: false, message: "Data Not Found!" });
    }
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// delete Category from data
const deleteCategoryController = async (req, res) => {
  try {
    const id = req.params.id;
    const conn = await createConnectionDb({ timeout: 10000 });
    await conn.query(`DELETE FROM categories WHERE id =? LIMIT 1`, id);
    return res
      .status(200)
      .json({ success: true, message: "Category Deleted Successfully" });
    ("");
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// Get category variation template
const getCategoryTemplateController = async (req, res) => {
  try {
    const { category_id } = req.params;

    const template = await getCategoryVariationTemplate(category_id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Category template not found!",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCategoryController,
  getAllCategoryController,
  deleteCategoryController,
  getCategoryTemplateController,
};
