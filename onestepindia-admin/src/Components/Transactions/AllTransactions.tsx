import { Box, Flex, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import SingleTransaction from "./SingleTransaction";

type Props = {
  data: any;
  getData: any;
};

const AllTransactions = ({ data, getData }: Props) => {
  const [transactions, setTransactions] = useState([data]);
  useEffect(() => {
    setTransactions(data);
  }, [data]);
  console.log(transactions);
  return (
    <Flex mt={3} flexDir={"column"} gap={3} p={3} h={"74vh"} overflowY={"auto"}>
      {transactions &&
        transactions.map((el: any, index: number) => (
          <SingleTransaction key={index} transaction={el} getData={getData} />
        ))}
    </Flex>
  );
};

export default AllTransactions;
