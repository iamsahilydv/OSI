"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Printer,
  Download,
  ArrowLeft,
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
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type OrderItem = {
  order_id: number;
  variation_id: number;
  qty: number;
  price: number;
  discountPercentage: number;
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
  hsn_code: string;
};

type OrderGroup = {
  order_group_id: number;
  user_id: number;
  total_amount: number;
  paymentMode: string;
  addressId: number;
  created_at: string;
  status: string;
  shipping_charges: number;
  tax_amount: number;
  discount_amount: number;
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

const COMPANY_INFO = {
  name: "Your Company Name",
  address: "123 Business Street, City, State - 123456",
  gstin: "22AAAAA0000A1Z5",
  pan: "AAAAA0000A",
  phone: "+91 9876543210",
  email: "info@yourcompany.com",
  website: "www.yourcompany.com",
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<OrderGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const token = Cookies.get("usrTkn");
  const router = useRouter();
  const invoiceRef = React.useRef<HTMLDivElement>(null);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/getOrderById/${id}`, config);

      // Parse the response data
      const orderData = {
        ...res.data.result,
        address:
          typeof res.data.result.address === "string"
            ? JSON.parse(res.data.result.address)
            : res.data.result.address,
        items:
          typeof res.data.result.items === "string"
            ? JSON.parse(res.data.result.items)
            : res.data.result.items,
      };

      // Process items
      orderData.items = orderData.items.map((item: any) => ({
        ...item,
        product_images:
          typeof item.product_images === "string"
            ? JSON.parse(item.product_images)
            : item.product_images || [],
      }));

      setOrder(orderData);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && id) {
      fetchOrder();
    }
  }, [user?.id, id]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateGstAmount = (amount: number) => {
    // Assuming 18% GST
    return amount * 0.18;
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `invoice_${order?.order_group_id}`,
    onBeforePrint: async () => {
      // Do any logic before print, like setting loading state or updating content
    },
    pageStyle: `
    @page { size: A4; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
    }
  `,
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      logging: true,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice_${order?.order_group_id}.pdf`);
  };

  if (isLoading) {
    return (
      <PageWrapper
        title="Order Details"
        description="Loading order information"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!order) {
    return (
      <PageWrapper title="Order Details" description="Order not found">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Order not found
          </h3>
          <p className="mt-1 text-gray-500">
            The order you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push("/orders")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title={`Order #${order.order_group_id}`}
      description="View order details and invoice"
    >
      <div className="flex flex-col gap-6">
        {/* Order Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <Button variant="outline" onClick={() => router.push("/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
          </Button>
          <div className="flex gap-3">
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print Invoice
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Template */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div ref={invoiceRef} className="p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  TAX INVOICE
                </h1>
                <p className="text-gray-600">Original for Recipient</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-semibold">{COMPANY_INFO.name}</h2>
                <p className="text-sm text-gray-600">{COMPANY_INFO.address}</p>
                <p className="text-sm text-gray-600">
                  GSTIN: {COMPANY_INFO.gstin}
                </p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Billed To</h3>
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-700">
                  {order.address.AddressLine1}
                  {order.address.AddressLine2 &&
                    `, ${order.address.AddressLine2}`}
                </p>
                <p className="text-gray-700">
                  {order.address.City}, {order.address.State} -{" "}
                  {order.address.PostalCode}
                </p>
                <p className="text-gray-700">{order.address.Country}</p>
              </div>

              <div className="md:text-right">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-gray-600">Invoice #</div>
                  <div className="font-medium">{order.order_group_id}</div>
                  <div className="text-gray-600">Date</div>
                  <div className="font-medium">
                    {formatDate(order.created_at)}
                  </div>
                  <div className="text-gray-600">Order Status</div>
                  <div className="font-medium capitalize">{order.status}</div>
                  <div className="text-gray-600">Payment Method</div>
                  <div className="font-medium capitalize">
                    {order.paymentMode.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSN
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST (18%)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item) => {
                      const gstAmount = calculateGstAmount(
                        item.price * item.qty
                      );
                      return (
                        <tr key={item.order_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.product_images?.[0]?.url && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img
                                    className="h-10 w-10 rounded-md object-cover"
                                    src={item.product_images[0].url}
                                    alt={item.product_name}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.product_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.color && `Color: ${item.color}`}
                                  {item.size && `, Size: ${item.size}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.hsn_code || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.qty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.discountPercentage > 0
                              ? `${item.discountPercentage}%`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            {formatCurrency(gstAmount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.price * item.qty + gstAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-sm text-gray-600">
                  • Goods once sold will not be taken back or exchanged
                  <br />
                  • All disputes are subject to jurisdiction of our local courts
                  <br />• E. & O.E.
                </p>
              </div>
              <div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="text-gray-600">Subtotal</div>
                    <div className="text-right">
                      {formatCurrency(
                        order.total_amount -
                          order.tax_amount -
                          order.shipping_charges +
                          order.discount_amount
                      )}
                    </div>
                    <div className="text-gray-600">Discount</div>
                    <div className="text-right">
                      -{formatCurrency(order.discount_amount)}
                    </div>
                    <div className="text-gray-600">Shipping</div>
                    <div className="text-right">
                      {formatCurrency(order.shipping_charges)}
                    </div>
                    <div className="text-gray-600">Tax (GST)</div>
                    <div className="text-right">
                      {formatCurrency(order.tax_amount)}
                    </div>
                    <div className="font-medium">Total</div>
                    <div className="font-medium text-right">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="font-medium mb-2">Bank Details</h4>
                  <p className="text-sm text-gray-600">
                    Bank Name: Example Bank
                    <br />
                    Account No: 1234567890
                    <br />
                    IFSC Code: EXMP0001234
                    <br />
                    Branch: Main Branch
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-600">
                    • Payment due within 15 days
                    <br />• 1.5% interest per month on late payments
                  </p>
                </div>
                <div className="md:text-right">
                  <div className="mt-8 pt-4">
                    <p className="font-medium">For {COMPANY_INFO.name}</p>
                    <div className="mt-8 h-16"></div>
                    <p className="border-t border-gray-300 pt-4">
                      Authorized Signatory
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
