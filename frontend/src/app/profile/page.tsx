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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageWrapper from "@/components/layout/PageWrapper";
import TopNavbar from "@/components/layout/TopNavbar";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Camera, Check, X, Lock } from "lucide-react";

// Schema
const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    mobile: z.string().optional(),
    address: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasPasswords =
        data.currentPassword || data.newPassword || data.confirmPassword;
      if (hasPasswords) {
        return data.currentPassword && data.newPassword && data.confirmPassword;
      }
      return true;
    },
    {
      message: "All password fields are required to change password",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobile: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        mobile: user.mobile || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await updateProfile({
        name: values.name,
        email: values.email,
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
          toast({
            title: "Photo Selected",
            description: "Click Save Changes to update your profile picture",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordUpdate = () => {
    const currentPassword = form.getValues("currentPassword");
    const newPassword = form.getValues("newPassword");
    const confirmPassword = form.getValues("confirmPassword");

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password don't match",
        variant: "destructive",
      });
      return;
    }

    // Simulating password update
    setIsLoading(true);
    setTimeout(() => {
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
      setIsLoading(false);
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* <TopNavbar /> */}
      <div className="flex flex-1 gap-2">
        <Sidebar />
        <PageWrapper
          title="Profile Settings"
          description="Manage your account information"
          className="w-full"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Avatar */}
            <motion.div variants={fadeIn}>
              <Card className="md:col-span-1 overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Camera size={20} />
                    Profile Picture
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-6 pb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Avatar className="h-32 w-32 mb-6 ring-4 ring-purple-200 dark:ring-purple-900 shadow-md">
                      <AvatarImage
                        src={avatarPreview || ""}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="text-2xl bg-gradient-to-r from-purple-400 to-indigo-500 text-white">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>

                  <div className="space-y-3 w-full">
                    <motion.div whileTap={{ scale: 0.97 }}>
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer w-full py-2 px-4 text-center font-medium rounded-md border-2 border-purple-500 bg-white text-purple-700 hover:bg-purple-50 dark:bg-gray-800 dark:text-purple-300 dark:hover:bg-gray-700 inline-block transition-all duration-200"
                      >
                        Upload Photo
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </motion.div>
                    {avatarPreview && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 border-red-400 text-red-500 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-gray-800 gap-2"
                          onClick={() => setAvatarPreview(null)}
                        >
                          <X size={16} /> Remove Photo
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Personal Info */}
            <motion.div variants={fadeIn} className="md:col-span-2">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  Full Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  Email
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  Mobile Number
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="tel"
                                    placeholder="+91 XXXXXXXXXX"
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className={`mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                            profileSuccess
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }`}
                        >
                          {isLoading ? (
                            "Saving..."
                          ) : profileSuccess ? (
                            <span className="flex items-center gap-2">
                              <Check size={16} /> Saved!
                            </span>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Password Change */}
            <motion.div variants={fadeIn} className="md:col-span-3">
              <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Lock size={20} />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  Current Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  New Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        <motion.div
                          whileHover={{ y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">
                                  Confirm Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-2 focus:ring-2 focus:ring-amber-400 focus:border-amber-500"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-500" />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      </div>

                      <motion.div whileTap={{ scale: 0.97 }}>
                        <Button
                          type="button"
                          className={`bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                            passwordSuccess
                              ? "bg-green-600 hover:bg-green-700"
                              : ""
                          }`}
                          onClick={handlePasswordUpdate}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            "Updating..."
                          ) : passwordSuccess ? (
                            <span className="flex items-center gap-2">
                              <Check size={16} /> Password Updated!
                            </span>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </motion.div>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </PageWrapper>
      </div>
    </div>
  );
}
