import React, { useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginContext, { LoginContextType } from "../context/Login/LoginContext";
import LoadingContext from "../context/Loading/LoadingContext";

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children }: Props) => {
  const { loginState, token } = useContext<LoginContextType>(LoginContext);
  const { loading } = useContext(LoadingContext);
  const location = useLocation();

  if (token) {
    sessionStorage.setItem("previousPage", location.pathname);
  }
  // useEffect(() => {
  if (loading && !loginState) {
    // If loading and not logged in, navigate to the login page
    return <Navigate to={"/login"} />;
  }
  // }, [loading, loginState]);

  // Render children if no redirection is performed
  return <>{children}</>;
};

export default PrivateRoute;
