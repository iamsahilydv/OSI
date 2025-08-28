"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Check,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import api from "@/services/api";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageWrapper from "@/components/layout/PageWrapper";
import Sidebar from "@/components/layout/Sidebar";
import { motion } from "framer-motion";

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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

type OrderItem = {
  order_id: number;
  variation_id: number;
  qty: number;
  price: number;
  discountPercentag: number;
  original_price: number;
  qikink_order_id: string | null;
  delivered_at: string | null;
  sku: string;
  size: string;
  color: string;
  selling_price: number;
  is_available: boolean;
  product_id: number;
  product_name: string;
  product_description: string;
  brand: string;
  product_images: Array<{ url: string }>;
  prices: Array<{
    id: number;
    variation_id: number;
    original: number;
    discount_percentage: number;
    currency: string;
  }>;
};

type OrderGroup = {
  order_group_id: number;
  user_id: number;
  total_amount: number;
  paymentMode: string;
  addressId: number;
  created_at: string;
  status: string;
  address: {
    id: number;
    AddressLine1: string;
    AddressLine2?: string;
    City: string;
    State: string;
    PostalCode: string;
    Country: string;
    IsDefault: boolean;
    IsEnabled: boolean;
  };
  items: OrderItem[];
};

// Status configuration
const statusConfig = {
  pending: {
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
    icon: Clock,
    label: "Pending",
  },
  processing: {
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    icon: Package,
    label: "Processing",
  },
  shipped: {
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-200",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "text-green-700",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: CheckCircle,
    label: "Delivered",
  },
  cancelled: {
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    icon: XCircle,
    label: "Cancelled",
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderGroup[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { user } = useAuth();
  const token = Cookies.get("usrTkn");
  const router = useRouter();

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/getAllOrder", config);

      // Parse the response data
      const ordersData = res.data.result.map((order: any) => {
        // Parse JSON strings if they exist
        const parsedOrder = {
          ...order,
          address:
            typeof order.address === "string"
              ? JSON.parse(order.address)
              : order.address,
          items:
            typeof order.items === "string"
              ? JSON.parse(order.items)
              : order.items,
        };

        // Process items to ensure proper image URLs
        parsedOrder.items = parsedOrder.items.map((item: any) => {
          return {
            ...item,
            product_images:
              typeof item.product_images === "string"
                ? JSON.parse(item.product_images)
                : item.product_images || [],
            prices:
              typeof item.prices === "string"
                ? JSON.parse(item.prices)
                : item.prices || [],
          };
        });

        return parsedOrder;
      });

      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user?.id]);

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_group_id.toString().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) =>
            item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (order) => order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Order statistics
  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o?.status?.toLowerCase() === "pending")
      .length,
    processing: orders.filter((o) => o?.status?.toLowerCase() === "processing")
      .length,
    shipped: orders.filter((o) => o?.status?.toLowerCase() === "shipped")
      .length,
    delivered: orders.filter((o) => o?.status?.toLowerCase() === "delivered")
      .length,
    cancelled: orders.filter((o) => o?.status?.toLowerCase() === "cancelled")
      .length,
  };

  const getStatusInfo = (status: string | undefined | null) => {
    const lowerStatus = (status || "pending").toLowerCase();
    return (
      statusConfig[lowerStatus as keyof typeof statusConfig] ||
      statusConfig.pending
    );
  };

  const getFirstProductImage = (images: Array<{ url: string }>) => {
    return images?.[0]?.url || "";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <PageWrapper
          title="My Orders"
          description="Track and manage your order history"
        >
          {/* Order Statistics */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-indigo-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-indigo-700">
                    {orderStats.total}
                  </div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-amber-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-700">
                    {orderStats.pending}
                  </div>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {orderStats.processing}
                  </div>
                  <p className="text-sm text-gray-600">Processing</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-purple-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {orderStats.shipped}
                  </div>
                  <p className="text-sm text-gray-600">Shipped</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-green-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">
                    {orderStats.delivered}
                  </div>
                  <p className="text-sm text-gray-600">Delivered</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-l-4 border-red-600 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {orderStats.cancelled}
                  </div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="mb-6"
            variants={itemVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <select
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Orders List */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
          >
            {isLoading ? (
              <motion.div variants={itemVariants}>
                <Card className="shadow-md">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Loading your orders...
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ) : filteredOrders.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Card className="shadow-md">
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || statusFilter !== "all"
                        ? "No orders match your criteria"
                        : "You haven't placed any orders yet"}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Start shopping to see your orders here."}
                    </p>
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        router.push("/");
                      }}
                      className="mt-4"
                    >
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const formattedAddress = order.address
                  ? `${order.address.AddressLine1}, ${order.address.City}, ${order.address.State} - ${order.address.PostalCode}, ${order.address.Country}`
                  : "Address not available";

                return (
                  <motion.div
                    key={order.order_group_id}
                    variants={itemVariants}
                  >
                    <Card
                      className={`shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${statusInfo.borderColor}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              Order #{order.order_group_id}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="h-4 w-4 mr-1" />
                              Placed on {formatShortDate(order.created_at)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            {/* <div
                              className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bgColor}`}
                            >
                              <StatusIcon
                                className={`h-4 w-4 mr-2 ${statusInfo.color}`}
                              />
                              <span
                                className={`text-sm font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div> */}
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(order.total_amount)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {/* Order Items */}
                        <div className="space-y-3 mb-4">
                          {order.items.map((item) => (
                            <div
                              key={item.order_id}
                              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center gap-3">
                                {getFirstProductImage(item.product_images) ? (
                                  <img
                                    src={getFirstProductImage(
                                      item.product_images
                                    )}
                                    alt={item.product_name}
                                    className="w-12 h-12 rounded-md object-cover border"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center border">
                                    <Package className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {item.product_name}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.color && (
                                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        Color: {item.color}
                                      </span>
                                    )}
                                    {item.size && (
                                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                      SKU: {item.sku}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(item.price)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.qty}
                                </p>
                                {item.discountPercentag > 0 && (
                                  <p className="text-xs text-green-600">
                                    {item.discountPercentag}% off
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                          <div className="space-y-2">
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Shipping Address
                                </p>
                                <p className="text-sm text-gray-600">
                                  {formattedAddress}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Payment Method
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {order.paymentMode
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Info */}
                          <div className="space-y-2">
                            {order.items.some((item) => item.delivered_at) && (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Delivered On
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {formatShortDate(
                                      order.items[0].delivered_at || ""
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                            {order.status?.toLowerCase() === "shipped" && (
                              <div className="flex items-center">
                                <Truck className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Tracking Number
                                  </p>
                                  <p className="text-sm text-gray-600 font-mono">
                                    {order.items[0]?.qikink_order_id ||
                                      "Not available"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                          {(order.status?.toLowerCase() === "shipped" ||
                            order.status?.toLowerCase() === "delivered") && (
                            <Button variant="outline" className="gap-2">
                              Track Order
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Link
                            href={`/orders/${order.order_group_id}`}
                            passHref
                          >
                            <Button variant="outline" className="gap-2">
                              View Details
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                          {(order.status?.toLowerCase() === "pending" ||
                            order.status?.toLowerCase() === "processing") && (
                            <Button
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50 gap-2"
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </PageWrapper>
      </div>
    </div>
  );
}
