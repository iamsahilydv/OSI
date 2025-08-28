"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageWrapper from "@/components/layout/PageWrapper";
import Sidebar from "@/components/layout/Sidebar";
import {
  Copy,
  Share2,
  UserPlus,
  Users,
  // BadgeIndian,
  Award,
  TrendingUp,
  BadgeInfo,
} from "lucide-react";
import { copyToClipboard, formatDate } from "@/utils/helpers";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import api from "@/services/api";
import Cookies from "js-cookie";

// Mock referral data
const mockReferrals = [
  {
    id: "ref1",
    name: "Rahul Singh",
    email: "rahul.singh@example.com",
    joinDate: new Date(2023, 5, 15),
    status: "active",
    purchases: 3,
    earnings: 450,
  },
  {
    id: "ref2",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    joinDate: new Date(2023, 7, 22),
    status: "active",
    purchases: 5,
    earnings: 750,
  },
  {
    id: "ref3",
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    joinDate: new Date(2023, 9, 10),
    status: "inactive",
    purchases: 1,
    earnings: 150,
  },
  {
    id: "ref4",
    name: "Sneha Verma",
    email: "sneha.verma@example.com",
    joinDate: new Date(2023, 11, 5),
    status: "active",
    purchases: 2,
    earnings: 300,
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

// Confetti animation for copies and shares
const ConfettiEffect = ({ isActive }: any) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const size = Math.random() * 8 + 4;
        const color = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3"][
          Math.floor(Math.random() * 5)
        ];
        const left = `${Math.random() * 100}%`;
        const top = `${Math.random() * 100}%`;
        const deg = Math.random() * 360;
        const delay = Math.random() * 0.5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              left,
              top,
              rotate: deg,
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 200],
              opacity: [1, 0],
              rotate: [deg, deg + 360],
            }}
            transition={{
              duration: 1 + Math.random(),
              delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default function ReferralPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [referedUser, setReferedUser] = useState<any[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const token = Cookies.get("usrTkn");
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  // console.log(config);
  // Mock referral ID and referral link
  const referralId = user?.referId;
  const referralLink = `https://onestepindia.in/auth/register?ref=${referralId}`;

  const getReferUser = async () => {
    let response = await api.get(`/referedUser`, config);
    // console.log(response);
    setReferedUser(response.data.data);
  };

  useEffect(() => {
    getReferUser();
  }, []);
  // Mock stats
  const stats = {
    totalReferrals: referedUser?.length,
    activeReferrals: referedUser.filter((r) => r.status === "active").length,
    totalEarnings: referedUser.reduce((acc, curr) => acc + curr.earnings, 0),
  };

  // Handle copy to clipboard with animation
  const handleCopy = async (text: string, message: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);

      toast({
        title: "Copied!",
        description: message,
        variant: "success",
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join OneStepIndia.in",
          text: "Join OneStepIndia.in using my referral link and earn rewards!",
          url: referralLink,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);

        toast({
          title: "Shared!",
          description: "Your referral link has been shared.",
          variant: "success",
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      handleCopy(referralLink, "Referral link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* <TopNavbar /> */}
      <div className="flex flex-1 gap-2">
        <Sidebar />
        <PageWrapper
          title="Referral Program"
          description="Invite friends and earn commission"
          className="w-full"
        >
          <motion.div
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={fadeIn}
            className="relative"
          >
            <ConfettiEffect isActive={showConfetti} />

            <Tabs
              defaultValue="overview"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <div className="relative mb-8">
                <TabsList className="w-full max-w-md bg-white dark:bg-slate-800 p-1 shadow-md rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="referrals"
                    className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    My Referrals
                  </TabsTrigger>
                  <TabsTrigger
                    value="earnings"
                    className="flex-1 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300"
                  >
                    Earnings
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview">
                {/* Referral Stats */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                  <motion.div variants={cardVariant}>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 overflow-hidden">
                      {/* <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div> */}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          Total Referrals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-slate-800 dark:text-white">
                          {stats.totalReferrals}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariant}>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 overflow-hidden">
                      {/* <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div> */}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <Award className="h-4 w-4 mr-2 text-emerald-500" />
                          Active Referrals
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                          {stats.activeReferrals}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariant}>
                    <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-800 overflow-hidden">
                      {/* <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div> */}
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-2 text-amber-500" />
                          Total Earnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                          ₹{stats.totalEarnings}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Referral ID and Link */}
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                  className="mb-8"
                >
                  <Card className="border-none shadow-lg bg-white dark:bg-slate-800 dark:text-white overflow-hidden">
                    {/* <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div> */}
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center">
                        <BadgeInfo className="h-5 w-5 mr-2 text-primary" />
                        Your Referral Details
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Share your referral link or ID to invite friends
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="relative">
                        <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          Your Referral ID
                        </div>
                        <div className="flex">
                          <Input
                            value={referralId}
                            readOnly
                            className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-2 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                            onClick={() =>
                              handleCopy(
                                referralId ?? "",
                                "Referral ID copied to clipboard!"
                              )
                            }
                          >
                            <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                          Your Referral Link
                        </div>
                        <div className="flex">
                          <Input
                            value={referralLink}
                            readOnly
                            className="bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="ml-2 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
                            onClick={() =>
                              handleCopy(
                                referralLink,
                                "Referral link copied to clipboard!"
                              )
                            }
                          >
                            <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 flex flex-col sm:flex-row gap-4">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() =>
                            handleCopy(
                              referralLink,
                              "Referral link copied to clipboard!"
                            )
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-primary text-primary hover:bg-primary/10 shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={handleShare}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Link
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* How It Works */}
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-none shadow-lg bg-white dark:bg-slate-800 dark:text-white overflow-hidden">
                    {/* <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500"></div> */}
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-800 dark:text-white">
                        How It Works
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="space-y-8"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                      >
                        <motion.div
                          className="flex items-start"
                          variants={cardVariant}
                          whileHover={{ x: 5 }}
                        >
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full mr-4 shadow-md">
                            <UserPlus className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-slate-800 dark:text-white">
                              Invite Friends
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                              Share your referral link with friends, family, and
                              others.
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-start"
                          variants={cardVariant}
                          whileHover={{ x: 5 }}
                        >
                          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-full mr-4 shadow-md">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-slate-800 dark:text-white">
                              They Join & Shop
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                              When they sign up using your link and make
                              purchases, you earn.
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="flex items-start"
                          variants={cardVariant}
                          whileHover={{ x: 5 }}
                        >
                          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-full mr-4 shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-6 w-6 text-white"
                            >
                              <path d="M12 2v6a2 2 0 0 0 2 2h6" />
                              <path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
                              <path d="m18 14 2 2 4-4" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-medium text-lg text-slate-800 dark:text-white">
                              Earn Commission
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300">
                              You earn up to 10% commission on their purchases.
                              Commissions are added to your wallet.
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="referrals">
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-none shadow-lg bg-white dark:bg-slate-800 dark:text-white overflow-hidden">
                    {/* <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div> */}
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        Your Referrals
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        People who joined using your referral link
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {referedUser.length > 0 ? (
                        <div className="overflow-x-auto">
                          <motion.table
                            className="w-full border-collapse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                          >
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                  User
                                </th>
                                <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                  Join Date
                                </th>
                                <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                  Status
                                </th>
                                <th className="text-left py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                  Purchases
                                </th>
                                <th className="text-right py-3 px-4 text-slate-500 dark:text-slate-400 font-medium">
                                  Earnings
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {referedUser.map((referral, index) => (
                                <motion.tr
                                  key={referral.id}
                                  className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <td className="py-4 px-4">
                                    <div className="flex items-center">
                                      <Avatar className="h-10 w-10 mr-3 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-white">
                                          {referral.name
                                            .split(" ")
                                            .map((n: string) => n[0])
                                            .join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium text-slate-800 dark:text-white">
                                          {referral.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                          {referral.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                                    {formatDate(referral.created_at)}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span
                                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                                        referral.status === "active"
                                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                          : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300"
                                      }`}
                                    >
                                      {referral.status === "active"
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                                    {referral.purchases}
                                  </td>
                                  <td className="py-4 px-4 text-right font-medium text-amber-600 dark:text-amber-400">
                                    ₹{referral.earnings}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </motion.table>
                        </div>
                      ) : (
                        <motion.div
                          className="text-center py-12"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 100 }}
                        >
                          <div className="bg-slate-100 dark:bg-slate-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                          </div>
                          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
                            You haven't referred anyone yet. Share your referral
                            link to start earning!
                          </p>
                          <Button
                            className="mt-6 bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => setActiveTab("overview")}
                          >
                            Get Your Referral Link
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="earnings">
                <motion.div
                  variants={cardVariant}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="border-none shadow-lg bg-white dark:bg-slate-800 dark:text-white overflow-hidden">
                    {/* <div className="absolute top-0 h-1 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div> */}
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Earnings History
                      </CardTitle>
                      <CardDescription className="text-slate-500 dark:text-slate-400">
                        Your commission earnings from referrals
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                      >
                        <div className="bg-slate-100 dark:bg-slate-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <TrendingUp className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                          Earnings details will be available soon.
                        </p>
                        <Button
                          className="mt-6 bg-primary hover:bg-primary/80 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          onClick={() => setActiveTab("overview")}
                        >
                          Return to Overview
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </PageWrapper>
      </div>
    </div>
  );
}
