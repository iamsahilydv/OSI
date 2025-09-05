"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import TopNavbar from "@/components/layout/TopNavbar";
import PageWrapper from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/helpers";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronLeft,
  Star,
  Check,
  Info,
  Package,
  Shield,
  Truck,
  RefreshCw,
} from "lucide-react";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "@/services/commonFunction";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";

interface CategoryAttribute {
  id: number;
  attribute_name: string;
  attribute_type: "text" | "number" | "select" | "boolean" | "color" | "size";
  is_required: boolean;
  options: string[] | null;
  display_order: number;
}

interface Variation {
  id: number;
  sku: string;
  variation_name: string;
  attributes: Record<string, any>;
  selling_price: string;
  is_available: number;
  stock_quantity: number;
  images: string[];
  prices: {
    id: number;
    variation_id: number;
    original: string;
    discount_percentage: string;
    currency: string;
  }[];
}

interface Product {
  id: number;
  name: string;
  qty: number;
  description: string;
  category: string;
  categoryInfo: {
    id: number;
    name: string;
    description: string;
  };
  categoryAttributes: CategoryAttribute[];
  brand: string;
  availability: number;
  images: string[];
  features: string[];
  variations: Variation[];
  ratings: null;
  customerReviews: [];
  specifications: any[];
}

const LoadingSkeleton = () => (
  <div className="flex flex-col min-h-screen">
    <PageWrapper className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-6">
          <div className="w-full h-[600px] bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded mt-4 animate-pulse"></div>
          </div>

          <div>
            <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-12 flex-1 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </PageWrapper>
  </div>
);

const ErrorState = ({ error }: { error: string | null }) => {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen">
      <PageWrapper>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Product doesn't exist or was removed."}
          </p>
          <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
        </div>
      </PageWrapper>
    </div>
  );
};

