"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Users,
  Wallet,
  ShoppingCart,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Mark that we're on the client side

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Only add event listener if window is available
    if (typeof window !== "undefined") {
      handleResize(); // run initially
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []); // Removed window.innerWidth from dependencies

  const isCurrentPath = (path: string) => pathname === path;

  const routes = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: Home,
    },
    {
      name: "Referral",
      path: "/referral",
      icon: Users,
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: Wallet,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  // Return null during SSR to avoid hydration mismatch
  if (!isClient) return null;

  return (
    <aside
      className={cn(
        "bg-card border-r h-screen sticky top-0 left-0 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <Link href={"/"}>
        <div className="flex items-center justify-center h-16 border-b">
          {!collapsed && (
            <span className="text-lg font-semibold text-primary">
              OneStepIndia
            </span>
          )}
          {collapsed && (
            <span className="text-lg font-semibold text-primary">OSI</span>
          )}
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {routes.map((route) => (
            <li key={route.path}>
              <Link
                href={route.path}
                className={cn(
                  "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "justify-start",
                  isCurrentPath(route.path)
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                <route.icon
                  className={cn("h-5 w-5", collapsed ? "" : "mr-3")}
                />
                {!collapsed && <span>{route.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "w-full mt-2 text-destructive hover:text-destructive/90",
            collapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          <LogOut className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
