# Multi-Category Product System

## Overview

The OneStepIndia platform has been enhanced to support multiple product categories beyond just clothing. The system now supports various product types including electronics, mobile phones, laptops, subscriptions, and many more.

## Key Changes

### Backend Changes

#### 1. Database Schema Updates

**Modified Tables:**

- `product_variations`: Now uses flexible JSON attributes instead of hardcoded size/color
- `product_images`: Removed color column for more flexible image handling
- `category_attributes`: New table for category-specific attributes

**New Tables:**

- `category_attributes`: Stores attribute definitions for each category

#### 2. New API Endpoints

**Category Attributes Management:**

- `GET /api/v1/category-attributes` - Get all category attributes (admin)
- `GET /api/v1/category-attributes/:category_id` - Get attributes for specific category
- `POST /api/v1/category-attributes` - Add new category attribute (admin)
- `PATCH /api/v1/category-attributes/:id` - Update category attribute (admin)
- `DELETE /api/v1/category-attributes/:id` - Delete category attribute (admin)

**Category Templates:**

- `GET /api/v1/category-template/:category_id` - Get variation template for category

#### 3. Enhanced Product Controller

The product controller now:

- Validates variations based on category attributes
- Supports flexible attribute structures
- Handles JSON-based variation attributes
- Provides better error handling for category-specific requirements

#### 4. Helper Functions

**New Helper: `categoryHelper.js`**

- `getCategoryAttributes()` - Fetch category attributes
- `validateProductVariations()` - Validate variations against category requirements
- `getCategoryVariationTemplate()` - Get category-specific templates
- `formatVariationsForDisplay()` - Format variations for frontend display

### Frontend Changes

#### 1. New Components

**CategorySelector Component:**

- Dynamic category selection
- Real-time attribute form generation
- Support for different input types (text, number, select, boolean)
- Validation and error handling

**UI Components:**

- Badge component for status indicators
- Checkbox component for boolean inputs
- Textarea component for multi-line text

#### 2. Demo Page

**Product Form Demo (`/admin/product-form`):**

- Interactive category selection
- Dynamic attribute form generation
- Variation management
- Real-time validation

## Supported Categories

The system now supports the following categories with their specific attributes:

### 1. Electronics

- **Attributes:** brand, model, warranty, power_consumption, dimensions
- **Required:** brand, model

### 2. Mobile Phones

- **Attributes:** brand, model, storage, color, ram, screen_size, battery_capacity, camera_mp
- **Required:** brand, model, storage, color, ram, screen_size
- **Options:** Storage (32GB-1TB), RAM (4GB-16GB), Colors (Black, White, Blue, etc.)

### 3. Laptops

- **Attributes:** brand, model, processor, ram, storage, screen_size, graphics, operating_system
- **Required:** brand, model, processor, ram, storage, screen_size, operating_system
- **Options:** RAM (4GB-64GB), Storage (256GB SSD - 2TB HDD), OS (Windows, macOS, Linux, Chrome OS)

### 4. Clothing

- **Attributes:** brand, size, color, material, care_instructions
- **Required:** brand, size, color
- **Options:** Sizes (XS-XXXL), Colors (Black, White, Blue, etc.)

### 5. Subscriptions

- **Attributes:** service_name, duration, features, auto_renewal, max_devices
- **Required:** service_name, duration
- **Options:** Duration (1 Month - 2 Years)

### 6. Home & Garden

- **Attributes:** brand, material, dimensions, weight, warranty
- **Required:** brand

### 7. Sports & Fitness

- **Attributes:** brand, size, color, material, weight
- **Required:** brand

### 8. Books & Media

- **Attributes:** title, author, format, language, pages
- **Required:** title, format
- **Options:** Format (Paperback, Hardcover, E-Book, Audiobook, Digital)

### 9. Automotive

- **Attributes:** brand, compatibility, material, warranty, installation_required
- **Required:** brand

### 10. Health & Beauty

- **Attributes:** brand, size, skin_type, fragrance, expiry_date
- **Required:** brand
- **Options:** Skin Type (All Skin Types, Oily, Dry, Combination, Sensitive)

## Usage Examples

### Creating a Mobile Phone Product

```javascript
// Product data
const productData = {
  name: "iPhone 15 Pro",
  description: "Latest iPhone with advanced features",
  category_id: 2, // Mobile Phones
  brand: "Apple",
  sellby: "Apple Store",
  variations: [
    {
      sku: "IPHONE15PRO-128-BLACK",
      variation_name: "iPhone 15 Pro 128GB Black",
      attributes: {
        brand: "Apple",
        model: "iPhone 15 Pro",
        storage: "128GB",
        color: "Black",
        ram: "8GB",
        screen_size: 6.1,
        battery_capacity: 3274,
        camera_mp: 48,
      },
      selling_price: 99999,
      stock_quantity: 50,
      is_available: true,
    },
  ],
};
```

### Creating a Laptop Product

```javascript
const laptopProduct = {
  name: "MacBook Pro 14",
  description: "Professional laptop for developers",
  category_id: 3, // Laptops
  brand: "Apple",
  sellby: "Apple Store",
  variations: [
    {
      sku: "MBP14-512-16",
      variation_name: "MacBook Pro 14 512GB 16GB RAM",
      attributes: {
        brand: "Apple",
        model: "MacBook Pro 14",
        processor: "M3 Pro",
        ram: "16GB",
        storage: "512GB SSD",
        screen_size: 14,
        graphics: "Integrated",
        operating_system: "macOS",
      },
      selling_price: 199999,
      stock_quantity: 25,
      is_available: true,
    },
  ],
};
```

## API Response Format

### Product with Variations

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro",
      "category": "Mobile Phones",
      "variations": [
        {
          "id": 1,
          "sku": "IPHONE15PRO-128-BLACK",
          "variation_name": "iPhone 15 Pro 128GB Black",
          "attributes": {
            "brand": "Apple",
            "model": "iPhone 15 Pro",
            "storage": "128GB",
            "color": "Black",
            "ram": "8GB",
            "screen_size": 6.1
          },
          "selling_price": 99999,
          "stock_quantity": 50,
          "is_available": true,
          "images": ["image1.jpg", "image2.jpg"]
        }
      ]
    }
  ]
}
```

## Migration Notes

### For Existing Data

1. **Product Variations:** Existing variations with size/color will need to be migrated to the new JSON format
2. **Images:** Product images will continue to work but without color-specific grouping
3. **Categories:** New categories will be automatically created on system startup

### Database Migration

Run the following to update existing tables:

```sql
-- Update product_variations table
ALTER TABLE product_variations
ADD COLUMN variation_name VARCHAR(100) NOT NULL DEFAULT 'Default',
ADD COLUMN attributes JSON NOT NULL DEFAULT '{}',
ADD COLUMN stock_quantity INT DEFAULT 0,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Remove old columns (after data migration)
ALTER TABLE product_variations
DROP COLUMN size,
DROP COLUMN color;

-- Update product_images table
ALTER TABLE product_images
DROP COLUMN color;
```

## Future Enhancements

1. **Advanced Filtering:** Category-specific filters in the shop
2. **Search Optimization:** Attribute-based search functionality
3. **Bulk Operations:** Import/export products with category attributes
4. **Analytics:** Category-specific sales analytics
5. **Inventory Management:** Advanced stock tracking per variation

## Testing

Visit `/admin/product-form` to test the new multi-category system with the interactive demo page.

## Support

For questions or issues with the multi-category system, please refer to the API documentation or contact the development team.
