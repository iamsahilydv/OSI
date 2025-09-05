const createConnectionDb = require("../config/pool");

// Get category attributes for validation
const getCategoryAttributes = async (category_id) => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });
    const [attributes] = await conn.query(
      `SELECT * FROM category_attributes WHERE category_id = ? ORDER BY display_order ASC`,
      [category_id]
    );

    return attributes.map((attr) => ({
      ...attr,
      options: attr.options ? JSON.parse(attr.options) : null,
    }));
  } catch (error) {
    console.error("Get category attributes error:", error);
    return [];
  }
};

// Validate product variations based on category attributes
const validateProductVariations = async (category_id, variations) => {
  try {
    const categoryAttributes = await getCategoryAttributes(category_id);
    const requiredAttributes = categoryAttributes.filter(
      (attr) => attr.is_required
    );

    const errors = [];

    for (const variation of variations) {
      const { attributes = {} } = variation;

      // Check required attributes
      for (const requiredAttr of requiredAttributes) {
        if (!attributes[requiredAttr.attribute_name]) {
          errors.push(
            `Missing required attribute: ${requiredAttr.attribute_name}`
          );
        }
      }

      // Validate attribute types
      for (const attr of categoryAttributes) {
        const value = attributes[attr.attribute_name];
        if (value !== undefined && value !== null) {
          switch (attr.attribute_type) {
            case "number":
              if (isNaN(Number(value))) {
                errors.push(`${attr.attribute_name} must be a number`);
              }
              break;
            case "select":
              if (attr.options && !attr.options.includes(value)) {
                errors.push(
                  `${attr.attribute_name} must be one of: ${attr.options.join(
                    ", "
                  )}`
                );
              }
              break;
            case "boolean":
              if (
                typeof value !== "boolean" &&
                !["true", "false", "0", "1"].includes(
                  String(value).toLowerCase()
                )
              ) {
                errors.push(`${attr.attribute_name} must be a boolean value`);
              }
              break;
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (error) {
    console.error("Validate product variations error:", error);
    return {
      isValid: false,
      errors: ["Validation error occurred"],
    };
  }
};

// Get category-specific variation template
const getCategoryVariationTemplate = async (category_id) => {
  try {
    const categoryAttributes = await getCategoryAttributes(category_id);

    const template = {
      category_id,
      attributes: categoryAttributes.map((attr) => ({
        name: attr.attribute_name,
        type: attr.attribute_type,
        required: attr.is_required,
        options: attr.options,
        display_order: attr.display_order,
      })),
    };

    return template;
  } catch (error) {
    console.error("Get category variation template error:", error);
    return null;
  }
};

// Format variations for display
const formatVariationsForDisplay = (variations) => {
  return variations.map((variation) => ({
    ...variation,
    attributes:
      typeof variation.attributes === "string"
        ? JSON.parse(variation.attributes)
        : variation.attributes,
  }));
};

module.exports = {
  getCategoryAttributes,
  validateProductVariations,
  getCategoryVariationTemplate,
  formatVariationsForDisplay,
};
