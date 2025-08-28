import { Box, Flex } from "@chakra-ui/react";
import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import AddProduct from "../Components/ProductsPage/AddProduct";
import AllProducts from "../Components/ProductsPage/AllProducts";
import BlockedProducts from "../Components/ProductsPage/BlockedProducts";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer/Footer";
import { allUsers, getCategory } from "../Components/CommonFunction";
import LoadingContext from "../context/Loading/LoadingContext";
import AllMembers from "../Components/Members/AllMembers";
import SubscribedMembers from "../Components/Members/SubscribedMembers";
import ActiveMembers from "../Components/Members/ActiveMembers";
import InactiveMembers from "../Components/Members/InactiveMembers";

type Props = {};

const Members = (props: Props) => {
  const [users, setUsers] = useState([]);
  const { loading, setLoading } = useContext(LoadingContext);
  const [apiCall, setApiCall] = useState(false);
  const params = useParams();
  console.log(params);
  const getData = async () => {
    let res = await allUsers(setLoading);
    setUsers(res);
  };
  useEffect(() => {
    getData();
  }, [apiCall]);

  document.title = `Members ShoppingBoom`;
  return (
    <Flex minH={"100vh"} minW={"100vw"}>
      <Box w={"20%"} p={2}>
        <Sidebar />
      </Box>
      <Box w={"80%"}>
        <Navbar scrollTop={true} />
        <Box overflow={"hidden"} h={"85vh"}>
          {params.id === "allMembers" ? (
            <AllMembers
              users={users}
              apiCall={apiCall}
              setApiCall={setApiCall}
            />
          ) : params.id === "allSubscribed" ? (
            <SubscribedMembers
              users={users}
              apiCall={apiCall}
              setApiCall={setApiCall}
            />
          ) : params.id === "allActive" ? (
            <ActiveMembers
              users={users}
              apiCall={apiCall}
              setApiCall={setApiCall}
            />
          ) : params.id === "allInActive" ? (
            <InactiveMembers
              users={users}
              apiCall={apiCall}
              setApiCall={setApiCall}
            />
          ) : (
            <Box>Error Page</Box>
          )}
        </Box>
        <Footer />
      </Box>
    </Flex>
  );
};

export default Members;
