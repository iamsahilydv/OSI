const createConnectionDb = require("../config/pool");

// Add attribute to a category
const addCategoryAttributeController = async (req, res) => {
  try {
    const {
      category_id,
      attribute_name,
      attribute_type,
      is_required = false,
      options = null,
      display_order = 0,
    } = req.body;

    if (!category_id || !attribute_name || !attribute_type) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide category_id, attribute_name, and attribute_type!",
      });
    }

    const conn = await createConnectionDb({ timeout: 10000 });

    // Check if category exists
    const [categoryExists] = await conn.query(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );

    if (categoryExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found!",
      });
    }

    await conn.query(
      `INSERT INTO category_attributes (category_id, attribute_name, attribute_type, is_required, options, display_order) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        attribute_name,
        attribute_type,
        is_required,
        JSON.stringify(options),
        display_order,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Category attribute added successfully",
    });
  } catch (error) {
    console.error("Add category attribute error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get attributes for a specific category
const getCategoryAttributesController = async (req, res) => {
  try {
    const { category_id } = req.params;

    const conn = await createConnectionDb({ timeout: 10000 });
    const [attributes] = await conn.query(
      `SELECT * FROM category_attributes WHERE category_id = ? ORDER BY display_order ASC`,
      [category_id]
    );

    return res.status(200).json({
      success: true,
      attributes: attributes.map((attr) => ({
        ...attr,
        options: attr.options ? JSON.parse(attr.options) : null,
      })),
    });
  } catch (error) {
    console.error("Get category attributes error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update category attribute
const updateCategoryAttributeController = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      attribute_name,
      attribute_type,
      is_required,
      options,
      display_order,
    } = req.body;

    const conn = await createConnectionDb({ timeout: 10000 });

    const updateFields = [];
    const updateValues = [];

    if (attribute_name) {
      updateFields.push("attribute_name = ?");
      updateValues.push(attribute_name);
    }
    if (attribute_type) {
      updateFields.push("attribute_type = ?");
      updateValues.push(attribute_type);
    }
    if (is_required !== undefined) {
      updateFields.push("is_required = ?");
      updateValues.push(is_required);
    }
    if (options !== undefined) {
      updateFields.push("options = ?");
      updateValues.push(JSON.stringify(options));
    }
    if (display_order !== undefined) {
      updateFields.push("display_order = ?");
      updateValues.push(display_order);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update!",
      });
    }

    updateValues.push(id);
    await conn.query(
      `UPDATE category_attributes SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return res.status(200).json({
      success: true,
      message: "Category attribute updated successfully",
    });
  } catch (error) {
    console.error("Update category attribute error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Delete category attribute
const deleteCategoryAttributeController = async (req, res) => {
  try {
    const { id } = req.params;

    const conn = await createConnectionDb({ timeout: 10000 });
    await conn.query("DELETE FROM category_attributes WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Category attribute deleted successfully",
    });
  } catch (error) {
    console.error("Delete category attribute error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Get all category attributes (for admin)
const getAllCategoryAttributesController = async (req, res) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const [attributes] = await conn.query(`
      SELECT ca.*, c.name as category_name 
      FROM category_attributes ca 
      JOIN categories c ON ca.category_id = c.id 
      ORDER BY c.name, ca.display_order
    `);

    return res.status(200).json({
      success: true,
      attributes: attributes.map((attr) => ({
        ...attr,
        options: attr.options ? JSON.parse(attr.options) : null,
      })),
    });
  } catch (error) {
    console.error("Get all category attributes error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addCategoryAttributeController,
  getCategoryAttributesController,
  updateCategoryAttributeController,
  deleteCategoryAttributeController,
  getAllCategoryAttributesController,
};
