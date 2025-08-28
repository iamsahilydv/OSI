import { InfoIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  GridItem,
  Heading,
  Image,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

const SingleProduct = ({ el, index, openModal, setSingleProduct }: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  console.log(el, index);
  return (
    <GridItem
      key={index}
      w="100%"
      h="450px"
      bg="white"
      boxShadow="md"
      borderRadius="md"
      p={5}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {el.images && el.images.length > 0 && (
        <Flex align="center" justify="center" maxH="50%" w="100%" mb={4}>
          <Image
            maxH="100%"
            w="auto"
            src={el.images[0]}
            alt={`${el.brand} ${el.name}`}
          />
        </Flex>
      )}
      <Heading
        color="blackAlpha.700"
        as="h6"
        fontSize="xl"
        textAlign="center"
        noOfLines={1}
        mb={2}
      >
        {el.brand} {el.name}
      </Heading>
      <Text textAlign="center">
        Rs.{" "}
        <span style={{ color: "green", fontSize: "22px" }}>
          {el.prices[0]?.current}{" "}
        </span>
      </Text>
      <span
        style={{
          textDecoration: "line-through",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        {el.prices[0]?.original}
      </span>

      <Text textAlign="center">
        Total in Stock:{" "}
        <span style={{ color: el.qty < 5 ? "red" : "green" }}>{el.qty}</span>
      </Text>
      <Box w="100%" h={12}>
        <Button h="100%" colorScheme={"whatsapp"} w="100%" onClick={openModal}>
          View Product &nbsp; <span>{<InfoIcon fontSize={"22px"} />}</span>
        </Button>
      </Box>
    </GridItem>
  );
};

export default SingleProduct;
