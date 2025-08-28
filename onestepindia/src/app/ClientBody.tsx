"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import TopNavbar from "@/components/layout/TopNavbar";
import Footer from "@/components/layout/Footer";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const dashboardRoutes = [
    "/dashboard",
    "/referral",
    "/wallet",
    "/orders",
    "/profile",
  ];

  const hideNavbar = dashboardRoutes.includes(pathname);

  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  return (
    <AuthProvider>
      <div className="antialiased flex flex-col min-h-screen">
        {!hideNavbar && <TopNavbar />}
        <main className="flex-grow">{children}</main>
        <Footer />
        <Toaster />
      </div>
    </AuthProvider>
  );
}
