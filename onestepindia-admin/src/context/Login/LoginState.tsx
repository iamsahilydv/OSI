import React, { useState, useEffect, useContext } from "react";
import LoginContext from "./LoginContext";
import { useCookies } from "react-cookie";
import { authInstance } from "../../Axios/Axios";
import LoadingContext from "../Loading/LoadingContext";

type Props = {
  children: React.ReactNode;
};

let currentUser: any = [];
// let cartCount = 0;

const tokenValid = async (token: string, setCartCount: any) => {
  try {
    let res = await authInstance.post(`/verify-token`, { token: token });
    if (res.status === 200 && res.data.success === true) {
      console.log(res.data.Data[0].role);
      if (
        res.data.Data[0].role === "superAdmin" ||
        res.data.Data[0].role === "admin"
      ) {
        // setCartCount(res.data.cartCount);
        currentUser = res.data.Data[0];
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const LoginState = (props: Props) => {
  const [loginState, setLoginState] = useState<boolean>(false); // Changed to boolean
  const [cookies] = useCookies(); // Removed 'setCookie' and 'removeCookie'
  const [cartCount, setCartCount] = useState(0);
  const { loading, setLoading } = useContext(LoadingContext);
  let token = cookies.tAdmin;
  console.log(`loginState in loginState is ${loginState}`);

  const fetchLoginState = async () => {
    setLoading(true); // Set loading to true before making the request

    if (token) {
      try {
        const isValid = await tokenValid(token, setCartCount);
        console.log(`isValid is ${isValid}`);
        if (isValid) {
          setLoginState(isValid);
        } else {
          setLoginState(false);
        }
      } catch (error) {
        console.error("Error checking token validity:", error);
        setLoginState(false);
      }
    } else {
      setLoginState(false);
    }
  };

  useEffect(() => {
    fetchLoginState();
  }, [token]);

  return (
    <LoginContext.Provider
      value={{
        loginState,
        setLoginState,
        currentUser,
        token,
        // cartCount,
        // setCartCount,
      }}
    >
      {props.children}
    </LoginContext.Provider>
  );
};

export default LoginState;
