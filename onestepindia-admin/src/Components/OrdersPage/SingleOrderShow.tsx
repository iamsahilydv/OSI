import { Box, Flex, Switch, Text, useToast } from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import { authInstance } from "../../Axios/Axios";
import LoginContext from "../../context/Login/LoginContext";
import AuthToast from "../Toast";

type Props = {
  order: any;
  config: any;
};

const SingleOrderShow = ({ order, config }: Props) => {
  const [checked, setChecked] = useState(order.pymentStatus === 1);
  const { token, currentUser } = useContext(LoginContext);
  const toast = useToast();
  const handleSwitchChange = async () => {
    setChecked(!checked);
    let body = {
      delivered: true,
      pymentStatus: true,
    };
    let res = await authInstance.patch(
      `/updateOrder/${currentUser.id}/${order.id}`,
      body,
      config
    );
    if (res.status === 200) {
      AuthToast("", toast, "Order Updated Successfully", "success");
    } else {
      AuthToast(
        "Order Not Updated",
        toast,
        "Something Went Wrong, Try Again",
        "error"
      );
    }
    console.log(res);
  };

  console.log(order);
  console.log(checked);

  return (
    <Flex
      key={order.id}
      p={2}
      bg={"orange.200"}
      borderRadius={"xl"}
      justify={"space-between"}
    >
      <Box>
        <Text>Order Id: {order.id}</Text>
        <Text>Order Amount : {order.price}</Text>
        <Text>User Name: {order.user_name}</Text>
        <Text>User Email: {order.email}</Text>
      </Box>
      <Box pr={4}>
        <Flex alignItems={"center"} gap={4}>
          <Text>Payment Done:</Text>
          <Switch
            colorScheme="green"
            isChecked={checked}
            isDisabled={checked}
            onChange={handleSwitchChange}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default SingleOrderShow;
