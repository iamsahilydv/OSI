import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import LoginContext from "../context/Login/LoginContext";
import { useNavigate } from "react-router-dom";
import { navigation } from "./CommonFunction";
import logo from "../Assets/Logo Images/ShoppingBoomLogo.jpeg";

const Sidebar = () => {
  const { currentUser } = useContext(LoginContext);
  const navigate = useNavigate();

  return (
    <VStack w="100%" spacing={4} align="stretch">
      <Flex direction={{ base: "column", md: "row" }} align="center">
        <Image
          h={{ base: "35px", md: "50px", lg: "75px" }}
          w={{ base: "35px", md: "50px", lg: "75px" }}
          borderRadius="50%"
          src={logo}
        />
        <Flex flexDir="column" justifyContent="center" ml={{ base: 0, md: 2 }}>
          <Box>
            <Text
              fontSize={{ base: "14px", md: "16px" }}
              fontWeight="bold"
              letterSpacing={{ base: "2px", md: "3px", xl: "4px" }}
            >
              ShoppingBoom
            </Text>
            <Text fontSize={{ base: "10px", md: "13px" }}>
              We Believe in making Trust
            </Text>
          </Box>
        </Flex>
      </Flex>
      <Box mb={3}>
        <Text
          ml={{ base: 0, md: 4 }}
          as="b"
          fontSize={{ base: "lg", md: "2xl" }}
        >
          Welcome! {currentUser.name}
        </Text>
      </Box>
      <Accordion w="100%" allowToggle>
        <AccordionItem w="100%" boxShadow="sm">
          <AccordionButton
            onClick={() => {
              navigation("/", navigate);
            }}
          >
            <Box as="span" flex="1" textAlign="left">
              Dashboard
            </Box>
          </AccordionButton>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <AccordionButton
            onClick={() => {
              navigation("/network", navigate);
            }}
          >
            <Box as="span" flex="1" textAlign="left">
              Network
            </Box>
          </AccordionButton>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Products
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex flexDir="column" gap={4}>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/product/addProducts", navigate);
                }}
              >
                Add Product
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/product/allProducts", navigate);
                }}
              >
                All Product
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/product/blockedProducts", navigate);
                }}
              >
                Blocked Product
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Manage Members
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex flexDir="column" gap={4}>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allMembers", navigate);
                }}
              >
                All Members
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allSubscribed", navigate);
                }}
              >
                Subscribed Members
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allActive", navigate);
                }}
              >
                Active Members
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allInActive", navigate);
                }}
              >
                InActive Members
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allBlocked", navigate);
                }}
              >
                Blocked Members
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Manage Orders
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex flexDir="column" gap={4}>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/orders/allOrders", navigate);
                }}
              >
                All Orders
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/orders/allPending", navigate);
                }}
              >
                Pending Payment
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/orders/allDone", navigate);
                }}
              >
                Done Payment
              </Button>
              {/* <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allInActive", navigate);
                }}
              >
                InActive Members
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/members/allBlocked", navigate);
                }}
              >
                Blocked Members
              </Button> */}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                Transactions
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex flexDir="column" gap={4}>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/transactions/allTransactions", navigate);
                }}
              >
                All Transactions
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/transactions/allWithdraw", navigate);
                }}
              >
                Withdraw Requests
              </Button>
              <Button
                variant="outline"
                colorScheme="messenger"
                onClick={() => {
                  navigation("/transactions/allApproved", navigate);
                }}
              >
                Approved Transactions
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem w="100%" boxShadow="sm">
          <AccordionButton
            onClick={() => {
              navigation("/invoice", navigate);
            }}
          >
            <Box as="span" flex="1" textAlign="left">
              Invoice List
            </Box>
          </AccordionButton>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
};

export default Sidebar;
