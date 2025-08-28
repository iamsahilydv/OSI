import { Box } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import NetworkMainComponent from "../NetworkPage/NetworkMainComponent";
import LoadingContext from "../../context/Loading/LoadingContext";

type Props = {
  users: any;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};

const SubscribedMembers = ({ users, apiCall, setApiCall }: Props) => {
  const [user, setuser] = useState([]);
  useEffect(() => {
    setuser(
      users.filter((el: any) => {
        if (el.subscription == true) {
          return el;
        }
      })
    );
  }, [users]);

  const { loading } = useContext(LoadingContext);
  return (
    <Box h={"100%"}>
      <NetworkMainComponent
        users={user}
        loading={loading}
        text={"Subscribed Users"}
        apiCall={apiCall}
        setApiCall={setApiCall}
      />
    </Box>
  );
};

export default SubscribedMembers;
