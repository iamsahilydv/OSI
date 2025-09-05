"use client";

import api from "@/services/api";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import Cookies from "js-cookie";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface User {
  KYC: number;
  created_at: string;
  email: string;
  gender: string;
  id: number;
  isUserEnabled: number;
  leftCount: number;
  mobile: string;
  name: string;
  pancard: string;
  password: string;
  position: string;
  referId: string;
  referby: string;
  rightCount: number;
  role: string;
  status: string;
  subscription: string;
  today_income: number;
  total_income: number;
  total_withdraw: number;
  wallet: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  cartCount: number;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  login: (email: string, password: string) => Promise<void | false | true>;
  preRegister: (email: string) => Promise<{ status: boolean } | undefined>;
  register: (data: {
    name: string;
    email: string;
    otp: string;
    gender: string;
    mobile: string;
    password: string;
    referby: string;
  }) => Promise<{ status: boolean } | undefined>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  config: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const tokenValidatedRef = useRef(false); // prevents duplicate validation
  const router = useRouter();
  const [token, setToken] = useState("");

  const validateToken = async (token: string) => {
    if (tokenValidatedRef.current) return true; // Already validated once this session

    try {
      const res = await api.post(`/verify-token`, { token });
      if (res.status === 200 && res.data.success === true) {
        setCartCount(res.data.cartCount);
        setUser(res.data.Data[0]);
        setIsLoggedIn(true);
        tokenValidatedRef.current = true;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = Cookies.get("usrTkn");
    setToken(storedToken || "");

    const initializeAuth = async () => {
      if (storedToken) {
        const isValid = await validateToken(storedToken);
        if (!isValid) {
          Cookies.remove("usrTkn");
          localStorage.removeItem("user");
          setUser(null);
        }
      } else if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);
  const config = React.useMemo(() => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/login`, { email, password });
      if (response.status !== 200 || !response.data.token) {
        return false;
      }

      Cookies.set("usrTkn", response.data.token, {
        expires: 7,
        secure: true,
      });

      const isValid = await validateToken(response.data.token);

      return isValid;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const preRegister = async (email: string) => {
    let body = { email: email };
    try {
      let response = await api.post(`/pre_register`, body);
      // console.log(response);
      if (!response.data.success) {
        toast({
          title: "Failed",
          description: response.data.message || "Something went wrong.",
          variant: "destructive",
        });
        throw new Error(response.data.message);
      }
      return { status: true, response: response };
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Could not send OTP. Please try again.";

      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    otp: string;
    gender: string;
    mobile: string;
    password: string;
    referby: string;
  }) => {
    try {
      setIsLoading(true);

      const response = await api.post("/register", data);

      // Check success by HTTP status
      if (response.data.status === 201) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
          variant: "success",
        });

        // Auto-login if token is sent (optional)
        if (response.data.token) {
          Cookies.set("usrTkn", response.data.token, {
            expires: 7,
            secure: true,
          });
          await validateToken(response.data.token);
        }

        return { status: true, response };
      } else {
        // Catch all non-successful registration responses
        toast({
          title: "Registration Failed",
          description: response.data.message || "Something went wrong.",
          variant: "warning",
        });
        return { status: false, response };
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during registration.";

      // Handle specific status codes
      if (
        status === 400 ||
        status === 403 ||
        status === 409 ||
        status === 401
      ) {
        toast({
          title: "Registration Error",
          description: msg,
          variant: "warning",
        });
      } else {
        toast({
          title: "Server Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      }

      console.error("Registration error:", error);
      return { status: false, response: error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCartCount(0);
    localStorage.removeItem("user");
    Cookies.remove("usrTkn");
    tokenValidatedRef.current = false;
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "info",
    });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        preRegister,
        logout,
        updateProfile,
        isLoggedIn,
        setIsLoggedIn,
        cartCount,
        setCartCount,
        config,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
