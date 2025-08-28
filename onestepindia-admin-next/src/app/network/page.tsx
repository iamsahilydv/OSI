"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Network,
  Users,
  TrendingUp,
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api";

interface NetworkUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  total_income: number;
  today_income: number;
  leftCount: number;
  rightCount: number;
  stage: string;
  totalRefered: number;
  referrer_id: number | null;
  left_user_id: number | null;
  right_user_id: number | null;
}

interface NetworkStats {
  totalUsers: number;
  activeUsers: number;
  totalReferrals: number;
  averageIncome: number;
}

export default function NetworkPage() {
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null);
  const [stats, setStats] = useState<NetworkStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalReferrals: 0,
    averageIncome: 0,
  });

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      const response = await api.get("/users");
      if (response.data.success) {
        const networkUsers = response.data.Users || [];
        setUsers(networkUsers);

        // Calculate stats
        const totalUsers = networkUsers.length;
        const activeUsers = networkUsers.filter(
          (u: NetworkUser) => u.status === "active"
        ).length;
        const totalReferrals = networkUsers.reduce(
          (sum: number, u: NetworkUser) => sum + u.totalRefered,
          0
        );
        const averageIncome =
          networkUsers.length > 0
            ? networkUsers.reduce(
                (sum: number, u: NetworkUser) => sum + u.total_income,
                0
              ) / networkUsers.length
            : 0;

        setStats({
          totalUsers,
          activeUsers,
          totalReferrals,
          averageIncome,
        });
      }
    } catch (error) {
      console.error("Error fetching network data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buildNetworkTree = (users: NetworkUser[]) => {
    const userMap = new Map<number, NetworkUser>();
    const rootUsers: NetworkUser[] = [];

    // Create a map of all users
    users.forEach((user) => userMap.set(user.id, user));

    // Build the tree structure
    users.forEach((user) => {
      if (user.referrer_id === null) {
        rootUsers.push(user);
      }
    });

    return { userMap, rootUsers };
  };

  const renderUserNode = (
    user: NetworkUser,
    userMap: Map<number, NetworkUser>
  ) => {
    const leftUser = user.left_user_id ? userMap.get(user.left_user_id) : null;
    const rightUser = user.right_user_id
      ? userMap.get(user.right_user_id)
      : null;

    return (
      <div key={user.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user.status}
            </span>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
          <div>
            <span className="text-gray-500">Income:</span>
            <span className="font-medium ml-1">₹{user.total_income}</span>
          </div>
          <div>
            <span className="text-gray-500">Stage:</span>
            <span className="font-medium ml-1">{user.stage}</span>
          </div>
          <div>
            <span className="text-gray-500">Referrals:</span>
            <span className="font-medium ml-1">{user.totalRefered}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedUser(user)}
            className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>
        </div>

        {/* Children */}
        {(leftUser || rightUser) && (
          <div className="mt-4 pl-4 border-l-2 border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leftUser && (
                <div className="relative">
                  <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200"></div>
                  {renderUserNode(leftUser, userMap)}
                </div>
              )}
              {rightUser && (
                <div className="relative">
                  <div className="absolute -left-4 top-1/2 w-4 h-px bg-gray-200"></div>
                  {renderUserNode(rightUser, userMap)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

  const { userMap, rootUsers } = buildNetworkTree(filteredUsers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network</h1>
          <p className="text-gray-600">
            Manage referral networks and user hierarchies
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Network className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <UserPlus className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Referrals
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalReferrals}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{Math.round(stats.averageIncome)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Network Tree */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Network Hierarchy</h2>
        {rootUsers.length > 0 ? (
          <div className="space-y-4">
            {rootUsers.map((user) => renderUserNode(user, userMap))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No network data found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Try adjusting your search criteria."
                : "Network data will appear here once users start referring others."}
            </p>
          </div>
        )}
      </div>

      {/* User Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  );
}
