import { Box, Flex } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import NetworkMainComponent from "../Components/NetworkPage/NetworkMainComponent";
import Footer from "../Components/Footer/Footer";
import { allUsers } from "../Components/CommonFunction";
import LoadingContext from "../context/Loading/LoadingContext";

type Props = {};

const Network = (props: Props) => {
  const [users, setUsers]: any = useState([]);
  const { loading, setLoading } = useContext(LoadingContext);
  const [apiCall, setApiCall] = useState(false);
  const user = async () => {
    let res = await allUsers(setLoading);
    setUsers(res);
  };
  useEffect(() => {
    user();
    console.log(users, "users");
  }, []);
  document.title = `Network ShoppingBoom`;
  return (
    <Flex
      // bg={""}
      // bgImage={
      //   "https://plus.unsplash.com/premium_photo-1671570756033-97f3cd4e9cb5?auto=format&fit=crop&q=60&w=900&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BsYXNoJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D"
      // }
      // bgRepeat={"no-repeat"}
      minH={"100vh"}
      minW={"100vw"}
      // backgroundSize={"cover"}
    >
      <Box w={"20%"} border={"1px solid red"} p={2}>
        <Sidebar />
      </Box>
      <Box w={"80%"}>
        <Navbar scrollTop={true} />
        <Box overflow={"hidden"} h={"85vh"}>
          <NetworkMainComponent
            users={users}
            loading={loading}
            text={"Users"}
            apiCall={apiCall}
            setApiCall={setApiCall}
          />
        </Box>
        <Footer />
      </Box>
    </Flex>
  );
};

export default Network;
