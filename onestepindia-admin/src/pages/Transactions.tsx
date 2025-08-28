import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer/Footer";
import AllTransactions from "../Components/Transactions/AllTransactions";
import Withdraw from "../Components/Transactions/Withdraw";
import Approved from "../Components/Transactions/Approved";
import { authInstance } from "../Axios/Axios";
import LoginContext from "../context/Login/LoginContext";

type Props = {};

const Transactions = (props: Props) => {
  const params = useParams();
  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [successTransactions, setSuccessTransactions] = useState([]);
  const [totalTransactions, setTotalTransactions] = useState([]);
  console.log(params);
  const { token } = useContext(LoginContext);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  const getData = async () => {
    let success = await authInstance.get("/getSuccessTransaction", config);
    setSuccessTransactions(success.data.message);
    let pending = await authInstance.get("/getPendingTransaction", config);
    setPendingTransactions(pending.data.message);
    setTotalTransactions(success.data.message.concat(pending.data.message));
    console.log(totalTransactions);
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <Flex minH={"100vh"} maxH={"100vh"} minW={"100vw"}>
      <Box w={"20%"} border={"1px solid red"} p={2}>
        <Sidebar />
      </Box>
      <Box w={"80%"}>
        <Navbar scrollTop={true} />
        <Flex p={5} justifyContent={"space-between"} border={"1px solid cyan"}>
          <Text as={"b"} fontSize={28} alignSelf={"center"}>
            {params.id === "allTransactions"
              ? "All Transactions"
              : params.id === "allWithdraw"
              ? "All Withdrawals"
              : params.id === "allApproved"
              ? "All Approved"
              : ""}
          </Text>
          <Box border={"1px solid red"} alignSelf={"center"}>
            <Text fontSize={20}>
              Total Transactions:&nbsp;
              <span>
                {params.id === "allTransactions"
                  ? totalTransactions.length
                  : params.id === "allWithdraw"
                  ? pendingTransactions.length
                  : params.id === "allApproved"
                  ? successTransactions.length
                  : ""}
              </span>
            </Text>
          </Box>
        </Flex>
        {params.id === "allTransactions" ? (
          <AllTransactions data={totalTransactions} getData={getData} />
        ) : params.id === "allWithdraw" ? (
          <Withdraw data={pendingTransactions} getData={getData} />
        ) : params.id === "allApproved" ? (
          <Approved />
        ) : (
          <Box>Error Page</Box>
        )}
        <Footer />
      </Box>
    </Flex>
  );
};

export default Transactions;
