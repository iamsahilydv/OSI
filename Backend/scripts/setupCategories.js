const createConnectionDb = require("../config/pool");

const setupDefaultCategories = async () => {
  try {
    const conn = await createConnectionDb({ timeout: 10000 });

    // Create default categories
    const categories = [
      { name: "Electronics", description: "Electronic devices and gadgets" },
      {
        name: "Mobile Phones",
        description: "Smartphones and mobile accessories",
      },
      { name: "Laptops", description: "Laptop computers and accessories" },
      { name: "Clothing", description: "Apparel and fashion items" },
      {
        name: "Subscriptions",
        description: "Digital and service subscriptions",
      },
      {
        name: "Home & Garden",
        description: "Home improvement and garden products",
      },
      {
        name: "Sports & Fitness",
        description: "Sports equipment and fitness products",
      },
      {
        name: "Books & Media",
        description: "Books, movies, and digital media",
      },
      {
        name: "Automotive",
        description: "Car parts and automotive accessories",
      },
      {
        name: "Health & Beauty",
        description: "Health products and beauty items",
      },
    ];

    for (const category of categories) {
      await conn.query(
        `INSERT IGNORE INTO categories (name, description) VALUES (?, ?)`,
        [category.name, category.description]
      );
    }

    console.log("✅ Default categories created successfully");

    // Get category IDs
    const [categoryResults] = await conn.query(
      `SELECT id, name FROM categories`
    );
    const categoryMap = {};
    categoryResults.forEach((cat) => {
      categoryMap[cat.name] = cat.id;
    });

    // Define category attributes
    const categoryAttributes = [
      // Electronics
      {
        category_id: categoryMap["Electronics"],
        attributes: [
          { name: "brand", type: "text", required: true },
          { name: "model", type: "text", required: true },
          { name: "warranty", type: "text", required: false },
          { name: "power_consumption", type: "number", required: false },
          { name: "dimensions", type: "text", required: false },
        ],
      },
      // Mobile Phones
      {
        category_id: categoryMap["Mobile Phones"],
        attributes: [
          { name: "brand", type: "text", required: true },
          { name: "model", type: "text", required: true },
          {
            name: "storage",
            type: "select",
            required: true,
            options: ["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"],
          },
          {
            name: "color",
            type: "select",
            required: true,
            options: [
              "Black",
              "White",
              "Blue",
              "Red",
              "Green",
              "Gold",
              "Silver",
            ],
          },
          {
            name: "ram",
            type: "select",
            required: true,
            options: ["4GB", "6GB", "8GB", "12GB", "16GB"],
          },
          { name: "screen_size", type: "number", required: true },
          { name: "battery_capacity", type: "number", required: false },
          { name: "camera_mp", type: "number", required: false },
        ],
      },
      // Laptops
      {
        category_id: categoryMap["Laptops"],
        attributes: [
          { name: "brand", type: "text", required: true },
          { name: "model", type: "text", required: true },
          { name: "processor", type: "text", required: true },
          {
            name: "ram",
            type: "select",
            required: true,
            options: ["4GB", "8GB", "16GB", "32GB", "64GB"],
          },
          {
            name: "storage",
            type: "select",
            required: true,
            options: [
              "256GB SSD",
              "512GB SSD",
              "1TB SSD",
              "2TB SSD",
              "1TB HDD",
              "2TB HDD",
            ],
          },
          { name: "screen_size", type: "number", required: true },
          { name: "graphics", type: "text", required: false },
          {
            name: "operating_system",
            type: "select",
            required: true,
            options: ["Windows", "macOS", "Linux", "Chrome OS"],
          },
        ],
      },
      // Clothing
      {
        category_id: categoryMap["Clothing"],
        attributes: [
          { name: "brand", type: "text", required: true },
          {
            name: "size",
            type: "select",
            required: true,
            options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
          },
          {
            name: "color",
            type: "select",
            required: true,
            options: [
              "Black",
              "White",
              "Blue",
              "Red",
              "Green",
              "Yellow",
              "Pink",
              "Purple",
              "Orange",
              "Brown",
              "Gray",
            ],
          },
          { name: "material", type: "text", required: false },
          { name: "care_instructions", type: "text", required: false },
        ],
      },
      // Subscriptions
      {
        category_id: categoryMap["Subscriptions"],
        attributes: [
          { name: "service_name", type: "text", required: true },
          {
            name: "duration",
            type: "select",
            required: true,
            options: ["1 Month", "3 Months", "6 Months", "1 Year", "2 Years"],
          },
          { name: "features", type: "text", required: false },
          { name: "auto_renewal", type: "boolean", required: false },
          { name: "max_devices", type: "number", required: false },
        ],
      },
      // Home & Garden
      {
        category_id: categoryMap["Home & Garden"],
        attributes: [
          { name: "brand", type: "text", required: true },
          { name: "material", type: "text", required: false },
          { name: "dimensions", type: "text", required: false },
          { name: "weight", type: "number", required: false },
          { name: "warranty", type: "text", required: false },
        ],
      },
      // Sports & Fitness
      {
        category_id: categoryMap["Sports & Fitness"],
        attributes: [
          { name: "brand", type: "text", required: true },
          {
            name: "size",
            type: "select",
            required: false,
            options: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
          },
          {
            name: "color",
            type: "select",
            required: false,
            options: [
              "Black",
              "White",
              "Blue",
              "Red",
              "Green",
              "Yellow",
              "Pink",
              "Purple",
              "Orange",
              "Gray",
            ],
          },
          { name: "material", type: "text", required: false },
          { name: "weight", type: "number", required: false },
        ],
      },
      // Books & Media
      {
        category_id: categoryMap["Books & Media"],
        attributes: [
          { name: "title", type: "text", required: true },
          { name: "author", type: "text", required: false },
          {
            name: "format",
            type: "select",
            required: true,
            options: [
              "Paperback",
              "Hardcover",
              "E-Book",
              "Audiobook",
              "Digital",
            ],
          },
          { name: "language", type: "text", required: false },
          { name: "pages", type: "number", required: false },
        ],
      },
      // Automotive
      {
        category_id: categoryMap["Automotive"],
        attributes: [
          { name: "brand", type: "text", required: true },
          { name: "compatibility", type: "text", required: false },
          { name: "material", type: "text", required: false },
          { name: "warranty", type: "text", required: false },
          { name: "installation_required", type: "boolean", required: false },
        ],
      },
      // Health & Beauty
      {
        category_id: categoryMap["Health & Beauty"],
        attributes: [
          { name: "brand", type: "text", required: true },
          {
            name: "size",
            type: "select",
            required: false,
            options: ["Small", "Medium", "Large", "Travel Size", "Full Size"],
          },
          {
            name: "skin_type",
            type: "select",
            required: false,
            options: [
              "All Skin Types",
              "Oily",
              "Dry",
              "Combination",
              "Sensitive",
            ],
          },
          { name: "fragrance", type: "text", required: false },
          { name: "expiry_date", type: "text", required: false },
        ],
      },
    ];

    // Insert category attributes
    for (const categoryAttr of categoryAttributes) {
      if (categoryAttr.category_id) {
        for (let i = 0; i < categoryAttr.attributes.length; i++) {
          const attr = categoryAttr.attributes[i];
          await conn.query(
            `INSERT IGNORE INTO category_attributes 
             (category_id, attribute_name, attribute_type, is_required, options, display_order) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              categoryAttr.category_id,
              attr.name,
              attr.type,
              attr.required,
              attr.options ? JSON.stringify(attr.options) : null,
              i + 1,
            ]
          );
        }
      }
    }

    console.log("✅ Category attributes created successfully");
    console.log("✅ Category setup completed!");
  } catch (error) {
    console.error("❌ Error setting up categories:", error);
  }
};

module.exports = setupDefaultCategories;
