// Mock data for testing the new product page with different categories

export const mockProducts = {
  // Mobile Phone Product
  mobilePhone: {
    id: 1,
    name: "iPhone 15 Pro Max",
    qty: 50,
    description: "The most advanced iPhone yet with titanium design, A17 Pro chip, and revolutionary camera system. Experience the future of mobile technology with unprecedented performance and stunning photography capabilities.",
    category: "Mobile Phones",
    categoryInfo: {
      id: 2,
      name: "Mobile Phones",
      description: "Smartphones and mobile accessories"
    },
    categoryAttributes: [
      {
        id: 1,
        attribute_name: "brand",
        attribute_type: "text" as const,
        is_required: true,
        options: null,
        display_order: 1
      },
      {
        id: 2,
        attribute_name: "model",
        attribute_type: "text" as const,
        is_required: true,
        options: null,
        display_order: 2
      },
      {
        id: 3,
        attribute_name: "storage",
        attribute_type: "select" as const,
        is_required: true,
        options: ["128GB", "256GB", "512GB", "1TB"],
        display_order: 3
      },
      {
        id: 4,
        attribute_name: "color",
        attribute_type: "color" as const,
        is_required: true,
        options: ["Black", "White", "Blue", "Purple"],
        display_order: 4
      },
      {
        id: 5,
        attribute_name: "ram",
        attribute_type: "select" as const,
        is_required: true,
        options: ["8GB"],
        display_order: 5
      }
    ],
    brand: "Apple",
    availability: 1,
    images: [
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"
    ],
    features: [
      "A17 Pro chip with 6-core GPU",
      "Professional camera system with 5x Telephoto",
      "Titanium design with Action Button",
      "All-day battery life",
      "iOS 17 with advanced features"
    ],
    variations: [
      {
        id: 1,
        sku: "IPHONE15PRO-128-BLACK",
        variation_name: "iPhone 15 Pro Max 128GB Black",
        attributes: {
          brand: "Apple",
          model: "iPhone 15 Pro Max",
          storage: "128GB",
          color: "Black",
          ram: "8GB"
        },
        selling_price: "134900",
        is_available: 1,
        stock_quantity: 25,
        images: [
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 1,
            variation_id: 1,
            original: "149900",
            discount_percentage: "10",
            currency: "INR"
          }
        ]
      },
      {
        id: 2,
        sku: "IPHONE15PRO-256-BLUE",
        variation_name: "iPhone 15 Pro Max 256GB Blue",
        attributes: {
          brand: "Apple",
          model: "iPhone 15 Pro Max",
          storage: "256GB",
          color: "Blue",
          ram: "8GB"
        },
        selling_price: "144900",
        is_available: 1,
        stock_quantity: 20,
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 2,
            variation_id: 2,
            original: "154900",
            discount_percentage: "7",
            currency: "INR"
          }
        ]
      }
    ],
    ratings: null,
    customerReviews: [],
    specifications: [
      { name: "Display", value: "6.7-inch Super Retina XDR" },
      { name: "Chip", value: "A17 Pro" },
      { name: "Camera", value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
      { name: "Battery", value: "Up to 29 hours video playback" },
      { name: "Storage", value: "128GB - 1TB" },
      { name: "Operating System", value: "iOS 17" }
    ]
  },

  // Laptop Product
  laptop: {
    id: 2,
    name: "MacBook Pro 14-inch M3",
    qty: 30,
    description: "Supercharged by M3 chip for incredible performance. Perfect for professionals, creators, and developers who demand the best in portable computing power.",
    category: "Laptops",
    categoryInfo: {
      id: 3,
      name: "Laptops",
      description: "Laptop computers and accessories"
    },
    categoryAttributes: [
      {
        id: 6,
        attribute_name: "brand",
        attribute_type: "text" as const,
        is_required: true,
        options: null,
        display_order: 1
      },
      {
        id: 7,
        attribute_name: "processor",
        attribute_type: "select" as const,
        is_required: true,
        options: ["M3", "M3 Pro", "M3 Max"],
        display_order: 2
      },
      {
        id: 8,
        attribute_name: "ram",
        attribute_type: "select" as const,
        is_required: true,
        options: ["8GB", "16GB", "32GB"],
        display_order: 3
      },
      {
        id: 9,
        attribute_name: "storage",
        attribute_type: "select" as const,
        is_required: true,
        options: ["512GB SSD", "1TB SSD", "2TB SSD"],
        display_order: 4
      },
      {
        id: 10,
        attribute_name: "color",
        attribute_type: "color" as const,
        is_required: false,
        options: ["Silver", "Gray"],
        display_order: 5
      }
    ],
    brand: "Apple",
    availability: 1,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"
    ],
    features: [
      "M3 chip with 8-core CPU and 10-core GPU",
      "14.2-inch Liquid Retina XDR display",
      "Up to 22 hours battery life",
      "1080p FaceTime HD camera",
      "Six-speaker sound system with spatial audio",
      "Three Thunderbolt 4 ports"
    ],
    variations: [
      {
        id: 3,
        sku: "MBP14-M3-8GB-512GB-SILVER",
        variation_name: "MacBook Pro 14 M3 8GB 512GB Silver",
        attributes: {
          brand: "Apple",
          processor: "M3",
          ram: "8GB",
          storage: "512GB SSD",
          color: "Silver"
        },
        selling_price: "169900",
        is_available: 1,
        stock_quantity: 15,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 3,
            variation_id: 3,
            original: "179900",
            discount_percentage: "6",
            currency: "INR"
          }
        ]
      },
      {
        id: 4,
        sku: "MBP14-M3-16GB-1TB-GRAY",
        variation_name: "MacBook Pro 14 M3 16GB 1TB Gray",
        attributes: {
          brand: "Apple",
          processor: "M3",
          ram: "16GB",
          storage: "1TB SSD",
          color: "Gray"
        },
        selling_price: "199900",
        is_available: 1,
        stock_quantity: 10,
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 4,
            variation_id: 4,
            original: "219900",
            discount_percentage: "9",
            currency: "INR"
          }
        ]
      }
    ],
    ratings: null,
    customerReviews: [],
    specifications: [
      { name: "Processor", value: "Apple M3 chip" },
      { name: "Display", value: "14.2-inch Liquid Retina XDR" },
      { name: "Memory", value: "8GB - 32GB unified memory" },
      { name: "Storage", value: "512GB - 2TB SSD" },
      { name: "Graphics", value: "10-core GPU" },
      { name: "Battery", value: "Up to 22 hours" },
      { name: "Weight", value: "1.55 kg" }
    ]
  },

  // Clothing Product
  clothing: {
    id: 3,
    name: "Premium Cotton T-Shirt",
    qty: 100,
    description: "Ultra-soft premium cotton t-shirt with modern fit. Perfect for casual wear and everyday comfort. Made from 100% organic cotton with sustainable manufacturing practices.",
    category: "Clothing",
    categoryInfo: {
      id: 4,
      name: "Clothing",
      description: "Apparel and fashion items"
    },
    categoryAttributes: [
      {
        id: 11,
        attribute_name: "brand",
        attribute_type: "text" as const,
        is_required: true,
        options: null,
        display_order: 1
      },
      {
        id: 12,
        attribute_name: "size",
        attribute_type: "size" as const,
        is_required: true,
        options: ["S", "M", "L", "XL", "XXL"],
        display_order: 2
      },
      {
        id: 13,
        attribute_name: "color",
        attribute_type: "color" as const,
        is_required: true,
        options: ["Black", "White", "Blue", "Red", "Green"],
        display_order: 3
      },
      {
        id: 14,
        attribute_name: "material",
        attribute_type: "text" as const,
        is_required: false,
        options: null,
        display_order: 4
      }
    ],
    brand: "OneStep Fashion",
    availability: 1,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop"
    ],
    features: [
      "100% organic cotton material",
      "Pre-shrunk for consistent fit",
      "Reinforced seams for durability",
      "Soft-touch finish",
      "Machine washable",
      "Available in multiple colors and sizes"
    ],
    variations: [
      {
        id: 5,
        sku: "TSHIRT-M-BLACK",
        variation_name: "Premium Cotton T-Shirt Medium Black",
        attributes: {
          brand: "OneStep Fashion",
          size: "M",
          color: "Black",
          material: "100% Organic Cotton"
        },
        selling_price: "999",
        is_available: 1,
        stock_quantity: 50,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 5,
            variation_id: 5,
            original: "1299",
            discount_percentage: "23",
            currency: "INR"
          }
        ]
      },
      {
        id: 6,
        sku: "TSHIRT-L-WHITE",
        variation_name: "Premium Cotton T-Shirt Large White",
        attributes: {
          brand: "OneStep Fashion",
          size: "L",
          color: "White",
          material: "100% Organic Cotton"
        },
        selling_price: "999",
        is_available: 1,
        stock_quantity: 40,
        images: [
          "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&h=600&fit=crop"
        ],
        prices: [
          {
            id: 6,
            variation_id: 6,
            original: "1299",
            discount_percentage: "23",
            currency: "INR"
          }
        ]
      }
    ],
    ratings: null,
    customerReviews: [],
    specifications: [
      { name: "Material", value: "100% Organic Cotton" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Sleeve Type", value: "Short Sleeve" },
      { name: "Neckline", value: "Round Neck" },
      { name: "Care", value: "Machine Wash Cold" },
      { name: "Origin", value: "Made in India" }
    ]
  }
};

export const mockRecommendations = [
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    selling_price: "124999",
    images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop"]
  },
  {
    id: 5,
    name: "MacBook Air M2",
    brand: "Apple",
    selling_price: "99999",
    images: ["https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop"]
  },
  {
    id: 6,
    name: "Premium Hoodie",
    brand: "OneStep Fashion",
    selling_price: "1999",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"]
  }
];