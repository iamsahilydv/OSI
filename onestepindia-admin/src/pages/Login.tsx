import { Box } from "@chakra-ui/react";
import React from "react";
import LoginBox from "../Components/LoginPage/LoginBox";

type Props = {};

const Login = (props: Props) => {
  document.title = `Login Admin Panel ShoppingBoom`;
  return (
    <Box
      bg={""}
      bgImage={
        "https://plus.unsplash.com/premium_photo-1671570756033-97f3cd4e9cb5?auto=format&fit=crop&q=60&w=900&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BsYXNoJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D"
      }
      bgRepeat={"no-repeat"}
      minH={"100vh"}
      minW={"100vw"}
      backgroundSize={"cover"}
    >
      <Box h={"100vh"} w={"100vw"}>
        <LoginBox />
      </Box>
    </Box>
  );
};

export default Login;
