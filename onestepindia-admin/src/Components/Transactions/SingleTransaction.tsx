import { Badge, Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { authInstance } from "../../Axios/Axios";
import LoginContext from "../../context/Login/LoginContext";
import AuthToast from "../Toast";

type Props = {
  transaction: any;
  getData: any;
};

const SingleTransaction = ({ transaction, getData }: Props) => {
  const { token } = useContext(LoginContext);
  const toast = useToast();
  const [loadingButton, setLoadingButton] = useState(false);
  const createdAt = new Date(transaction.created_at);
  const updatedAt = new Date(transaction.updated_at);
  createdAt.setHours(createdAt.getHours() + 5);
  createdAt.setMinutes(createdAt.getMinutes() + 30);

  updatedAt.setHours(updatedAt.getHours() + 5);
  updatedAt.setMinutes(updatedAt.getMinutes() + 30);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formattedDateTime = createdAt.toLocaleString("en-IN", options);
  const updatedDateTime = updatedAt.toLocaleString("en-IN", options);

  console.log(`Created Date and Time (Indian Time): ${formattedDateTime}`);
  console.log(`Updated Date and Time (Indian Time): ${updatedDateTime}`);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  const approvePayment = async () => {
    setLoadingButton(true);
    const body = {
      status: true,
    };
    // console.log(transaction.id, body, config);
    try {
      const res = await authInstance.patch(
        `/updateTransaction/${transaction.id}`,
        body,
        config
      );
      console.log(res);
      if (res.status === 200 && res.data.message === "Transaction Successful") {
        AuthToast(
          `Transaction ID "${transaction.id}" Approved for "₹${transaction.amount}"`,
          toast,
          `Payment Approved`,
          "success"
        );
      }

      //   calling the getData Function to rerender the transaction
      getData();
    } catch (error) {
      console.log(error);
    }
    setLoadingButton(false);
  };

  return (
    <Flex
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      width="100%"
      textAlign="left"
      justifyContent={"space-between"}
      _hover={{
        transform: "scale(1.013)",
        transition: "transform 0.2s ease-out",
        cursor: "pointer",
      }}
    >
      <Flex
        flexDir={"column"}
        gap={1}
        p={3}
        w={"50%"}
        //   border={"1px solid red"}
      >
        <Text fontSize="lg" fontWeight="bold">
          Transaction #{transaction.id}
        </Text>
        <Text>User ID: {transaction.user_id}</Text>
        <Text>Amount: ₹{transaction.amount}</Text>
      </Flex>
      <Flex
        flexDir={"column"}
        gap={1}
        p={3}
        w={"50%"}
        //   border={"1px solid red"}
      >
        <Flex
          // border={"1px solid red"}
          h={8}
          alignItems={"center"}
          gap={4}
        >
          <Text alignSelf={"center"}>Status: </Text>
          <Box>
            <Badge
              colorScheme={transaction.status ? "green" : "orange"}
              variant="solid"
              //   mt={2}
            >
              {transaction.status ? "Success" : "Pending"}
            </Badge>
          </Box>
        </Flex>
        <Text mt={2}>
          Requested At:{" "}
          <span style={{ fontWeight: "bold" }}>{formattedDateTime}</span>
        </Text>
        {transaction.created_at !== transaction.updated_at ? (
          <Text>
            Approved At:{" "}
            <span style={{ fontWeight: "bold" }}>{updatedDateTime}</span>
          </Text>
        ) : (
          <Box>
            <Button
              colorScheme={"green"}
              onClick={approvePayment}
              isDisabled={loadingButton ? true : false}
            >
              {loadingButton ? "Loading..." : "Approve Payment"}
            </Button>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};

export default SingleTransaction;
