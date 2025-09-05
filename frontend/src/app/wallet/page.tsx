"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageWrapper from "@/components/layout/PageWrapper";
import TopNavbar from "@/components/layout/TopNavbar";
import Sidebar from "@/components/layout/Sidebar";
import { formatCurrency, formatDate } from "@/utils/helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CreditCard,
  Smartphone,
  Check,
  Plus,
  Trash2,
  Edit,
  XCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import Cookies from "js-cookie";

// Define BankAccountType and UpiIdType
type BankAccountType = {
  id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  branch_name?: string;
  ifsc_code: string;
  is_default?: boolean;
};

type UpiIdType = {
  id: string;
  upi_id: string;
  upi_provider: string;
  is_default?: boolean;
};

// Define fade-in animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

// Define form schema for bank withdraw request
const bankWithdrawFormSchema = z.object({
  amount: z.coerce
    .number()
    .min(500, "Minimum withdrawal amount is ₹500")
    .max(25000, "Maximum withdrawal amount is ₹25,000"),
  accountNumber: z.string().min(9, "Account number must be at least 9 digits"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid IFSC code"),
  accountHolderName: z.string().min(3, "Please enter the account holder name"),
  bankName: z.string().min(3, "Please enter the bank name"),
  branchName: z.string().optional(),
});

const bankWithdrawOnlySchema = z.object({
  amount: z.coerce
    .number()
    .min(500, "Minimum withdrawal amount is ₹500")
    .max(25000, "Maximum withdrawal amount is ₹25,000"),
  bank_id: z.number().min(0, "Bank account selection is required"),
});

// Define form schema for UPI withdraw request
const upiWithdrawFormSchema = z.object({
  upiId: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/, "Please enter a valid UPI ID"),
  upiProvider: z.string().min(2, "Please select a UPI provider"),
});
const upiWithdrawOnlySchema = z.object({
  amount: z.coerce
    .number()
    .min(500, "Minimum withdrawal amount is ₹500")
    .max(25000, "Maximum withdrawal amount is ₹25,000"),
  upi_id: z.number().min(0, "Please select a UPI ID"),
});

type BankWithdrawFormValues = z.infer<typeof bankWithdrawFormSchema>;
type UpiWithdrawFormValues = z.infer<typeof upiWithdrawFormSchema>;

