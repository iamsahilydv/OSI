// Validation schemas
const validationSchemas = {
  createProduct: {
    body: {
      name: { type: "string", required: true, minLength: 1, maxLength: 500 },
      category_id: { type: "number", required: true },
      product_type: {
        type: "string",
        enum: ["own", "dropship", "pod", "affiliate"],
      },
      brand: { type: "string", maxLength: 100 },
      description: { type: "string" },
      attributes: { type: "object" },
      variations: { type: "array" },
      status: {
        type: "string",
        enum: ["active", "inactive", "out_of_stock", "discontinued"],
      },
    },
  },
  createCategory: {
    body: {
      name: { type: "string", required: true, minLength: 1, maxLength: 255 },
      description: { type: "string" },
      parent_id: { type: "number" },
    },
  },
  createSupplier: {
    body: {
      name: { type: "string", required: true, minLength: 1, maxLength: 255 },
      email: { type: "string", required: true, format: "email" },
      company_name: { type: "string", maxLength: 255 },
      phone: { type: "string", maxLength: 50 },
    },
  },
  addToCart: {
    body: {
      variation_id: { type: "number", required: true },
      quantity: { type: "number", minimum: 1 },
      price_type: { type: "string", enum: ["regular", "sale", "wholesale"] },
    },
  },
  updateCartQuantity: {
    body: {
      quantity: { type: "number", required: true, minimum: 1 },
    },
  },
};

// Helper function for request validation
const validateRequest = (req, schema) => {
  const errors = [];

  if (schema.body) {
    for (const [field, rules] of Object.entries(schema.body)) {
      const value = req.body[field];

      // Check required fields
      if (
        rules.required &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field} is required`);
        continue;
      }

      // Skip validation if field is not provided and not required
      if (value === undefined || value === null) continue;

      // Type validation
      if (rules.type && typeof value !== rules.type) {
        errors.push(`${field} must be of type ${rules.type}`);
        continue;
      }

      // String validations
      if (rules.type === "string") {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(
            `${field} must be at least ${rules.minLength} characters long`
          );
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(
            `${field} must be at most ${rules.maxLength} characters long`
          );
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(", ")}`);
        }
        if (
          rules.format === "email" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errors.push(`${field} must be a valid email address`);
        }
      }

      // Number validations
      if (rules.type === "number") {
        if (rules.minimum && value < rules.minimum) {
          errors.push(`${field} must be at least ${rules.minimum}`);
        }
        if (rules.maximum && value > rules.maximum) {
          errors.push(`${field} must be at most ${rules.maximum}`);
        }
      }

      // Array validations
      if (rules.type === "array" && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      }

      // Object validations
      if (
        rules.type === "object" &&
        (typeof value !== "object" || Array.isArray(value) || value === null)
      ) {
        errors.push(`${field} must be an object`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Middleware factory function
const validateRequestMiddleware = (schemaName) => {
  return (req, res, next) => {
    const schema = validationSchemas[schemaName];

    if (!schema) {
      return res.status(500).json({
        success: false,
        message: `Validation schema '${schemaName}' not found.`,
      });
    }

    const validation = validateRequest(req, schema);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    next();
  };
};

module.exports = validateRequestMiddleware;
