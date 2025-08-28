"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import api from "@/lib/api";
import MemberDetailsModal from "@/components/modals/MemberDetailsModal";

interface Member {
  id: number;
  name: string;
  email: string;
  mobile: string;
  status: "active" | "inactive";
  total_income: number;
  today_income: number;
  total_withdraw: number;
  wallet: number;
  leftCount: number;
  rightCount: number;
  created_at: string;
  stage: string;
  totalRefered: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/users");
      console.log("Members response:", response.data); // Debug log
      setMembers(response.data.Users || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (
    memberId: number,
    newStatus: "active" | "inactive"
  ) => {
    try {
      await api.patch("/updateUserStatus", {
        id: memberId,
        status: newStatus,
      });
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error("Error updating member status:", error);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === "All" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const memberStats = {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    totalIncome: members.reduce((sum, m) => sum + m.total_income, 0),
    totalReferrals: members.reduce((sum, m) => sum + m.totalRefered, 0),
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
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
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberStats.totalMembers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberStats.activeMembers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{memberStats.totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">
                {memberStats.totalReferrals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
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
          <option value="All">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {member.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{member.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Wallet: ₹{member.wallet}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Referrals:</span>
                <span className="font-medium ml-1">{member.totalRefered}</span>
              </div>
              <div>
                <span className="text-gray-500">Stage:</span>
                <span className="font-medium ml-1">{member.stage}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedMember(member);
                  setIsModalOpen(true);
                }}
                className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(
                    member.id,
                    member.status === "active" ? "inactive" : "active"
                  )
                }
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-1 ${
                  member.status === "active"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-600 hover:bg-green-100"
                }`}
              >
                {member.status === "active" ? (
                  <>
                    <UserX className="h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    Activate
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No members found
          </h3>
          <p className="text-gray-600">
            {searchQuery || selectedStatus !== "All"
              ? "Try adjusting your search or filter criteria."
              : "Members will appear here once they register."}
          </p>
        </div>
      )}

      {/* Member Count */}
      <div className="text-sm text-gray-500">
        Showing {filteredMembers.length} of {members.length} members
      </div>

      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onMemberUpdate={fetchMembers}
      />
    </div>
  );
}