// UPI provider options
const upiProviders = [
  { value: "googlepay", label: "Google Pay" },
  { value: "phonepe", label: "PhonePe" },
  { value: "paytm", label: "Paytm" },
  { value: "amazonpay", label: "Amazon Pay" },
  { value: "bhim", label: "BHIM" },
  { value: "other", label: "Other" },
];

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "earnings" | "withdrawals"
  >("earnings");
  const [currentStatus, setCurrentStatus] = useState<
    "all" | "completed" | "pending" | "failed"
  >("all");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [savedBankAccounts, setSavedBankAccounts] = useState<BankAccountType[]>(
    []
  );
  const [savedUpiIds, setSavedUpiIds] = useState<UpiIdType[]>([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string>("");
  const [selectedUpiId, setSelectedUpiId] = useState<string>("");

  const [isAddingNew, setIsAddingNew] = useState(false);

  // Calculate wallet balance
  const [walletBalance, setWalletBalance] = useState<number>(user?.wallet || 0);
  useEffect(() => {
    setWalletBalance(user?.wallet || 0);
  }, [user]);

  // const [earningTransaction, setEarningTransaction] = useState([]);
  // const [withdrawalTransaction, setWithdrawalTransaction] = useState([]);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const token = Cookies.get("usrTkn");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const getTransactions = async () => {
    try {
      const response = await api.get(`/getUserTransaction`, config);
      const data = response.data.message;

      // Transform earnings
      const earnings = data.earnings.map((tx: any) => ({
        id: tx.id,
        type: "commission",
        amount: parseFloat(tx.payment) || 0,
        status: tx.status === "done" ? "completed" : tx.status?.toLowerCase(),
        date: new Date(tx.receive_at || tx.created_at),
        description:
          tx.paymentReason === "refer"
            ? "Referral commission"
            : tx.paymentReason === "ResaleCommission"
            ? "Resale commission"
            : `Commission from ${tx.userName || "Unknown"}`,
      }));

      // Transform withdrawals
      const withdrawals = data.withdrawals.map((tx: any) => ({
        id: tx.id,
        type: "withdrawal",
        amount: -Math.abs(parseFloat(tx.amount)) || 0,
        status: tx.status === "done" ? "completed" : tx.status?.toLowerCase(),
        date: new Date(tx.created_at),
        description: tx.upiKey ? "UPI Withdrawal" : "Bank Withdrawal",
        method: tx.upiKey ? "upi" : "bank",
      }));

      setAllTransactions([...earnings, ...withdrawals]);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const getBankAndUPI = async () => {
    let response = await api.get(`/getAllPaymentDetails`, config);
    // console.log(response.data.message);
    setSavedUpiIds(response.data.message.upiData);
    setSavedBankAccounts(response.data.message.bankData);
  };

  useEffect(() => {
    getTransactions();
    getBankAndUPI();
  }, []);

  // Prepare filtered transactions based on current section and status
  const filteredTransactions = allTransactions.filter((tx) => {
    if (currentSection === "earnings" && tx.type !== "commission") return false;
    if (currentSection === "withdrawals" && tx.type !== "withdrawal")
      return false;
    if (currentStatus !== "all" && tx.status !== currentStatus) return false;
    return true;
  });

  // Initialize bank withdraw form
  const bankAddForm = useForm<BankWithdrawFormValues>({
    resolver: zodResolver(bankWithdrawFormSchema),
    defaultValues: {
      amount: 500,
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      bankName: "",
      branchName: "",
    },
  });

  const bankWithdrawOnlyForm = useForm<z.infer<typeof bankWithdrawOnlySchema>>({
    resolver: zodResolver(bankWithdrawOnlySchema),
    defaultValues: {
      amount: 500,
      bank_id: +selectedBankAccount,
    },
  });

  // Initialize UPI withdraw form
  // For adding a new UPI ID
  const upiAddForm = useForm<UpiWithdrawFormValues>({
    resolver: zodResolver(upiWithdrawFormSchema),
    defaultValues: {
      upiId: "",
      upiProvider: "",
    },
  });

  // For submitting a withdrawal with existing UPI ID
  const upiWithdrawOnlyForm = useForm<z.infer<typeof upiWithdrawOnlySchema>>({
    resolver: zodResolver(upiWithdrawOnlySchema),
    defaultValues: {
      amount: 500,
      upi_id: +selectedUpiId,
    },
  });

  // Set form values based on selected bank account
  // const populateBankForm = (accountId: string) => {
  //   console.log(accountId, "acc");
  //   const account = savedBankAccounts.find((acc) => acc.id === accountId);
  //   if (account) {
  //     bankAddForm.setValue("accountHolderName", account.accountHolderName);
  //     bankAddForm.setValue("accountNumber", account.accountNumber);
  //     bankAddForm.setValue("ifscCode", account.ifscCode);
  //     bankAddForm.setValue("bankName", account.bankName);
  //     bankAddForm.setValue("branchName", account.branchName || "");
  //   }
  // };

  // Set form values based on selected UPI ID
  // const populateUpiForm = (upiId: string) => {
  //   const upi = savedUpiIds.find((u) => u.id === upiId);
  //   if (upi) {
  //     upiWithdrawForm.setValue("upiId", upi.upiId);
  //     upiWithdrawForm.setValue(
  //       "upiProvider",
  //       upi.upiProvider.toLowerCase().replace(/\s+/g, "")
  //     );
  //   }
  // };

  // Handle bank withdraw form submission
  const onBankWithdrawSubmit = async (
    values: z.infer<typeof bankWithdrawOnlySchema>
  ) => {
    // console.log(values);
    // console.log("hieee");
    try {
      setIsLoading(true);

      if (values.amount > walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance for this withdrawal",
          variant: "destructive",
        });
        return;
      }

      if (!selectedBankAccount) {
        toast({
          title: "No Bank Selected",
          description: "Please select a bank account to continue",
          variant: "destructive",
        });
        return;
      }

      const response = await api.post(
        "/createWithdrawal",
        {
          amount: values.amount,
          bank_id: selectedBankAccount,
        },
        config
      );

      if (response.status === 200) {
        toast({
          title: "Withdrawal Requested",
          description: `Your request for ₹${values.amount} has been submitted.`,
          variant: "success",
        });
        setWalletBalance((prev) => prev - values.amount);
        bankWithdrawOnlyForm.reset({
          amount: 500,
          bank_id: +selectedBankAccount,
        });
      } else {
        throw new Error("Unexpected API response");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle UPI withdraw form submission
  const onUpiWithdrawSubmit = async (
    values: z.infer<typeof upiWithdrawOnlySchema>
  ) => {
    try {
      setIsLoading(true);

      // Validate if sufficient balance
      if (values.amount > walletBalance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance for this withdrawal",
          variant: "destructive",
        });
        return;
      }

      // Call the actual API (replace this with your real call)
      const response = await api.post(
        "/createWithdrawal",
        {
          amount: values.amount,
          upi_id: values.upi_id,
        },
        config
      );

      if (response.status === 200) {
        toast({
          title: "Withdrawal Requested",
          description: `Your UPI withdrawal request for ${formatCurrency(
            values.amount
          )} has been submitted`,
          variant: "success",
        });

        setWalletBalance((prev) => prev - values.amount);

        upiWithdrawOnlyForm.reset({
          amount: 500,
          upi_id: +selectedUpiId,
        });
      } else {
        throw new Error("Unexpected API response");
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process UPI withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle setting default bank account
  const setDefaultBankAccount = (accountId: string) => {
    setSavedBankAccounts(
      savedBankAccounts.map((acc) => ({
        ...acc,
        is_default: acc.id === accountId,
      }))
    );
    setSelectedBankAccount(accountId);
    toast({
      title: "Default Updated",
      description: "Your default bank account has been updated",
    });
  };

  // Handle setting default UPI ID
  const setDefaultUpiId = (upiId: string) => {
    setSavedUpiIds(
      savedUpiIds.map((upi) => ({
        ...upi,
        is_default: upi.id === upiId,
      }))
    );
    setSelectedUpiId(upiId);
    toast({
      title: "Default Updated",
      description: "Your default UPI ID has been updated",
    });
  };
  const addUpiAccount = async (upiData: {
    upi_id: string;
    upi_provider: string;
    is_default: boolean;
  }) => {
    try {
      const response = await api.post("/addUPI", upiData, config);

      if (response.status === 200) {
        toast({
          title: "UPI Added",
          description: "Your UPI ID has been successfully added.",
          variant: "success",
        });

        const newUpi: UpiIdType = {
          id: response.data?.message?.id || `upi${Date.now()}`,
          upi_id: upiData.upi_id,
          upi_provider: upiData.upi_provider,
          is_default: upiData.is_default,
        };

        setSavedUpiIds((prev) => [...prev, newUpi]);
        setSelectedUpiId(newUpi.id);
        setIsAddingNew(false);
      } else {
        toast({
          title: "Failed to Add UPI",
          description: response.data?.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Add UPI error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to add UPI. Try again later.",
        variant: "destructive",
      });
    }
  };

  const addBankAccount = async (bankData: {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    branch_name?: string;
    ifsc_code: string;
  }) => {
    // console.log(bankData);
    try {
      const response = await api.post("/addBankDetails", bankData, config);

      if (response.status === 200) {
        toast({
          title: "Bank Added",
          description: "Your bank account has been successfully added.",
          variant: "success",
        });

        const newAccount: BankAccountType = {
          id: `bank${Date.now()}`, // Replace with ID from backend if returned
          account_holder_name: bankData.account_holder_name,
          account_number: bankData.account_number,
          bank_name: bankData.bank_name,
          branch_name: bankData.branch_name || "",
          ifsc_code: bankData.ifsc_code,
          is_default: savedBankAccounts.length === 0,
        };

        setSavedBankAccounts((prev) => [...prev, newAccount]);
        setSelectedBankAccount(newAccount.id);
        // populateBankForm(newAccount.id);
        setIsAddingNew(false);
      } else {
        toast({
          title: "Failed to Add Bank",
          description: response.data?.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Add bank error:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to add bank account. Try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting bank account
  const deleteBankAccount = async (accountId: string) => {
    // console.log(accountId);
    const response = await api.delete(`/removeBankDetails`, {
      ...config,
      data: { bank_id: accountId },
    });
    if (response.status == 200) {
      const updatedAccounts = savedBankAccounts.filter(
        (acc) => acc.id !== accountId
      );
      setSavedBankAccounts(updatedAccounts);

      if (selectedBankAccount === accountId) {
        setSelectedBankAccount(updatedAccounts[0]?.id || "");
        if (updatedAccounts[0]) {
          // populateBankForm(updatedAccounts[0].id);
        } else {
          bankAddForm.reset({
            amount: 500,
            accountNumber: "",
            ifscCode: "",
            accountHolderName: "",
            bankName: "",
            branchName: "",
          });
          setIsAddingNew(true);
        }
      }

      toast({
        title: "Account Deleted",
        description: "Your bank account has been removed",
        variant: "success",
      });
    } else {
      toast({
        title: "Account Not Deleted",
        description: "Your bank account is not removed Try again later",
        variant: "destructive",
      });
    }
  };

  // Handle deleting UPI ID
  const deleteUpiId = async (upiId: string) => {
    try {
      const response = await api.delete(`/removeUPI`, {
        ...config,
        data: { upi_id: upiId },
      });

      if (response.status === 200) {
        const updatedUpiIds = savedUpiIds.filter((upi) => upi.id !== upiId);
        setSavedUpiIds(updatedUpiIds);

        if (selectedUpiId === upiId) {
          setSelectedUpiId(updatedUpiIds[0]?.id || "");
          if (updatedUpiIds[0]) {
            // populateUpiForm(updatedUpiIds[0].id);
          } else {
            upiAddForm.reset({
              // amount: 500,
              upiId: "",
              upiProvider: "",
            });
            setIsAddingNew(true);
          }
        }

        toast({
          title: "UPI Deleted",
          description: "Your UPI ID has been removed",
          variant: "success",
        });
      } else {
        toast({
          title: "UPI Not Deleted",
          description: "Your UPI ID was not removed. Try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("UPI delete error:", error);
      toast({
        title: "Server Error",
        description: "Failed to delete UPI ID. Try again later.",
        variant: "destructive",
      });
    }
  };

  const changeDefault = async (account: any) => {
    // let response = await api.
    if (!account.is_default) setDefaultBankAccount(account.id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* <TopNavbar /> */}
      <div className="flex flex-1 gap-2">
        <Sidebar />
        <PageWrapper
          title="Wallet"
          description="Manage your earnings and withdrawals"
          className="w-full"
        >
          {/* Wallet Balance */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="md:col-span-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white/80">
                      Available Balance
                    </h3>
                    <motion.p
                      className="text-5xl font-bold text-white mt-2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      {formatCurrency(walletBalance)}
                    </motion.p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="mt-4 md:mt-0 bg-white text-indigo-700 hover:bg-white/90 hover:text-indigo-800 font-semibold"
                      onClick={() =>
                        document
                          .getElementById("withdraw-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Withdraw Funds
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="transactions" className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <TabsList className="w-full max-w-md mb-8 p-1 bg-slate-200 dark:bg-slate-800">
                <TabsTrigger
                  value="transactions"
                  className="flex-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 transition-all duration-200"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger
                  value="withdraw"
                  className="flex-1 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 transition-all duration-200"
                  id="withdraw-section"
                >
                  Withdraw
                </TabsTrigger>
              </TabsList>
            </motion.div>

            <TabsContent value="transactions">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                          Transaction History
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400">
                          View your earnings and withdrawals
                        </CardDescription>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <div className="flex flex-wrap gap-2">
                          <div className="flex space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentSection === "earnings"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentSection("earnings")}
                                className={
                                  currentSection === "earnings"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                Earnings
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentSection === "withdrawals"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentSection("withdrawals")}
                                className={
                                  currentSection === "withdrawals"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                Withdrawals
                              </Button>
                            </motion.div>
                          </div>
                          <div className="flex space-x-2">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentStatus === "all"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentStatus("all")}
                                className={
                                  currentStatus === "all"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                All
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentStatus === "completed"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentStatus("completed")}
                                className={
                                  currentStatus === "completed"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                Completed
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentStatus === "pending"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentStatus("pending")}
                                className={
                                  currentStatus === "pending"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                Pending
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant={
                                  currentStatus === "failed"
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => setCurrentStatus("failed")}
                                className={
                                  currentStatus === "failed"
                                    ? "bg-indigo-600 hover:bg-indigo-700"
                                    : ""
                                }
                              >
                                Failed
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {filteredTransactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                              <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                Date
                              </th>
                              <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                Description
                              </th>
                              <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                Status
                              </th>
                              <th className="text-right py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((tx, index) => (
                              <motion.tr
                                key={tx.id}
                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                                custom={index}
                                initial="hidden"
                                animate="visible"
                                variants={listItemVariants}
                              >
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                  {formatDate(tx.date)}
                                </td>
                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                                  <div className="flex items-center">
                                    {tx.type === "commission" ? (
                                      <span className="mr-2 text-green-500">
                                        <ArrowUpCircle size={18} />
                                      </span>
                                    ) : (
                                      <span className="mr-2 text-red-500">
                                        <ArrowDownCircle size={18} />
                                      </span>
                                    )}
                                    {tx.description}
                                    {tx.method && (
                                      <span className="ml-2 text-xs inline-flex items-center px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        {tx.method === "bank" ? (
                                          <CreditCard
                                            size={12}
                                            className="mr-1"
                                          />
                                        ) : (
                                          <Smartphone
                                            size={12}
                                            className="mr-1"
                                          />
                                        )}
                                        {tx.method === "bank" ? "Bank" : "UPI"}
                                      </span>
                                    )}
                                    {tx.reason && (
                                      <span className="ml-2 text-xs inline-flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300">
                                        {tx.reason}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${
                                      tx.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : tx.status === "pending"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {tx.status === "pending" && (
                                      <Clock size={12} className="mr-1" />
                                    )}
                                    {tx.status === "failed" && (
                                      <XCircle size={12} className="mr-1" />
                                    )}
                                    {tx.status === "completed"
                                      ? "Completed"
                                      : tx.status === "pending"
                                      ? "Pending"
                                      : "Failed"}
                                  </span>
                                </td>
                                <td
                                  className={`py-4 px-4 text-right font-semibold ${
                                    tx.amount > 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {formatCurrency(tx.amount)}
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <p className="text-slate-500 dark:text-slate-400">
                          No transactions found for the selected filters.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="withdraw">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 mb-6">
                  <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
                    <CardTitle className="text-2xl text-slate-800 dark:text-slate-100">
                      Withdraw Funds
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      Select your preferred withdrawal method
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={withdrawMethod}
                      onValueChange={setWithdrawMethod}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <RadioGroupItem
                          value="bank"
                          id="bank"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="bank"
                          className="flex items-center justify-between space-x-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-indigo-600" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                Bank Transfer
                              </p>
                              <p className="text-sm text-muted-foreground">
                                2-3 business days
                              </p>
                            </div>
                          </div>
                          {withdrawMethod === "bank" && (
                            <Check className="h-5 w-5 text-indigo-600" />
                          )}
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem
                          value="upi"
                          id="upi"
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor="upi"
                          className="flex items-center justify-between space-x-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-indigo-600 [&:has([data-state=checked])]:border-primary cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <Smartphone className="h-5 w-5 text-indigo-600" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">
                                UPI Transfer
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Instant transfer
                              </p>
                            </div>
                          </div>
                          {withdrawMethod === "upi" && (
                            <Check className="h-5 w-5 text-indigo-600" />
                          )}
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Bank Transfer Tab */}
                {withdrawMethod === "bank" && (
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 mt-6">
                    <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                            Bank Account Details
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Transfer funds to your bank account
                          </CardDescription>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingNew(true);
                              setSelectedBankAccount("");
                              bankAddForm.reset({
                                amount: 500,
                                accountNumber: "",
                                ifscCode: "",
                                accountHolderName: "",
                                bankName: "",
                                branchName: "",
                              });
                            }}
                            className="flex items-center"
                            disabled={isAddingNew}
                          >
                            <Plus size={16} className="mr-1" /> Add New Account
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {savedBankAccounts.length > 0 && !isAddingNew && (
                        <div className="mb-8">
                          <div className="flex flex-col mb-6">
                            <Label className="mb-2 text-slate-700 dark:text-slate-300 font-medium">
                              Select Bank Account
                            </Label>
                            <div className="grid grid-cols-1 gap-4">
                              {savedBankAccounts.map((account) => (
                                <motion.div
                                  key={account.id}
                                  whileHover={{ scale: 1.01 }}
                                  className={`border rounded-lg p-4 cursor-pointer relative ${
                                    selectedBankAccount === account.id
                                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                      : "border-slate-200 dark:border-slate-700"
                                  }`}
                                  onClick={() => {
                                    setSelectedBankAccount(account.id);
                                    bankWithdrawOnlyForm.setValue(
                                      "bank_id",
                                      parseInt(account.id)
                                    ); // assuming ID needs to be a number
                                  }}
                                >
                                  <div className="flex justify-between mb-2">
                                    <div className="flex items-center">
                                      <CreditCard
                                        size={18}
                                        className="text-indigo-600 mr-2"
                                      />
                                      <span className="font-medium">
                                        {account?.bank_name}
                                      </span>
                                      {account.is_default && (
                                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          changeDefault(account);
                                        }}
                                        className="h-8 w-8 p-0"
                                      >
                                        {account.is_default ? (
                                          <Check
                                            size={16}
                                            className="text-green-600"
                                          />
                                        ) : (
                                          <span className="w-4 h-4 rounded-full border border-gray-400" />
                                        )}
                                      </Button>

                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Trash2
                                              size={16}
                                              className="text-red-600"
                                            />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Delete Bank Account
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete
                                              this bank account? This action
                                              cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                deleteBankAccount(account.id)
                                              }
                                              className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 text-sm">
                                    <div>
                                      Account: {account?.account_holder_name}
                                    </div>
                                    <div>
                                      Account No: ••••
                                      {account.account_number?.slice(-4)}
                                    </div>
                                    <div>IFSC: {account?.ifsc_code}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {isAddingNew ? (
                        <Form {...bankAddForm}>
                          <form
                            onSubmit={bankAddForm.handleSubmit((values) =>
                              addBankAccount({
                                account_holder_name: values.accountHolderName,
                                account_number: values.accountNumber,
                                bank_name: values.bankName,
                                branch_name: values.branchName,
                                ifsc_code: values.ifscCode,
                              })
                            )}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={bankAddForm.control}
                                name="accountHolderName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Holder Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bankAddForm.control}
                                name="accountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={bankAddForm.control}
                                name="bankName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={bankAddForm.control}
                                name="branchName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>
                                      Branch Name (Optional)
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={bankAddForm.control}
                              name="ifscCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>IFSC Code</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-between items-center pt-4">
                              {savedBankAccounts.length > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsAddingNew(false)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg font-medium"
                              >
                                {isLoading ? (
                                  <div className="flex items-center">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="mr-2"
                                    >
                                      <Clock size={16} />
                                    </motion.div>
                                    Adding...
                                  </div>
                                ) : (
                                  "Add Bank Account"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <Form {...bankWithdrawOnlyForm}>
                          <form
                            onSubmit={bankWithdrawOnlyForm.handleSubmit(
                              onBankWithdrawSubmit
                            )}
                            className="space-y-6"
                          >
                            <FormField
                              control={bankWithdrawOnlyForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount (₹)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={500}
                                      max={25000}
                                      {...field}
                                      className="border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Min: ₹500, Max: ₹25,000. Available:{" "}
                                    <span className="font-semibold">
                                      {formatCurrency(walletBalance)}
                                    </span>
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end pt-4">
                              <Button
                                type="submit"
                                disabled={
                                  isLoading ||
                                  walletBalance < 500 ||
                                  !selectedBankAccount
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-6 px-8 text-lg font-medium"
                              >
                                {isLoading ? (
                                  <div className="flex items-center">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="mr-2"
                                    >
                                      <Clock size={16} />
                                    </motion.div>
                                    Processing...
                                  </div>
                                ) : (
                                  "Withdraw Funds"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* UPI Transfer Tab */}
                {withdrawMethod === "upi" && (
                  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 mt-6">
                    <CardHeader className="bg-slate-100 dark:bg-slate-800 rounded-t-lg">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-xl text-slate-800 dark:text-slate-100">
                            UPI Details
                          </CardTitle>
                          <CardDescription className="text-slate-600 dark:text-slate-400">
                            Transfer funds to your UPI account
                          </CardDescription>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsAddingNew(true);
                              setSelectedUpiId("");
                              upiAddForm.reset({
                                upiId: "",
                                upiProvider: "",
                              });
                            }}
                            className="flex items-center"
                            disabled={isAddingNew}
                          >
                            <Plus size={16} className="mr-1" /> Add New UPI ID
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {savedUpiIds.length > 0 && !isAddingNew && (
                        <div className="mb-8">
                          <div className="flex flex-col mb-6">
                            <Label className="mb-2 text-slate-700 dark:text-slate-300 font-medium">
                              Select UPI ID
                            </Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {savedUpiIds.map((upi) => (
                                <motion.div
                                  key={upi.id}
                                  whileHover={{ scale: 1.01 }}
                                  className={`border rounded-lg p-4 cursor-pointer relative ${
                                    selectedUpiId === upi.id
                                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                      : "border-slate-200 dark:border-slate-700"
                                  }`}
                                  onClick={() => {
                                    setSelectedUpiId(upi.id);
                                    upiWithdrawOnlyForm.setValue(
                                      "upi_id",
                                      parseInt(upi.id)
                                    ); // assuming ID needs to be a number
                                  }}
                                >
                                  <div className="flex justify-between mb-2">
                                    <div className="flex items-center">
                                      <Smartphone
                                        size={18}
                                        className="text-indigo-600 mr-2"
                                      />
                                      <span className="font-medium">
                                        {upi?.upi_provider}
                                      </span>
                                      {upi.is_default && (
                                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (!upi.is_default) {
                                            setDefaultUpiId(upi.id);
                                          }
                                        }}
                                        className="h-8 w-8 p-0"
                                        title={
                                          upi.is_default
                                            ? "Default UPI"
                                            : "Set as Default"
                                        }
                                      >
                                        {upi.is_default ? (
                                          <Check
                                            size={16}
                                            className="text-green-600"
                                          />
                                        ) : (
                                          <span className="w-4 h-4 rounded-full border border-gray-400 inline-block" />
                                        )}
                                      </Button>

                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Trash2
                                              size={16}
                                              className="text-red-600"
                                            />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Delete UPI ID
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete
                                              this UPI ID? This action cannot be
                                              undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>
                                              Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() =>
                                                deleteUpiId(upi.id)
                                              }
                                              className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-300 text-sm">
                                    <div>UPI ID: {upi?.upi_id}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {isAddingNew ? (
                        <Form {...upiAddForm}>
                          <form
                            onSubmit={upiAddForm.handleSubmit((values) => {
                              // console.log(values);
                              addUpiAccount({
                                upi_id: values.upiId,
                                upi_provider: values.upiProvider,
                                is_default: savedUpiIds.length === 0,
                              });
                            })}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField
                                control={upiAddForm.control}
                                name="upiId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>UPI ID</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="example@upi"
                                        {...field}
                                        className="border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:border-indigo-600"
                                      />
                                    </FormControl>
                                    <FormDescription>
                                      Enter your UPI ID (e.g. yourname@okaxis)
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={upiAddForm.control}
                                name="upiProvider"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>UPI Provider</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:border-indigo-600">
                                          <SelectValue placeholder="Select UPI App" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {upiProviders.map((provider) => (
                                          <SelectItem
                                            key={provider.value}
                                            value={provider.value}
                                          >
                                            {provider.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-between items-center pt-4">
                              {savedUpiIds.length > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setIsAddingNew(false)}
                                >
                                  Cancel
                                </Button>
                              )}
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="ml-auto"
                              >
                                <Button
                                  type="submit"
                                  disabled={isLoading}
                                  className="bg-green-600 hover:bg-green-700 text-white py-6 px-8 text-lg font-medium"
                                >
                                  {isLoading ? (
                                    <div className="flex items-center">
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                          ease: "linear",
                                        }}
                                        className="mr-2"
                                      >
                                        <Clock size={16} />
                                      </motion.div>
                                      Adding...
                                    </div>
                                  ) : (
                                    "Add UPI Account"
                                  )}
                                </Button>
                              </motion.div>
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <Form {...upiWithdrawOnlyForm}>
                          <form
                            onSubmit={upiWithdrawOnlyForm.handleSubmit(
                              onUpiWithdrawSubmit
                            )}
                            className="space-y-6"
                          >
                            <FormField
                              control={upiWithdrawOnlyForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">
                                    Amount (₹)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={500}
                                      max={25000}
                                      {...field}
                                      className="border-slate-300 dark:border-slate-700 focus:ring-indigo-600 focus:border-indigo-600"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Min: ₹500, Max: ₹25,000. Available:{" "}
                                    <span className="font-semibold">
                                      {formatCurrency(walletBalance)}
                                    </span>
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end pt-4">
                              <Button
                                type="submit"
                                disabled={
                                  isLoading ||
                                  walletBalance < 500 ||
                                  !selectedUpiId
                                }
                                className="bg-indigo-600 hover:bg-indigo-700 text-white py-6 px-8 text-lg font-medium"
                              >
                                {isLoading ? (
                                  <div className="flex items-center">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                      className="mr-2"
                                    >
                                      <Clock size={16} />
                                    </motion.div>
                                    Processing...
                                  </div>
                                ) : (
                                  "Withdraw via UPI"
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </PageWrapper>
      </div>
    </div>
  );
}
