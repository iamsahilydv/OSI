"use client";

import { useState } from "react";
import {
  ShoppingCart,
  User,
  Mail,
  Phone,
  DollarSign,
  Package,
  Calendar,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  paymentMode: string;
  pymentStatus: boolean;
  delivered: boolean;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  orders: Array<{
    id: number;
    qty: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOrderUpdate: () => void;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onOrderUpdate,
}: OrderDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getOrderStatus = (order: Order) => {
    if (!order.pymentStatus) return "pending";
    if (order.delivered) return "delivered";
    return "paid";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "delivered":
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (newStatus: "delivered" | "paid") => {
    if (!order) return;

    setIsLoading(true);
    try {
      if (newStatus === "delivered") {
        await api.patch("/orders/update-delivery", {
          orderId: order.id,
          delivered: true,
        });
      } else if (newStatus === "paid") {
        await api.patch("/orders/update-payment", {
          orderId: order.id,
          pymentStatus: true,
        });
      }
      onOrderUpdate();
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = () => {
    // Implementation for invoice download
    console.log("Downloading invoice for order:", order?.id);
  };

  if (!order) return null;

  const status = getOrderStatus(order);
  const totalItems = order.orders?.reduce((sum, item) => sum + item.qty, 0) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.id}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Order Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(status)}`}
            >
              {getStatusIcon(status)}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="bg-gray-50 text-gray-600 px-3 py-2 rounded-md hover:bg-gray-100 flex items-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" />
            Download Invoice
          </button>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Customer Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Name:</span>
              <span className="font-medium">{order.user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Email:</span>
              <span className="font-medium">{order.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Order Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total Amount:</span>
              <span className="font-medium">₹{order.total_amount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Items:</span>
              <span className="font-medium">{totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Date:</span>
              <span className="font-medium">
                {new Date(order.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Payment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Payment Mode:</span>
              <span className="font-medium capitalize">{order.paymentMode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Payment Status:</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.pymentStatus
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order.pymentStatus ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Order Items</h4>
          <div className="space-y-3">
            {order.orders?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.product?.name}</p>
                    <p className="text-xs text-gray-500">
                      Quantity: {item.qty}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">₹{item.price}</p>
                  <p className="text-xs text-gray-500">
                    Total: ₹{item.price * item.qty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          {status === "paid" && !order.delivered && (
            <button
              onClick={() => handleStatusUpdate("delivered")}
              disabled={isLoading}
              className="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-md hover:bg-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Truck className="h-4 w-4" />
              {isLoading ? "Updating..." : "Mark as Delivered"}
            </button>
          )}
          {status === "pending" && (
            <button
              onClick={() => handleStatusUpdate("paid")}
              disabled={isLoading}
              className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isLoading ? "Updating..." : "Mark as Paid"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
