import { Box, Center, Text } from "@chakra-ui/react";
import React from "react";

type Props = {};

const Loading = (props: Props) => {
  return (
    <Center minH={"85.4vh"} h={"85.4vh"}>
      <Box
        textAlign={"center"}
        // border={"1px solid red"}
        p={4}
      >
        <Text as="b" fontSize={32}>
          Loading...
        </Text>
      </Box>
    </Center>
  );
};

export default Loading;
