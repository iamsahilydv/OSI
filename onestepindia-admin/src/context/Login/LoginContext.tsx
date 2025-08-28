import { createContext } from "react";

export type LoginContextType = {
  loginState: boolean | undefined;
  setLoginState: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: any;
  token: string;
  // cartCount: number;
  // setCartCount: React.Dispatch<React.SetStateAction<number>>;
};

const LoginContext = createContext<LoginContextType>({
  loginState: false,
  setLoginState: () => {},
  currentUser: {},
  token: "",
  // cartCount: 0,
  // setCartCount: () => {},
});

export default LoginContext;
