"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  UserCheck,
  UserX,
  Edit,
  Save,
  X,
  Eye,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import api from "@/lib/api";

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

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onMemberUpdate: () => void;
}

export default function MemberDetailsModal({
  isOpen,
  onClose,
  member,
  onMemberUpdate,
}: MemberDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (newStatus: "active" | "inactive") => {
    if (!member) return;

    setIsLoading(true);
    try {
      await api.patch("/updateUserStatus", {
        id: member.id,
        status: newStatus,
      });
      onMemberUpdate();
    } catch (error) {
      console.error("Error updating member status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNetwork = () => {
    // Navigate to network page with this user's network
    console.log("View network for user:", member?.id);
  };

  const handleViewOrders = () => {
    // Navigate to orders page filtered by this user
    console.log("View orders for user:", member?.id);
  };

  if (!member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Member Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                member.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {member.status === "active" ? (
                <UserCheck className="h-3 w-3" />
              ) : (
                <UserX className="h-3 w-3" />
              )}
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleViewNetwork}
              className="bg-blue-50 text-blue-600 px-3 py-2 rounded-md hover:bg-blue-100 flex items-center gap-2 text-sm"
            >
              <Users className="h-4 w-4" />
              View Network
            </button>
            <button
              onClick={handleViewOrders}
              className="bg-green-50 text-green-600 px-3 py-2 rounded-md hover:bg-green-100 flex items-center gap-2 text-sm"
            >
              <Eye className="h-4 w-4" />
              View Orders
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Name:</span>
              <span className="font-medium">{member.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Email:</span>
              <span className="font-medium">{member.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Mobile:</span>
              <span className="font-medium">{member.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Joined:</span>
              <span className="font-medium">
                {new Date(member.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Financial Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total Income:</span>
              <span className="font-medium">₹{member.total_income}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Today's Income:</span>
              <span className="font-medium">₹{member.today_income}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total Withdraw:</span>
              <span className="font-medium">₹{member.total_withdraw}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Wallet Balance:</span>
              <span className="font-medium">₹{member.wallet}</span>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Network Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Total Referrals:</span>
              <span className="font-medium">{member.totalRefered}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Left Count:</span>
              <span className="font-medium">{member.leftCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Right Count:</span>
              <span className="font-medium">{member.rightCount}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Stage:</span>
            <span className="font-medium">{member.stage}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => handleStatusUpdate(member.status === "active" ? "inactive" : "active")}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 rounded-md disabled:opacity-50 flex items-center justify-center gap-2 ${
              member.status === "active"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }`}
          >
            {member.status === "active" ? (
              <>
                <UserX className="h-4 w-4" />
                {isLoading ? "Updating..." : "Deactivate Member"}
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4" />
                {isLoading ? "Updating..." : "Activate Member"}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
