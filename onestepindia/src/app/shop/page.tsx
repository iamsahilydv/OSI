"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PageWrapper from "@/components/layout/PageWrapper";
import { formatCurrency } from "@/utils/helpers";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  CheckCircle,
  ChevronDown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/services/api";
import Cookies from "js-cookie";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  createdAt: string;
}

const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Beauty",
  "Home",
  "Fitness",
];

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const priceRanges = [
  { id: "all", label: "All Prices" },
  { id: "0-500", label: "Under ₹500" },
  { id: "500-1000", label: "₹500 - ₹1000" },
  { id: "1000-2000", label: "₹1000 - ₹2000" },
  { id: "2000-5000", label: "₹2000 - ₹5000" },
  { id: "5000+", label: "Over ₹5000" },
];

const ProductCard = ({
  product,
  index,
}: {
  product: Product;
  index: number;
}) => {
  const { toast } = useToast();
  const [isAdded, setIsAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdded(true);
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart`,
      className: "bg-green-50 border-green-200",
    });
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/product/${product.id}`} className="block h-full">
        <Card className="h-full overflow-hidden transition-all hover:shadow-lg border-2 border-transparent hover:border-primary/20 group">
          <div className="relative">
            <div className="h-56 relative overflow-hidden bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                {discount}% OFF
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-medium bg-red-600/80 px-4 py-2 rounded-md">
                  Out of Stock
                </span>
              </div>
            )}
          </div>
          <CardContent className="p-5">
            <div className="flex items-center text-xs mb-2">
              <span className="bg-primary/10 text-primary font-medium px-2 py-1 rounded-full text-xs">
                {product.category}
              </span>
              <div className="flex items-center ml-2 text-amber-700">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500 ml-1">({product.reviews})</span>
              </div>
            </div>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center justify-between mt-3">
              <div>
                <span className="font-bold text-primary text-lg">
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-gray-500 line-through ml-2">
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>
              <AnimatePresence>
                {isAdded ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-green-600"
                  >
                    <CheckCircle className="h-6 w-6 fill-green-100" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Button
                      size="sm"
                      className={`rounded-full shadow-sm transition-all ${
                        product.inStock
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-gray-300"
                      }`}
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

const ProductSkeleton = () => (
  <Card className="h-full overflow-hidden">
    <Skeleton className="h-56 w-full" />
    <CardContent className="p-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";
  const initialSort = searchParams.get("sort") || "popular";
  const initialPrice = searchParams.get("price") || "all";

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = Cookies.get("usrTkn");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await api.get("/products", config);
        const data = response.data.data;

        const transformed = data.map((product: any) => {
          const variation = product.variations?.[0] || {};
          return {
            id: product.id,
            name: product.name,
            price: parseFloat(variation.selling_price) || 0,
            originalPrice: variation.prices?.[0]?.original
              ? parseFloat(variation.prices[0].original)
              : undefined,
            image: variation.images?.[0] || "/placeholder-product.jpg",
            category: product.category || "Uncategorized",
            rating: product.ratings || 4.5,
            reviews: product.customerReviews?.length || 100,
            inStock: product.qty > 0,
            createdAt: product.created_at,
          };
        });

        setProducts(transformed);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === "All" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    // Price range filter
    let matchesPrice = true;
    if (selectedPrice !== "all") {
      const [min, max] = selectedPrice.split("-").map(Number);
      if (selectedPrice.endsWith("+")) {
        matchesPrice = product.price >= 5000;
      } else if (max) {
        matchesPrice = product.price >= min && product.price <= max;
      } else {
        matchesPrice = product.price <= min;
      }
    }

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (selectedSort) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "popular":
      default:
        return b.reviews - a.reviews;
    }
  });

  const updateActiveFilters = () => {
    const filters = [];
    if (selectedCategory !== "All") filters.push(selectedCategory);
    if (selectedPrice !== "all") {
      const priceLabel =
        priceRanges.find((p) => p.id === selectedPrice)?.label || "";
      filters.push(priceLabel);
    }
    setActiveFilters(filters);
  };

  useEffect(() => {
    updateActiveFilters();
  }, [selectedCategory, selectedPrice]);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedPrice("all");
    setSearchQuery("");
    setActiveFilters([]);
  };

  const removeFilter = (filterToRemove: string) => {
    if (categories.includes(filterToRemove)) {
      setSelectedCategory("All");
    } else {
      const priceRange = priceRanges.find((p) => p.label === filterToRemove);
      if (priceRange) {
        setSelectedPrice("all");
      }
    }
    setActiveFilters(activeFilters.filter((f) => f !== filterToRemove));
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Filters:</span>
          {activeFilters.map((filter) => (
            <span
              key={filter}
              className="inline-flex items-center text-sm bg-gray-100 rounded-full px-3 py-1"
            >
              {filter}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden md:block w-64 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedCategory === category
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Price Range</h3>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <button
                  key={range.id}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedPrice === range.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedPrice(range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        className={`px-3 py-2 rounded-md text-sm ${
                          selectedCategory === category
                            ? "bg-primary/10 text-primary font-medium"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsMobileFilterOpen(false);
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.id}
                        className={`px-3 py-2 rounded-md text-sm ${
                          selectedPrice === range.id
                            ? "bg-primary/10 text-primary font-medium"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        onClick={() => {
                          setSelectedPrice(range.id);
                          setIsMobileFilterOpen(false);
                        }}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  className="w-full"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filter to find what you're
                  looking for.
                </p>
                <Button onClick={clearAllFilters}>Clear all filters</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageWrapper
        className="w-full"
        title="Shop"
        description="Browse our products collection"
      >
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          }
        >
          <ShopContent />
        </Suspense>
      </PageWrapper>
    </div>
  );
}
