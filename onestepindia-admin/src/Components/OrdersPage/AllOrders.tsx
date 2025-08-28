import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";
import SingleOrderShow from "./SingleOrderShow";

type Props = {
  orders: any[];
  text: string;
  config: any;
};

const AllOrders = ({ orders, text, config }: Props) => {
  console.log(orders);
  return (
    <Box p={8} h={"100%"} maxH={"85%"}>
      <Flex justifyContent={"space-between"}>
        <Text fontSize="2xl" mb={4}>
          {text}
        </Text>
        <Text fontSize="xl" mb={4}>
          Total {text}: <span style={{ color: "blue" }}>{orders.length}</span>
        </Text>
      </Flex>
      <Flex
        // border={"1px solid red"}
        direction={"column"}
        gap={2}
        // h={"fit-content"}
        maxH={"95%"}
        overflowY={"auto"}
      >
        {orders.length === 0 ? (
          <Text alignSelf={"center"} fontSize={"22px"} fontWeight={"bold"}>
            No {text}
          </Text>
        ) : (
          orders &&
          orders.map((el: any) => (
            <SingleOrderShow key={el.id} order={el} config={config} />
          ))
        )}
        {}
      </Flex>
    </Box>
  );
};

export default AllOrders;