// Helper function to render attribute values based on type
const renderAttributeValue = (
  attribute: CategoryAttribute,
  value: any,
  isSelected: boolean = false,
  onClick?: () => void
) => {
  const baseClasses = `px-3 py-2 rounded-lg border-2 transition-all duration-200 ${
    isSelected 
      ? "border-primary bg-primary text-primary-foreground shadow-md" 
      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
  }`;

  switch (attribute.attribute_type) {
    case "color":
      const colorValue = typeof value === 'string' ? value.toLowerCase() : '';
      const colorMap: Record<string, string> = {
        white: "#ffffff",
        black: "#000000",
        red: "#ef4444",
        blue: "#3b82f6",
        green: "#10b981",
        yellow: "#f59e0b",
        purple: "#8b5cf6",
        pink: "#ec4899",
        orange: "#f97316",
        brown: "#a3a3a3",
        gray: "#6b7280",
        grey: "#6b7280",
      };
      
      return (
        <Button
          key={value}
          variant={isSelected ? "default" : "outline"}
          onClick={onClick}
          className="flex items-center gap-2 h-12"
        >
          <div
            className="w-5 h-5 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: colorMap[colorValue] || "#cccccc" }}
          />
          <span className="capitalize">{value}</span>
        </Button>
      );

    case "size":
      return (
        <Button
          key={value}
          variant={isSelected ? "default" : "outline"}
          onClick={onClick}
          className="h-12 min-w-[60px]"
        >
          {value}
        </Button>
      );

    case "select":
      return (
        <Button
          key={value}
          variant={isSelected ? "default" : "outline"}
          onClick={onClick}
          className="h-12"
        >
          {value}
        </Button>
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={Boolean(value)}
            readOnly
            className="h-4 w-4"
          />
          <span className="text-sm">{value ? "Yes" : "No"}</span>
        </div>
      );

    default:
      return (
        <span className="px-3 py-2 bg-gray-50 rounded-lg text-sm">
          {value}
        </span>
      );
  }
};

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, any>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartCount, setCartCount } = useAuth();
  const token = Cookies.get("usrTkn");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  const productId = params?.id?.toString() || "";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        if (response.data.success && response.data.data) {
          const productData = response.data.data;
          setProduct(productData);
          
          if (productData.variations.length > 0) {
            const firstVariation = productData.variations[0];
            setSelectedVariation(firstVariation);
            setSelectedAttributes(firstVariation.attributes || {});
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Fetch error", err);
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (!product || !selectedAttributes) return;

    const matchingVariation = product.variations.find((variation) => {
      const varAttrs = variation.attributes || {};
      return Object.keys(selectedAttributes).every(
        (key) => varAttrs[key] === selectedAttributes[key]
      );
    });

    if (matchingVariation) {
      setSelectedVariation(matchingVariation);
      setSelectedImageIndex(0);
    }
  }, [selectedAttributes, product]);

  useEffect(() => {
    if (!productId) return;
    setRecLoading(true);
    
    api
      .get(`/products/${productId}/recommendations`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setRecommendations(res.data.data);
        } else {
          setRecommendations([]);
        }
      })
      .catch(() => setRecommendations([]))
      .finally(() => setRecLoading(false));
  }, [productId]);

  const handleAttributeSelect = (attributeName: string, value: any) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariation) return;

    if (!token) {
      router.push("/auth/login?returnUrl=/order");
      return;
    }

    const cartItems = [
      {
        productId: product.id,
        variationId: selectedVariation.id,
        quantity: quantity,
      },
    ];

    const params = new URLSearchParams();
    params.append("product", JSON.stringify(cartItems));
    router.push(`/product/checkout?${params.toString()}`);
  };

  const handleAddToWishlist = () => {
    if (!product || !selectedVariation) return;
    toast({
      title: "Added to Wishlist",
      description: `${product.name} added to your wishlist`,
    });
  };

  const handleShare = async () => {
    if (!product) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.name} on OneStepIndia.in!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Share failed", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !product || !selectedVariation) {
    return <ErrorState error={error} />;
  }

  const currentPrice = parseFloat(selectedVariation.selling_price);
  const originalPrice = parseFloat(
    selectedVariation.prices[0]?.original || selectedVariation.selling_price
  );
  const discount =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const productImages =
    selectedVariation.images.length > 0
      ? selectedVariation.images
      : product.images.length > 0
      ? product.images
      : ["https://source.unsplash.com/random/600x600/?product"];

  // Group attributes by type for better organization
  const attributeGroups = product.categoryAttributes.reduce((groups, attr) => {
    const type = attr.attribute_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(attr);
    return groups;
  }, {} as Record<string, CategoryAttribute[]>);

  // Get available values for each attribute based on variations
  const getAvailableValues = (attributeName: string) => {
    const values = new Set();
    product.variations.forEach(variation => {
      if (variation.attributes && variation.attributes[attributeName]) {
        values.add(variation.attributes[attributeName]);
      }
    });
    return Array.from(values);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageWrapper className="w-full max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-white"
          onClick={() => router.push("/shop")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="relative w-full h-[600px] rounded-2xl bg-white overflow-hidden shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedVariation.id}-${selectedImageIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={productImages[selectedImageIndex]}
                    alt={`${product.name} - ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain p-6"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 w-24 h-24 relative rounded-xl border-3 transition-all ${
                    selectedImageIndex === index
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                  {product.category}
                </span>
                <span>•</span>
                <span>{product.brand}</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(currentPrice)}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {selectedVariation.is_available ? (
                  <div className="text-green-600 flex items-center font-medium">
                    <Check className="h-5 w-5 mr-2" />
                    In Stock ({selectedVariation.stock_quantity} available)
                  </div>
                ) : (
                  <div className="text-red-600 flex items-center font-medium">
                    <Info className="h-5 w-5 mr-2" />
                    Out of Stock
                  </div>
                )}
              </div>
            </motion.div>

            {/* Dynamic Attributes */}
            {product.categoryAttributes.map((attribute, index) => {
              const availableValues = getAvailableValues(attribute.attribute_name);
              if (availableValues.length === 0) return null;

              return (
                <motion.div
                  key={attribute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
                    {attribute.attribute_name.replace(/_/g, ' ')}
                    {attribute.is_required && (
                      <span className="text-red-500 text-sm">*</span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {availableValues.map((value) => (
                      renderAttributeValue(
                        attribute,
                        value,
                        selectedAttributes[attribute.attribute_name] === value,
                        () => handleAttributeSelect(attribute.attribute_name, value)
                      )
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="space-y-3"
            >
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </motion.div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-3"
              >
                <h3 className="text-lg font-semibold">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Quantity and Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-12 w-12"
                  >
                    -
                  </Button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-12 w-12"
                  >
                    +
                  </Button>
                </div>
                <Button
                  className="flex-1 h-12 text-lg font-semibold"
                  onClick={() =>
                    addToCart(
                      selectedVariation.id,
                      token || "",
                      cartCount,
                      setCartCount,
                      toast
                    )
                  }
                  disabled={!selectedVariation.is_available}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold"
                onClick={handleBuyNow}
                disabled={!selectedVariation.is_available}
                size="lg"
              >
                Buy Now
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="flex-1 h-12"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="flex-1 h-12"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="grid grid-cols-2 gap-4 pt-6 border-t"
            >
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-500" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <RefreshCw className="h-5 w-5 text-purple-500" />
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Package className="h-5 w-5 text-orange-500" />
                <span>Quality Assured</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.specifications.map((spec, index) => (
                <div key={index} className="border-b pb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{spec.name}</span>
                    <span className="text-gray-600">{spec.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold mb-8">You may also like</h2>
          {recLoading ? (
            <div className="flex gap-6 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-64 h-80 bg-white rounded-2xl shadow-lg animate-pulse"
                />
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No recommendations found.
            </div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/product/${rec.id}`}
                  className="w-64 min-w-[16rem] bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 flex flex-col group"
                >
                  <div className="relative w-full h-48 bg-gray-50 rounded-xl mb-4 overflow-hidden">
                    <Image
                      src={
                        rec.images?.[0] ||
                        "https://source.unsplash.com/random/400x400/?product"
                      }
                      alt={rec.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="font-semibold text-lg truncate mb-2">{rec.name}</div>
                  <div className="text-sm text-gray-500 truncate mb-3">
                    {rec.brand}
                  </div>
                  <div className="text-primary font-bold text-xl mt-auto">
                    ₹{rec.selling_price || rec.price || "-"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </PageWrapper>
    </div>
  );
}