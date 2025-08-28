import { Box } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import NetworkMainComponent from "../NetworkPage/NetworkMainComponent";
import LoadingContext from "../../context/Loading/LoadingContext";

type Props = {
  users: any;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};

const ActiveMembers = ({ users, apiCall, setApiCall }: Props) => {
  const { loading } = useContext(LoadingContext);
  const [user, setUser] = useState([]);
  useEffect(() => {
    setUser(
      users.filter((el: any) => {
        if (el.status === "active") {
          return el;
        }
      })
    );
  }, [users]);
  return (
    <Box h={"100%"}>
      <NetworkMainComponent
        users={user}
        loading={loading}
        text={"Active Users"}
        apiCall={apiCall}
        setApiCall={setApiCall}
      />
    </Box>
  );
};

export default ActiveMembers;
