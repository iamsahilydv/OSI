"use client";
import TopNavbar from "@/components/layout/TopNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();

  const token = Cookies.get("usrTkn");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // Mock categories for the homepage
  const categories = [
    { name: "Electronics", icon: "📱", path: "/shop?category=electronics" },
    { name: "Fashion", icon: "👕", path: "/shop?category=fashion" },
    { name: "Home", icon: "🏠", path: "/shop?category=home" },
    { name: "Beauty", icon: "💄", path: "/shop?category=beauty" },
    { name: "Appliances", icon: "🧰", path: "/shop?category=appliances" },
    { name: "Toys", icon: "🧸", path: "/shop?category=toys" },
  ];

  // Updated to match backend structure
  const [featuredProducts, setFeaturedProducts] = useState([
    {
      id: 1,
      name: "Wireless Earbuds",
      brand: "Brand",
      prices: [{ current: "999", original: "1299", discountPercentage: 23 }],
      images: ["/api/placeholder/300/300"],
      category: "Electronics",
      qty: 10,
    },
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getProduct = async () => {
    try {
      const response = await api.get(`/products`, config);
      const data = response.data.data;

      const transformedProducts = data.map((product: any) => {
        const firstVariation = product.variations?.[0] || {};

        // Get images from the first variation (fallback to default placeholder)
        const variationImages =
          firstVariation?.images?.length > 0
            ? firstVariation.images
            : ["/api/placeholder/300/300"];

        // Get latest price if available
        const latestPriceObj = firstVariation?.prices?.[0];
        // console.log(latestPriceObj)
        const latestPrice = latestPriceObj?.original || 0;
        const originalPrice = latestPriceObj?.original || latestPrice;
        const discount =
          originalPrice > latestPrice
            ? Math.round(((originalPrice - latestPrice) / originalPrice) * 100)
            : 0;

        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          prices: [
            {
              current: latestPrice.toString(),
              original: originalPrice.toString(),
              discountPercentage: discount,
            },
          ],
          images: variationImages,
          category: product.category || "Uncategorized",
          qty: product.qty || 0,
        };
      });

      const featured = transformedProducts.slice(0, 4);
      setFeaturedProducts(featured);
      // console.log("Featured products:", featured);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getProduct();
  }, []);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* <TopNavbar /> */}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Shop, Refer, <span className="text-yellow-400">Earn</span>
              </h1>
              <p className="mt-4 text-xl text-gray-100">
                OneStepIndia.in is your one-stop marketplace with exclusive MLM
                benefits.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold text-lg py-6 px-8 rounded-xl"
                  size="lg"
                  asChild
                >
                  <Link href="/shop">Shop Now</Link>
                </Button>
                {!user ? (
                  <Button
                    className="bg-white/10 hover:bg-white/20 border-2 border-white text-white font-bold text-lg py-6 px-8 rounded-xl"
                    size="lg"
                    variant="outline"
                    asChild
                  >
                    <Link href="/auth/register">Join & Earn</Link>
                  </Button>
                ) : (
                  <></>
                )}
              </div>
            </motion.div>
            <motion.div
              className="relative h-80 md:h-96 overflow-hidden rounded-2xl shadow-2xl"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="/api/placeholder/800/600"
                alt="OneStepIndia Shopping"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 bg-yellow-500 text-gray-900 font-bold py-1 px-3 rounded-full text-sm">
                Premium Quality
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className="text-3xl font-bold mb-10 text-gray-900 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Shop by Category
          </motion.h2>
          <motion.div
            className="grid grid-cols-3 md:grid-cols-6 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {categories.map((category) => (
              <motion.div key={category.name} variants={itemVariants}>
                <Link
                  href={category.path}
                  className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500"
                >
                  <motion.span
                    className="text-4xl mb-3"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {category.icon}
                  </motion.span>
                  <span className="text-sm font-semibold text-gray-800">
                    {category.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto max-w-7xl">
          <motion.h2
            className="text-3xl font-bold mb-10 text-gray-900 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Featured Products
          </motion.h2>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/product/${product.id}`}>
                  <Card className="product-card h-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-none">
                    <div className="h-56 relative">
                      <Image
                        src={product.images[0] || "/api/placeholder/300/300"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 font-bold py-1 px-3 rounded-full text-xs">
                        {product.category}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="font-bold text-xl text-indigo-700">
                            ₹{product.prices[0]?.current || "0"}
                          </p>
                          {product.prices[0]?.original && (
                            <p className="text-sm text-gray-400 line-through">
                              ₹{product.prices[0]?.original}
                            </p>
                          )}
                        </div>
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 w-fit h-10 flex items-center justify-center p-2"
                          onClick={() => {
                            // console.log("Add To Cart Called");
                          }}
                        >
                          Add to Cart
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-6 px-8 rounded-xl text-lg font-bold"
              size="lg"
              asChild
            >
              <Link href="/shop">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
