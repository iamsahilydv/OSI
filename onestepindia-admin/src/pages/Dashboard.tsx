import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import MainComponent from "../Components/DashboardPage/MainComponent";
import Footer from "../Components/Footer/Footer";

type Props = {};

const Dashboard = (props: Props) => {
  document.title = `Admin Panel Dashboard ShoppingBoom`;
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
        <MainComponent />
      </Box>
    </Flex>
  );
};

export default Dashboard;
