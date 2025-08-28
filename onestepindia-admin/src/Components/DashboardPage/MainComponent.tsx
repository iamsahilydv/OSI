import {
  Box,
  CircularProgress,
  Flex,
  Text,
  VStack,
  border,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { formatAmountToINR, getTurnOver } from "../CommonFunction";
import Footer from "../Footer/Footer";
import LoginContext from "../../context/Login/LoginContext";

type Props = {};

const turnOverLimits = [
  1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
];

const MainComponent = (props: Props) => {
  const [turnover, setTurnover] = useState(0);
  const { token, currentUser } = useContext(LoginContext);
  const [turnOverCap, setTurnoverCap] = useState(100);
  const formatDate = (options: {
    date: string;
    month: string;
    year: string;
  }) => {
    const date1 = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = {
      day: options.date === "numeric" ? "numeric" : undefined,
    };
    const monthOptions: Intl.DateTimeFormatOptions = {
      month: options.month === "short" ? "short" : undefined,
    };
    const yearOptions: Intl.DateTimeFormatOptions = {
      year: options.year === "numeric" ? "numeric" : undefined,
    };

    console.log(options.date);
    let formattedDate;
    if (options.date === "") {
      formattedDate = `${date1.toLocaleDateString(
        "en-IN",
        monthOptions
      )}, ${date1.toLocaleDateString("en-IN", yearOptions)}`;
    } else {
      formattedDate = `${date1.toLocaleDateString(
        "en-IN",
        monthOptions
      )} ${date1.toLocaleDateString(
        "en-IN",
        dateOptions
      )}, ${date1.toLocaleDateString("en-IN", yearOptions)}`;
    }
    return formattedDate;
  };
  let fetchTurnover = async () => {
    let totalTurnOver = await getTurnOver(currentUser.id, token);
    setTurnover(totalTurnOver);
    for (let i = 0; i < turnOverLimits.length; i++) {
      if (totalTurnOver < turnOverLimits[i]) {
        setTurnoverCap(turnOverLimits[i]);
        console.log(turnOverCap);
        return;
      }
    }
  };
  useEffect(() => {
    if (currentUser.id) {
      fetchTurnover();
    }
  }, []);

  return (
    <Box
      // border={"1px solid red"}
      h={"fit-content"}
      minH={`92.5vh`}
    >
      <Flex>
        <VStack
          minH={"85.5vh"}
          h={"fit-content"}
          w={"50%"}
          // border={"1px solid cyan"}
          flexDir={"column"}
        >
          <Flex
            // border={"1px solid blue"}
            h={"fit-content"}
            w={"80%"}
            m={"auto"}
            p={5}
            flexDir={"column"}
            gap={5}
            bg={"AppWorkspace"}
            borderRadius={"lg"}
            boxShadow={"md"}
          >
            <Box>
              <Text as={"b"} fontSize={"25px"}>
                Current Balance
              </Text>
            </Box>
            <Box m={"auto"}>
              <CircularProgress
                // getValueText={"percentage"}
                value={turnover}
                min={0}
                max={turnOverCap}
                color={"orange"}
                thickness={"14px"}
                size="200px"
                capIsRound={true}
                isIndeterminate={false}
                trackColor={"gray"}
              />
            </Box>
            <Flex
              justifyContent={"center"}
              flexDir={"column"}
              // m={"auto"}
              // border={"1px solid red"}
              textAlign={"center"}
            >
              <Box fontWeight={"bold"} fontSize={"18px"}>
                {formatAmountToINR(turnover)}
              </Box>
              <Box fontWeight={"bold"} fontSize={"14px"}>
                Total Revenue
              </Box>
            </Flex>
            <Box
              // border={"1px solid red"}
              h={"fit-content"}
              p={5}
              bg={"whitesmoke"}
            >
              <Box>
                <Text as={"b"} fontSize={"18px"}>
                  Today's Earning
                </Text>
              </Box>
              <Flex justifyContent={"space-between"} alignItems={"center"}>
                <Box fontSize={"14px"}>
                  {formatDate({
                    date: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Box>
                <Box fontSize={"14px"}>{formatAmountToINR(1000000)}</Box>
              </Flex>
            </Box>
            <Box
              // border={"1px solid red"}
              h={"fit-content"}
              p={5}
              bg={"whitesmoke"}
            >
              <Box>
                <Text as={"b"} fontSize={"18px"}>
                  This Month's Earning
                </Text>
              </Box>
              <Flex justifyContent={"space-between"} alignItems={"center"}>
                <Box fontSize={"14px"}>
                  {formatDate({
                    date: "",
                    month: "short",
                    year: "numeric",
                  })}
                </Box>
                <Box fontSize={"14px"}>{formatAmountToINR(10000000000)}</Box>
              </Flex>
            </Box>
          </Flex>
        </VStack>
        <VStack
          minH={"85.5vh"}
          h={"fit-content"}
          w={"50%"}
          border={"1px solid cyan"}
          flexDir={"column"}
        ></VStack>
      </Flex>
      <Footer />
    </Box>
  );
};

export default MainComponent;
