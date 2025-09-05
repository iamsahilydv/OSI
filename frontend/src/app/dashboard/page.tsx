"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageWrapper from "@/components/layout/PageWrapper";
import CustomCard from "@/components/layout/Card";
import {
  Home,
  ShoppingBag,
  Users,
  Wallet,
  ShoppingCart,
  User,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { motion } from "framer-motion";
import { ComponentType, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);

  // Mock stats data
  const stats = {
    walletBalance: user?.wallet,
    todayEarnings: user?.today_income,
    totalReferrals: (user?.leftCount ?? 0) + (user?.rightCount ?? 0),
    pendingOrders: 0,
  };

  // Navigation cards config
  const navigationCards = [
    // {
    //   title: "Shop",
    //   description: "Browse products",
    //   icon: ShoppingBag,
    //   href: "/shop",
    //   color: "bg-indigo-600",
    //   hoverColor: "hover:bg-indigo-700",
    // },
    {
      title: "Wallet",
      description: "Manage earnings",
      icon: Wallet,
      href: "/wallet",
      color: "bg-emerald-600",
      hoverColor: "hover:bg-emerald-700",
    },
    {
      title: "Referral",
      description: "Invite & earn",
      icon: Users,
      href: "/referral",
      color: "bg-amber-600",
      hoverColor: "hover:bg-amber-700",
    },
    {
      title: "Profile",
      description: "Update details",
      icon: User,
      href: "/profile",
      color: "bg-sky-600",
      hoverColor: "hover:bg-sky-700",
    },
    {
      title: "Orders",
      description: "Track purchases",
      icon: ShoppingCart,
      href: "/orders",
      color: "bg-rose-600",
      hoverColor: "hover:bg-rose-700",
    },
  ];

  // Activity items with colorful icons
  const activityItems = [
    {
      icon: ShoppingCart,
      title: "Order Placed",
      description: "You placed an order for 3 items",
      time: "2 hours ago",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      icon: Users,
      title: "New Referral",
      description: "Rahul Singh joined using your referral link",
      time: "Yesterday",
      iconColor: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      icon: Wallet,
      title: "Commission Earned",
      description: "You earned ₹120 from referral purchases",
      time: "2 days ago",
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  useEffect(() => {
    // Set loaded state to trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setRecLoading(true);
    setRecError(null);
    fetch(`/api/v1/users/${user.id}/dashboard-recommendations`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRecommendations(data.data);
        } else {
          setRecommendations([]);
        }
      })
      .catch(() => {
        setRecError("Failed to fetch recommendations");
        setRecommendations([]);
      })
      .finally(() => setRecLoading(false));
  }, [user?.id]);

  return (
    <PageWrapper
      title={`Welcome, ${user?.name || "User"}!`}
      description="Here's an overview of your account"
    >
      {/* Stats Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-blue-600 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(stats.walletBalance ?? 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <Calendar className="h-3 w-3 mr-1" /> Last updated today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-green-600 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(stats.todayEarnings ?? 0)}
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" /> +12% from
                yesterday
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-amber-600 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">
                {stats.totalReferrals}
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <Users className="h-3 w-3 mr-1 text-amber-600" /> 2 joined this
                week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-purple-600 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                {stats.pendingOrders}
              </div>
              <p className="text-xs text-gray-600 mt-1 flex items-center">
                <ShoppingCart className="h-3 w-3 mr-1 text-purple-600" /> 1
                shipping soon
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Navigation Cards */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Quick Actions
      </h2>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {navigationCards.map((card, index) => (
          <motion.div key={card.title} variants={itemVariants}>
            <CustomCardAnimated
              title={card.title}
              description={card.description}
              icon={card.icon}
              href={card.href}
              color={card.color}
              hoverColor={card.hoverColor}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Personalized Recommendations Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Recommended for You</h2>
        {recLoading ? (
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-48 h-64 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : recError ? (
          <div className="text-red-500">{recError}</div>
        ) : recommendations.length === 0 ? (
          <div className="text-muted-foreground">No recommendations found.</div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={`/product/${rec.id}`}
                className="w-48 min-w-[12rem] bg-white rounded-lg shadow hover:shadow-lg transition p-3 flex flex-col"
              >
                <div className="relative w-full h-40 bg-gray-50 rounded mb-2 overflow-hidden">
                  <Image
                    src={
                      rec.images?.[0] ||
                      "https://source.unsplash.com/random/400x400/?product"
                    }
                    alt={rec.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="font-medium truncate mb-1">{rec.name}</div>
                <div className="text-sm text-muted-foreground truncate mb-1">
                  {rec.brand}
                </div>
                <div className="text-primary font-bold text-lg">
                  ₹{rec.selling_price || rec.price || "-"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">
        Recent Activity
      </h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        <Card className="shadow-md border-t-4 border-indigo-500">
          <CardHeader>
            <CardTitle className="text-gray-800">Activity Feed</CardTitle>
            <CardDescription className="text-gray-600">
              Your recent actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityItems.map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-start"
                  variants={itemVariants}
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <div className={`${item.bgColor} p-3 rounded-full mr-4`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}
interface CustomCardAnimatedProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  color: string;
  hoverColor: string;
}
// Custom animated card component
function CustomCardAnimated({
  title,
  description,
  icon: Icon,
  href,
  color,
  hoverColor,
}: CustomCardAnimatedProps) {
  return (
    <motion.a
      href={href}
      className={`block rounded-lg shadow-md overflow-hidden ${hoverColor} transition-all duration-300 h-full`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex flex-col h-full">
        <div className={`${color} p-4 text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="p-4 bg-white flex-grow">
          <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
      </div>
    </motion.a>
  );
}
