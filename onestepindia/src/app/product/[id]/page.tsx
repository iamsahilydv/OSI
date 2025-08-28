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
} from "lucide-react";
import api from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "@/services/commonFunction";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import Link from "next/link";

interface Variation {
  id: number;
  sku: string;
  size: string;
  color: string;
  selling_price: string;
  is_available: number;
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
  brand: string;
  availability: number;
  images: string[];
  features: string[];
  variations: Variation[];
  ratings: null;
  customerReviews: [];
}

const colorMap: Record<string, string> = {
  white: "#ffffff",
  black: "#000000",
  grey: "#808080",
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  yellow: "#ffff00",
  pink: "#ffc0cb",
  purple: "#800080",
  orange: "#ffa500",
  brown: "#a52a2a",
  navy: "#000080",
  teal: "#008080",
  maroon: "#800000",
};

const LoadingSkeleton = () => (
  <div className="flex flex-col min-h-screen">
    {/* <TopNavbar /> */}
    <PageWrapper className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-24 bg-gray-200 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-6">
          <div className="w-full h-[500px] bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-gray-200 rounded-md animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          <div>
            <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-64 bg-gray-200 rounded mt-2"></div>
            <div className="h-6 w-24 bg-gray-200 rounded mt-4"></div>
          </div>

          <div>
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 w-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div>
            <div className="h-4 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="flex gap-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>

          <div className="h-4 w-24 bg-gray-200 rounded"></div>

          <div>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-16 w-full bg-gray-200 rounded"></div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
          </div>

          <div className="h-10 w-full bg-gray-200 rounded"></div>

          <div className="flex gap-2 pt-4">
            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
          </div>
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

export default function ProductPage() {
  // const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { cartCount, setCartCount } = useAuth();
  const token = Cookies.get("usrTkn");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);

  const productId = params?.id?.toString() || "";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        if (response.data.success && response.data.data) {
          setProduct(response.data.data);
          if (response.data.data.variations.length > 0) {
            const firstVariation = response.data.data.variations[0];
            setSelectedVariation(firstVariation);
            setSelectedSize(firstVariation.size);
            setSelectedColor(firstVariation.color);
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
    if (!product || !selectedSize || !selectedColor) return;

    const variation = product.variations.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );

    if (variation) {
      setSelectedVariation(variation);
      setSelectedImageIndex(0);
    }
  }, [selectedSize, selectedColor, product]);

  useEffect(() => {
    if (!productId) return;
    setRecLoading(true);
    setRecError(null);
    api
      .get(`/products/${productId}/recommendations`)
      .then((res) => {
        if (res.data.success && Array.isArray(res.data.data)) {
          setRecommendations(res.data.data);
        } else {
          setRecommendations([]);
        }
      })
      .catch((err) => {
        setRecError("Failed to fetch recommendations");
        setRecommendations([]);
      })
      .finally(() => setRecLoading(false));
  }, [productId]);

  const handleBuyNow = () => {
    if (!product || !selectedVariation) return;

    if (!token) {
      router.push("/login?returnUrl=/order");
      return;
    }

    // Create a cart items array with the current product
    const cartItems = [
      {
        productId: product.id,
        variationId: selectedVariation.id,
        quantity: quantity,
      },
    ];

    // Convert to URLSearchParams for clean URL encoding
    const params = new URLSearchParams();
    params.append("product", JSON.stringify(cartItems));

    router.push(`checkout?${params.toString()}`);
  };

  const handleAddToWishlist = () => {
    if (!product || !selectedVariation) return;
    toast({
      title: "Added to Wishlist",
      description: `${product.name} (${selectedVariation.size}, ${selectedVariation.color}) added to your wishlist`,
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

  const availableSizes = [...new Set(product.variations.map((v) => v.size))];
  const availableColors = [...new Set(product.variations.map((v) => v.color))];

  const filteredColors = selectedSize
    ? [
        ...new Set(
          product.variations
            .filter((v) => v.size === selectedSize)
            .map((v) => v.color)
        ),
      ]
    : availableColors;

  const filteredSizes = selectedColor
    ? [
        ...new Set(
          product.variations
            .filter((v) => v.color === selectedColor)
            .map((v) => v.size)
        ),
      ]
    : availableSizes;

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
      : ["https://source.unsplash.com/random/600x600/?product"];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <TopNavbar /> */}
      <PageWrapper className="w-full max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/shop")}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-6">
            {/* Main Image with smooth transition */}
            <div className="relative w-full h-[500px] rounded-lg bg-gray-50 overflow-hidden">
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
                    className="object-contain p-4"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-md font-medium">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="relative">
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-20 relative rounded-md border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-primary scale-105"
                        : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      document
                        .getElementById(`thumb-${index}`)
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest",
                          inline: "center",
                        });
                    }}
                    id={`thumb-${index}`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-muted-foreground">
                {product.category} • {product.brand}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mt-2">
                {product.name}
              </h1>
              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(currentPrice)}
                </span>
                {originalPrice > currentPrice && (
                  <span className="text-base text-muted-foreground line-through ml-3">
                    {formatCurrency(originalPrice)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Size Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {filteredSizes.map((size) => (
                  <motion.div
                    key={size}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      variant={selectedSize === size ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Color Selection with swatches */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {filteredColors.map((color) => {
                  const colorValue = colorMap[color.toLowerCase()] || "#cccccc";
                  return (
                    <motion.div
                      key={color}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        variant={
                          selectedColor === color ? "default" : "outline"
                        }
                        onClick={() => setSelectedColor(color)}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: colorValue }}
                        />
                        {color}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              {selectedVariation.is_available ? (
                <div className="text-green-600 flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  In Stock
                </div>
              ) : (
                <div className="text-red-600 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Out of Stock
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </motion.div>

            <motion.div
              className="flex items-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button
                className="flex-1"
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
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </motion.div>

            <motion.div
              className="pt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Button
                className="w-full"
                onClick={handleBuyNow}
                disabled={!selectedVariation.is_available}
              >
                Buy Now
              </Button>
            </motion.div>

            <motion.div
              className="flex gap-2 pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                className="flex-1"
              >
                <Heart className="mr-2 h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </motion.div>
          </div>
        </div>
        {/* Recommendations Section */}
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-4">You may also like</h2>
          {recLoading ? (
            <div className="flex gap-4 overflow-x-auto">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-48 h-64 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : recError ? (
            <div className="text-red-500">{recError}</div>
          ) : recommendations.length === 0 ? (
            <div className="text-muted-foreground">
              No recommendations found.
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/product/${rec.id}`}
                  className="w-48 min-w-[12rem] bg-white rounded-lg shadow hover:shadow-lg transition p-3 flex flex-col"
                >
                  <div className="relative w-full h-40 bg-gray-50 rounded mb-2 overflow-hidden">
                    <Image
                      src={
                        rec.images?.[0] ||
                        "https://source.unsplash.com/random/400x400/?product"
                      }
                      alt={rec.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="font-medium truncate mb-1">{rec.name}</div>
                  <div className="text-sm text-muted-foreground truncate mb-1">
                    {rec.brand}
                  </div>
                  <div className="text-primary font-bold text-lg">
                    ₹{rec.selling_price || rec.price || "-"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
