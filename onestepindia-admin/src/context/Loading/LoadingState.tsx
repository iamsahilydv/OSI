import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { authInstance } from "../../Axios/Axios";
import LoadingContext from "./LoadingContext";

type Props = {
  children: React.ReactNode;
};

const LoadingState = (props: Props) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {props.children}
    </LoadingContext.Provider>
  );
};

export default LoadingState;
