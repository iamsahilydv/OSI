// AllRoutes.tsx

import React, { useContext, useEffect } from "react";
import LoginContext from "../context/Login/LoginContext";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import PrivateRoute from "./PriveteRoute";
import Login from "../pages/Login";
import Network from "../pages/Network";
import Products from "../pages/Products";
import Members from "../pages/Members";
import Transactions from "../pages/Transactions";
import LoadingContext from "../context/Loading/LoadingContext";
import Orders from "../pages/Orders";

type Props = {};

const AllRoutes = (props: Props) => {
  const { loginState } = useContext(LoginContext);
  const { loading } = useContext(LoadingContext);
  const location = useLocation();
  const navigate = useNavigate();
  const previousPage = sessionStorage.getItem("previousPage");
  console.log(previousPage);

  function simulateBackButton() {
    window.history.back();
  }

  // useEffect(() => {
  //   if (!loginState && location.pathname !== "/login") {
  //     sessionStorage.setItem("redirectPath", location.pathname);
  //   }
  // }, [loginState, location.pathname]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path={"/network"}
        element={
          <PrivateRoute>
            <Network />
          </PrivateRoute>
        }
      />
      <Route
        path={"/product/:id"}
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path={"/members/:id"}
        element={
          <PrivateRoute>
            <Members />
          </PrivateRoute>
        }
      />
      <Route
        path={"/orders/:id"}
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path={"/transactions/:id"}
        element={
          <PrivateRoute>
            <Transactions />
          </PrivateRoute>
        }
      />
      {/* <Route path="/login" element={<>{handleLoginRoute()}</>} /> */}
      <Route
        path="/login"
        element={
          loginState && previousPage ? (
            <Navigate to={previousPage} />
          ) : (
            <Login />
          )
        }
      />
    </Routes>
  );
};

export default AllRoutes;
