"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  Wallet,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const TopNavbar = () => {
  const { isLoggedIn, logout, user, cartCount } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    // console.log("Logging out...");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">OneStepIndia</span>
          <span className="hidden text-sm text-muted-foreground md:inline">
            .in
          </span>
        </Link>

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 mx-8">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products, brands and more"
              className="w-full pl-10 bg-secondary/50"
            />
          </div>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {/* Profile Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    {user?.name || "Profile"}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>
                    {user?.name || "My Account"}
                    {user?.email && (
                      <p className="text-xs text-muted-foreground font-normal">
                        {user.email}
                      </p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wallet" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referral" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Referral
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Cart Button with Badge */}
              <Button variant="ghost" size="sm" asChild className="relative">
                <Link href="/cart" className="flex items-center">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="ml-2">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 mt-6">
              {/* Mobile search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10"
                />
              </div>

              {/* Mobile navigation links */}
              <nav className="flex flex-col gap-4">
                <Link href="/" className="nav-link">
                  Home
                </Link>
                <Link href="/shop" className="nav-link">
                  Shop
                </Link>
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2">
                      <p className="font-medium">{user?.name || "Account"}</p>
                      {user?.email && (
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                    <Link href="/dashboard" className="nav-link">
                      Dashboard
                    </Link>
                    <Link href="/profile" className="nav-link">
                      Profile
                    </Link>
                    <Link href="/referral" className="nav-link">
                      Referral
                    </Link>
                    <Link href="/wallet" className="nav-link">
                      Wallet
                    </Link>
                    <Link href="/orders" className="nav-link">
                      Orders
                    </Link>
                    <Link href="/cart" className="nav-link flex items-center">
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {cartCount > 9 ? "9+" : cartCount}
                        </span>
                      )}
                    </Link>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="nav-link">
                      Login
                    </Link>
                    <Link href="/auth/register" className="nav-link">
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default TopNavbar;
