"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import api from "@/services/api";
import Cookies from "js-cookie";
import { Trash2, Plus, Minus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Color mapping for common color names
const colorMap: Record<string, string> = {
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  yellow: "#ffff00",
  pink: "#ffc0cb",
  purple: "#800080",
  orange: "#ffa500",
  brown: "#a52a2a",
  navy: "#000080",
  teal: "#008080",
  maroon: "#800000",
};

// Helper function to get color code from color name
function getColorCode(color: string): string {
  return colorMap[color.toLowerCase()] || "#cccccc";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalSum, setTotalSum] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const { setCartCount } = useAuth();
  const token = Cookies.get("usrTkn");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get("/cart/items", config);
      setCartItems(res.data.result || []);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load cart items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [cartItems]);

  const calculateTotals = () => {
    const sum = cartItems.reduce((acc, item) => {
      const price = item.prices?.[0]?.original ?? item.latest_price ?? 0;
      return acc + price * item.qty;
    }, 0);

    const discount = cartItems.reduce((acc, item) => {
      const original = item.prices?.[0]?.original ?? item.latest_price ?? 0;
      const current = item.prices?.[0]?.current ?? item.latest_price ?? 0;
      return acc + (original - current) * item.qty;
    }, 0);

    setTotalSum(sum);
    setDiscountedPrice(discount);
  };

  const updateQuantity = async (cartId: string, newQty: number) => {
    if (newQty < 1) return;

    try {
      setIsUpdating((prev) => ({ ...prev, [cartId]: true }));
      await api.patch(
        `/update/cart/item/qty/${cartId}`,
        { payload: newQty },
        config
      );

      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cartId ? { ...item, qty: newQty } : item
        )
      );
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating((prev) => ({ ...prev, [cartId]: false }));
    }
  };

  const removeItem = async (cartId: string) => {
    try {
      setIsUpdating((prev) => ({ ...prev, [cartId]: true }));
      await api.delete(`/remove/cart/items/${cartId}`, config);

      setCartItems((prev) => prev.filter((item) => item.cart_id !== cartId));
      setCartCount((prev) => prev - 1);
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating((prev) => ({ ...prev, [cartId]: false }));
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add some products before checkout",
      });
      return;
    }

    const cartPayload = cartItems.map((item) => ({
      productId: item.product_id,
      variationId: item.variation_id,
      quantity: item.qty,
    }));

    const encodedCart = encodeURIComponent(JSON.stringify(cartPayload));
    router.push(`/product/checkout?cart=${encodedCart}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          My Cart ({cartItems.length}{" "}
          {cartItems.length === 1 ? "Item" : "Items"})
        </h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Product List */}
          <div className="w-full md:w-2/3 space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-40 rounded-lg bg-gray-200" />
              ))
            ) : cartItems.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-xl font-semibold mb-2">Your cart is empty</p>
                <p className="text-gray-500 mb-4">
                  Looks like you haven't added anything to your cart yet
                </p>
                <Button onClick={() => router.push("/shop")} className="mt-4">
                  Browse Products
                </Button>
              </div>
            ) : (
              cartItems.map((item) => {
                const originalPrice =
                  item.prices?.[0]?.original ?? item.latest_price ?? 0;
                const currentPrice =
                  item.prices?.[0]?.current ?? item.latest_price ?? 0;
                const discount = item.prices?.[0]?.discountPercentage ?? 0;
                const itemTotal = currentPrice * item.qty;
                const color = item.color || item.variation?.color || "N/A";
                const size = item.size || item.variation?.size || "N/A";
                const colorCode = item.color_code || getColorCode(color);

                return (
                  <div
                    key={item.cart_id}
                    className="bg-white shadow rounded-lg p-4 flex gap-4 relative"
                  >
                    <div className="w-24 h-24 md:w-28 md:h-28 relative flex-shrink-0">
                      <Image
                        src={item.image_urls?.[0] || "/placeholder-product.png"}
                        alt={item.product_name}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 100px, 112px"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold line-clamp-2">
                        {item.product_name}
                      </h2>

                      {/* Product Details */}
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500">
                          Brand:{" "}
                          <span className="font-medium">{item.brand}</span>
                        </p>

                        {/* Color Display */}
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">Color:</p>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{color}</span>
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300 inline-block"
                              style={{ backgroundColor: colorCode }}
                            />
                          </div>
                        </div>

                        {/* Size Display */}
                        <p className="text-sm text-gray-500">
                          Size: <span className="font-medium">{size}</span>
                        </p>
                      </div>

                      {/* Price Display */}
                      <div className="mt-2 flex items-center gap-2">
                        {originalPrice > currentPrice && (
                          <span className="line-through text-sm text-gray-400">
                            ₹{originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-green-600 font-semibold">
                          ₹{currentPrice.toFixed(2)}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            {discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.cart_id, item.qty - 1)
                            }
                            disabled={isUpdating[item.cart_id] || item.qty <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center">
                            {isUpdating[item.cart_id] ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              item.qty
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.cart_id, item.qty + 1)
                            }
                            disabled={isUpdating[item.cart_id]}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => removeItem(item.cart_id)}
                          disabled={isUpdating[item.cart_id]}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="absolute top-4 right-4 font-medium">
                      ₹{itemTotal.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Price Summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow p-6 sticky top-20">
              <h2 className="text-lg font-semibold border-b pb-3 mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalSum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-3 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{(totalSum - discountedPrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white h-12"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </Button>

              {cartItems.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Taxes and shipping calculated at checkout
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
