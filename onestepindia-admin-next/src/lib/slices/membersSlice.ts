import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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

interface MembersState {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  selectedMember: Member | null;
  filters: {
    searchQuery: string;
    selectedStatus: string;
  };
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalRevenue: number;
    todayRevenue: number;
  };
}

const initialState: MembersState = {
  members: [],
  isLoading: false,
  error: null,
  selectedMember: null,
  filters: {
    searchQuery: "",
    selectedStatus: "All",
  },
  stats: {
    totalMembers: 0,
    activeMembers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  },
};

const membersSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    fetchMembersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<Member[]>) => {
      state.isLoading = false;
      state.members = action.payload;
      state.error = null;

      // Calculate stats
      state.stats.totalMembers = action.payload.length;
      state.stats.activeMembers = action.payload.filter(
        (m) => m.status === "active"
      ).length;
      state.stats.totalRevenue = action.payload.reduce(
        (sum, m) => sum + m.total_income,
        0
      );
      state.stats.todayRevenue = action.payload.reduce(
        (sum, m) => sum + m.today_income,
        0
      );
    },
    fetchMembersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateMemberStatus: (
      state,
      action: PayloadAction<{ memberId: number; status: "active" | "inactive" }>
    ) => {
      const member = state.members.find(
        (m) => m.id === action.payload.memberId
      );
      if (member) {
        member.status = action.payload.status;
        // Recalculate stats
        state.stats.activeMembers = state.members.filter(
          (m) => m.status === "active"
        ).length;
      }
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedMember = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedStatus: (state, action: PayloadAction<string>) => {
      state.filters.selectedStatus = action.payload;
    },
    clearFilters: (state) => {
      state.filters.searchQuery = "";
      state.filters.selectedStatus = "All";
    },
  },
});

export const {
  fetchMembersStart,
  fetchMembersSuccess,
  fetchMembersFailure,
  updateMemberStatus,
  setSelectedMember,
  setSearchQuery,
  setSelectedStatus,
  clearFilters,
} = membersSlice.actions;

export default membersSlice.reducer;
