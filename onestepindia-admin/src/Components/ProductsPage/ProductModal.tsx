import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { authInstance } from "../../Axios/Axios";
import LoginContext from "../../context/Login/LoginContext";
import { getData } from "./AllProducts";
import LoadingContext from "../../context/Loading/LoadingContext";
import AuthToast from "../Toast";

const ProductModal = ({
  isOpen,
  onClose,
  product,
  category,
  setProducts,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  category: any;
  setProducts: Dispatch<SetStateAction<never[]>>;
}) => {
  const [selectedTab, setSelectedTab] = useState("productDetails");
  const [isEditable, setIsEditable] = useState(false);
  const { token } = useContext(LoginContext);
  const { setLoading } = useContext(LoadingContext);
  const toast = useToast();
  const [productEdit, setProductEdit] = useState({
    name: "",
    // category_id: "",
    brand: "",
    qty: "",
    original: "",
    discountPercentage: "",
    currency: "",
  });

  useEffect(() => {
    setProductEdit((prevData) => ({
      ...prevData,
      name: product.name,
      // category_id: ,
      brand: product.brand,
      qty: product.qty,
      original: product.prices[0].original,
      discountPercentage: product.prices[0].discountPercentage,
      currency: product.prices[0].currency,
      // Update other properties as needed
    }));
    // console.log(productEdit);
  }, [product]);
  console.log(product);

  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  const editProduct = async () => {
    // category needs to be done
    let body = {
      id: product.id,
      name: productEdit.name,
      brand: productEdit.brand,
      qty: productEdit.qty,
    };
    try {
      let res = await authInstance.patch("/update-product", body, config);
      console.log(res);
      if (res.data.message === "Product updated successfully!") {
        getData(setLoading, setProducts);
        AuthToast(
          "",
          toast,
          `Updated Details of ${productEdit.name}`,
          "success"
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  const editPrice = async () => {
    // category needs to be done
    let body = {
      original: productEdit.original,
      discountPercentage: productEdit.discountPercentage,
      currency: productEdit.currency,
    };
    try {
      let res = await authInstance.put(
        `/update-price/${product.id}`,
        body,
        config
      );
      console.log(res);
      if (res.data.message === "Price updated successfully.") {
        getData(setLoading, setProducts);
        AuthToast("", toast, `Updated Price of ${productEdit.name}`, "success");
      }
    } catch (err) {
      console.log(err);
    }
  };
  const updateProduct = async () => {
    if (selectedTab === "productDetails") {
      await editProduct();
    } else if (selectedTab === "priceDetails") {
      await editPrice();
    } else {
      alert("please refresh the page and try again");
    }
    setIsEditable(false);
  };
  return (
    <Modal
      closeOnOverlayClick={false}
      size={"4xl"}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Product</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex mb={3} justifyContent={"space-between"}>
            <Flex gap={3}>
              <Button
                variant={selectedTab === "productDetails" ? "ghost" : "solid"}
                isDisabled={
                  selectedTab === "productDetails"
                    ? true
                    : isEditable === true
                    ? true
                    : false
                }
                onClick={() => {
                  setSelectedTab("productDetails");
                }}
              >
                Product Details
              </Button>
              <Button
                variant={selectedTab === "priceDetails" ? "ghost" : "solid"}
                isDisabled={
                  selectedTab === "priceDetails"
                    ? true
                    : isEditable === true
                    ? true
                    : false
                }
                onClick={() => {
                  setSelectedTab("priceDetails");
                }}
              >
                Price Details
              </Button>
            </Flex>
            <Flex gap={4}>
              <Button
                display={isEditable === true ? "block" : "none"}
                colorScheme={"red"}
                onClick={() => {
                  setIsEditable(!isEditable);
                }}
              >
                Cancel Edit
              </Button>
              <Button
                isDisabled={isEditable === false ? false : true}
                onClick={() => {
                  setIsEditable(!isEditable);
                }}
              >
                <EditIcon />
              </Button>
            </Flex>
          </Flex>
          <Flex flexDir={"column"} gap={4}>
            {selectedTab === "productDetails" ? (
              <Flex gap={4}>
                {product.images && product.images.length > 0 && (
                  <Flex
                    align="center"
                    justify="center"
                    w="25%"
                    mb={4}
                    // border={"1px solid red"}
                  >
                    <Image
                      maxH="100%"
                      w="auto"
                      src={product.images[0]}
                      alt={`${product.brand} ${product.name}`}
                    />
                  </Flex>
                )}
                <Flex
                  w={"75%"}
                  border={"2px solid gray"}
                  borderRadius={"md"}
                  // flexDir={"column"}
                  justifyContent={"space-around"}
                  mt={3}
                >
                  <Flex
                    w={"100%"}
                    flexDir={"column"}
                    // border={"1px solid red"}
                    p={2}
                    justifyContent={"space-around"}
                  >
                    <Flex w={"100%"} gap={3}>
                      <Text alignSelf={"center"} minW={"fit-content"}>
                        Product Name:
                      </Text>
                      <Input
                        isDisabled={isEditable === false ? true : false}
                        value={productEdit.name}
                        onChange={(e: any) => {
                          setProductEdit((prevData) => ({
                            ...prevData,
                            name: e.target.value,
                          }));
                        }}
                      />
                    </Flex>
                    <Flex w={"100%"} gap={3}>
                      <Text alignSelf={"center"} minW={"fit-content"}>
                        Brand:
                      </Text>
                      <Select
                        value={productEdit.brand}
                        isDisabled={isEditable === false ? true : false}
                        onChange={(e: any) => {
                          setProductEdit((prevData) => ({
                            ...prevData,
                            brand: e.target.value,
                          }));
                        }}
                      >
                        <option value=""></option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Vivo">Vivo</option>
                      </Select>
                    </Flex>
                  </Flex>
                  <Flex
                    w={"100%"}
                    flexDir={"column"}
                    p={2}
                    justifyContent={"space-around"}
                  >
                    <Flex w={"100%"} gap={3}>
                      <Text alignSelf={"center"} minW={"fit-content"}>
                        Product Quantity:
                      </Text>
                      <Input
                        value={productEdit.qty}
                        isDisabled={isEditable === false ? true : false}
                        onChange={(e: any) => {
                          setProductEdit((prevData) => ({
                            ...prevData,
                            qty: e.target.value,
                          }));
                        }}
                      />
                    </Flex>
                    <Flex w={"100%"} gap={3}>
                      {/* category change and in api call need to be fixed */}
                      <Text alignSelf={"center"} minW={"fit-content"}>
                        Category:
                      </Text>
                      <Select
                        name={product.category}
                        // isDisabled={isEditable === false ? true : false}
                        isDisabled
                      >
                        <option value=""></option>
                        {category &&
                          category.map((el: any, index: number) => (
                            <option key={index} value={el.id}>
                              {el.name}
                            </option>
                          ))}
                      </Select>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ) : (
              <Flex
                w={"100%"}
                gap={3}
                // border={"1px solid cyan"}
                flexDir={"column"}
                justifyContent={"space-around"}
              >
                <Flex
                  w={"100%"}
                  // flexDir={"column"}
                  // border={"1px solid red"}
                  p={2}
                  justifyContent={"space-between"}
                  gap={3}
                >
                  <Flex w={"50%"} gap={3}>
                    <Text alignSelf={"center"} minW={"fit-content"}>
                      Product Price:
                    </Text>
                    <Input
                      isDisabled={isEditable === false ? true : false}
                      value={productEdit.original}
                      onChange={(e: any) => {
                        setProductEdit((prevData) => ({
                          ...prevData,
                          original: e.target.value,
                        }));
                      }}
                    />
                  </Flex>
                  <Flex w={"50%"} gap={3}>
                    <Text alignSelf={"center"} minW={"fit-content"}>
                      Discount:
                    </Text>
                    <InputGroup>
                      <Input
                        value={productEdit.discountPercentage}
                        isDisabled={isEditable === false ? true : false}
                        onChange={(e: any) => {
                          setProductEdit((prevData) => ({
                            ...prevData,
                            discountPercentage: e.target.value,
                          }));
                        }}
                      />
                      <InputRightElement>%</InputRightElement>
                    </InputGroup>
                  </Flex>
                </Flex>
                <Flex
                  w={"100%"}
                  flexDir={"column"}
                  p={2}
                  justifyContent={"space-around"}
                  gap={3}
                >
                  <Flex w={"100%"} justifyContent={"space-between"} gap={3}>
                    <Text alignSelf={"center"} minW={"fit-content"}>
                      Currency:
                    </Text>
                    <Select
                      value={productEdit.currency}
                      isDisabled={isEditable === false ? true : false}
                      onChange={(e: any) => {
                        setProductEdit((prevData) => ({
                          ...prevData,
                          currency: e.target.value,
                        }));
                      }}
                    >
                      <option value=""></option>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </Select>
                  </Flex>
                </Flex>
              </Flex>
            )}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            isDisabled={isEditable === true ? false : true}
            colorScheme="blue"
            mr={3}
            onClick={updateProduct}
          >
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ProductModal;
