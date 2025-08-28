"use client";

import { useState, Suspense, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TopNavbar from "@/components/layout/TopNavbar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Loader2,
  UserPlus,
  Mail,
  User,
  Lock,
  Phone,
  CreditCard,
  Users,
  ArrowRight,
  ArrowLeft,
  Shield,
  CheckCircle,
} from "lucide-react";
import api from "@/services/api";

// Email verification schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Complete registration schema
const registrationSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z
      .string()
      .min(4, "OTP must be at least 4 digits")
      .max(6, "OTP must be at most 6 digits"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    mobile: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .regex(/^\d+$/, "Mobile number must contain only digits"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select a gender",
    }),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string(),
    // pancard: z.string().optional(),
    referby: z.string().min(1, "Referral ID is required"),
    // position: z.enum(["left", "right"], {
    //   required_error: "Please select a position",
    // }),
    // role: z.enum(["user", "admin", "merchant", "superAdmin"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

// Email Step Component - Memoized to prevent re-renders
const EmailStep = memo(
  ({
    emailForm,
    onEmailSubmit,
    isLoading,
  }: {
    emailForm: any;
    onEmailSubmit: (values: EmailFormValues) => Promise<void>;
    isLoading: boolean;
  }) => (
    <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-lg border">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Get Started</h2>
        <p className="mt-2 text-gray-600">
          Enter your email to begin registration
        </p>
      </div>

      <Form {...emailForm}>
        <form
          onSubmit={emailForm.handleSubmit(onEmailSubmit)}
          className="space-y-4"
        >
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                Proceed
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
);

EmailStep.displayName = "EmailStep";

// Registration Details Step Component - Memoized to prevent re-renders
const DetailsStep = memo(
  ({
    registrationForm,
    onRegistrationSubmit,
    isLoading,
    verifiedEmail,
    goBackToEmail,
  }: {
    registrationForm: any;
    onRegistrationSubmit: (values: RegistrationFormValues) => Promise<void>;
    isLoading: boolean;
    verifiedEmail: string;
    goBackToEmail: () => void;
  }) => (
    <div className="w-full max-w-2xl space-y-6 bg-white p-8 rounded-lg shadow-lg border">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-600 mb-4">
          <UserPlus className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Complete Registration
        </h2>
        <div className="mt-2 flex items-center justify-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <p className="text-gray-600">
            OTP sent to{" "}
            <span className="font-medium text-blue-600">{verifiedEmail}</span>
          </p>
        </div>
      </div>

      <Form {...registrationForm}>
        <form
          onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)}
          className="space-y-4"
        >
          {/* OTP Verification */}
          <FormField
            control={registrationForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter OTP from email"
                      {...field}
                      className="pl-10"
                      maxLength={6}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={registrationForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registrationForm.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="Enter mobile number"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Password Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={registrationForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={registrationForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Referral and Position */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={registrationForm.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registrationForm.control}
              name="referby"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referred By</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter referrer ID"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <FormField
              control={registrationForm.control}
              name="pancard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Card (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter PAN card number"
                        {...field}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* <FormField
              control={registrationForm.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </div>

          {/* <FormField
            control={registrationForm.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="merchant">Merchant</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superAdmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={goBackToEmail}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
);

DetailsStep.displayName = "DetailsStep";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { register, preRegister, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "details">("email");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Get referral ID from URL if present
  const refId = searchParams.get("ref") || "";

  // Email form - Initialize once
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Registration form - Initialize once
  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      otp: "",
      name: "",
      mobile: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
      // pancard: "",
      referby: refId,
      // position: undefined,
      // role: "user",
    },
  });

  // Handle email submission and OTP generation - useCallback to prevent re-creation
  const onEmailSubmit = useCallback(
    async (values: EmailFormValues) => {
      try {
        setIsLoading(true);
        let response: { status: boolean } | undefined = await preRegister(
          values.email
        );

        if (response && response.status) {
          registrationForm.setValue("email", values.email);
          setVerifiedEmail(values.email);
          toast({
            title: "OTP Sent",
            description: "Please check your email for the verification code",
            variant: "success",
          });
          setStep("details");
        } else {
          registrationForm.setValue("email", "");
          setVerifiedEmail("");
        }
      } catch (error: any) {
      } finally {
        setIsLoading(false);
      }
    },
    [registrationForm, toast]
  );

  // Handle complete registration - useCallback to prevent re-creation
  const onRegistrationSubmit = useCallback(
    async (values: RegistrationFormValues) => {
      // console.log("hie") ;
      try {
        setIsLoading(true);

        const registrationData = {
          email: values.email,
          otp: values.otp,
          name: values.name,
          mobile: values.mobile,
          gender: values.gender,
          password: values.password,
          // pancard: values.pancard || "0",
          referby: values.referby,
          // position: values.position,
          // role: values.role,
        };

        // console.log(registrationData);
        let response: { status: boolean } | undefined = await register(
          registrationData
        );
        if (response && response.status) {
          router.push("/");
          // console.log(user);
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        // toast({
        //   title: "Registration Failed",
        //   description:
        //     error.message ||
        //     "An error occurred during registration. Please try again.",
        //   variant: "destructive",
        // });
      } finally {
        setIsLoading(false);
      }
    },
    [register, toast, router]
  );

  // Go back to email step - useCallback to prevent re-creation
  const goBackToEmail = useCallback(() => {
    setStep("email");
    setVerifiedEmail("");
    registrationForm.reset();
  }, [registrationForm]);

  return step === "email" ? (
    <EmailStep
      emailForm={emailForm}
      onEmailSubmit={onEmailSubmit}
      isLoading={isLoading}
    />
  ) : (
    <DetailsStep
      registrationForm={registrationForm}
      onRegistrationSubmit={onRegistrationSubmit}
      isLoading={isLoading}
      verifiedEmail={verifiedEmail}
      goBackToEmail={goBackToEmail}
    />
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* <TopNavbar /> */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
