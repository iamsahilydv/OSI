import React from "react";
import { Box, Flex, HStack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box bg="gray.500" color="white" pl={3} pr={3} zIndex={100}>
      <Flex
        maxW="1200px"
        mx="auto"
        py="4"
        alignItems="center"
        justifyContent="space-between"
      >
        <HStack spacing="4">
          <Text fontSize="lg" fontWeight="bold">
            ShoppingBoom
          </Text>
          <Text fontSize="sm">About Us</Text>
          <Text fontSize="sm">Contact Us</Text>
          <Text fontSize="sm">Terms of Service</Text>
          <Text fontSize="sm">Privacy Policy</Text>
        </HStack>
        <Text fontSize="sm">
          &copy; {new Date().getFullYear()} ShoppingBoom
        </Text>
      </Flex>
    </Box>
  );
};

export default Footer;
