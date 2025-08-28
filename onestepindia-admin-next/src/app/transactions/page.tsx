"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Filter,
  Calendar,
} from "lucide-react";
import api from "@/lib/api";

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  type: "credit" | "debit";
  status: "pending" | "approved" | "rejected";
  description: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [stats, setStats] = useState<TransactionStats>({
    totalTransactions: 0,
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      // For now, we'll use a mock API call since the backend might not have this endpoint
      // In a real implementation, you would call: const response = await api.get("/transactions");

      // Mock data for demonstration
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          user_id: 1,
          amount: 5000,
          type: "credit",
          status: "approved",
          description: "Referral bonus",
          created_at: "2024-01-15T10:30:00Z",
          user: { name: "John Doe", email: "john@example.com" },
        },
        {
          id: 2,
          user_id: 2,
          amount: 2500,
          type: "debit",
          status: "pending",
          description: "Withdrawal request",
          created_at: "2024-01-14T15:45:00Z",
          user: { name: "Jane Smith", email: "jane@example.com" },
        },
        {
          id: 3,
          user_id: 3,
          amount: 3000,
          type: "credit",
          status: "approved",
          description: "Product commission",
          created_at: "2024-01-13T09:20:00Z",
          user: { name: "Mike Johnson", email: "mike@example.com" },
        },
      ];

      setTransactions(mockTransactions);

      // Calculate stats
      const totalTransactions = mockTransactions.length;
      const totalAmount = mockTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );
      const pendingAmount = mockTransactions
        .filter((t) => t.status === "pending")
        .reduce((sum, t) => sum + t.amount, 0);
      const approvedAmount = mockTransactions
        .filter((t) => t.status === "approved")
        .reduce((sum, t) => sum + t.amount, 0);
      const rejectedAmount = mockTransactions
        .filter((t) => t.status === "rejected")
        .reduce((sum, t) => sum + t.amount, 0);

      setStats({
        totalTransactions,
        totalAmount,
        pendingAmount,
        approvedAmount,
        rejectedAmount,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    transactionId: number,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      // In a real implementation: await api.patch("/transactions/update-status", { id: transactionId, status: newStatus });
      console.log(`Updating transaction ${transactionId} to ${newStatus}`);
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error("Error updating transaction status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.user.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.id.toString().includes(searchQuery);

    const matchesStatus =
      selectedStatus === "All" || transaction.status === selectedStatus;
    const matchesType =
      selectedType === "All" || transaction.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const statusOptions = ["All", "pending", "approved", "rejected"];
  const typeOptions = ["All", "credit", "debit"];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">
            Manage payment transactions and withdrawals
          </p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTransactions}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.approvedAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{stats.rejectedAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions by user name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transaction #{transaction.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {transaction.user.name} • {transaction.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {getStatusIcon(transaction.status)}
                    {transaction.status.charAt(0).toUpperCase() +
                      transaction.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span
                    className={`font-medium ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="font-medium capitalize">
                    {transaction.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Description:</span>
                  <span className="font-medium">{transaction.description}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                {transaction.status === "pending" && (
                  <>
                    <button
                      onClick={() =>
                        handleStatusUpdate(transaction.id, "approved")
                      }
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() =>
                        handleStatusUpdate(transaction.id, "rejected")
                      }
                      className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedStatus !== "All" || selectedType !== "All"
              ? "Try adjusting your search or filter criteria."
              : "Transactions will appear here once users start making payments."}
          </p>
        </div>
      )}

      {/* Transaction Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredTransactions.length} of {transactions.length}{" "}
        transactions
      </div>
    </div>
  );
}
