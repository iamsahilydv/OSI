import { Box } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import LoadingContext from "../../context/Loading/LoadingContext";
import NetworkMainComponent from "../NetworkPage/NetworkMainComponent";

type Props = {
  users: any;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};

const InactiveMembers = ({ users, apiCall, setApiCall }: Props) => {
  const { loading } = useContext(LoadingContext);
  const [user, setUser] = useState([]);
  useEffect(() => {
    setUser(
      users.filter((el: any) => {
        if (el.status === "inactive") {
          return el;
        }
      })
    );
  }, [users]);
  return (
    <Box  h={"100%"}>
      <NetworkMainComponent
        users={user}
        loading={loading}
        text={"InActive Users"}
        apiCall={apiCall}
        setApiCall={setApiCall}
      />
    </Box>
  );
};

export default InactiveMembers;
