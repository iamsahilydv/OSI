import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Box, Text } from "@chakra-ui/react";
import AllRoutes from "./router/AllRoutes";

function App() {
  return (
    <Box h={"fit-content"} minH={"100vh"} w={"100vw"} bg={"#ededed"}>
      <AllRoutes />
    </Box>
  );
}

export default App;
