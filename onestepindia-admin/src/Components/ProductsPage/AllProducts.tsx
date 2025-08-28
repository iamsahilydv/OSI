import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Grid,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Text,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import { authInstance } from "../../Axios/Axios";
import LoadingContext from "../../context/Loading/LoadingContext";
import Loading from "../LoadingDesign/Loading";
import SingleProduct from "./SingleProduct";
import ProductModal from "./ProductModal";

type Props = {
  category: any;
};
export const getData = async (setLoading: any, setProducts: any) => {
  setLoading(true);
  let res = await authInstance.get("/products");
  console.log(res.data.data);
  setProducts(res.data.data);
  setLoading(false);
};
const AllProducts = ({ category }: Props) => {
  const [products, setProducts] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [searchDetails, setSearchDetails] = useState({
    type: "",
    query: "",
  });
  const { loading, setLoading } = useContext(LoadingContext);
  const handleFilter = () => {
    console.log(searchDetails);
    setFilteredProduct(products);
    let prevProduct = products;
    if (searchDetails.type === "id") {
      setFilteredProduct(
        filteredProduct.filter((el: any) => el.id === searchDetails.query)
      );
    } else if (searchDetails.type === "name") {
      setFilteredProduct(
        filteredProduct.filter((el: any) =>
          el.name.includes(searchDetails.query)
        )
      );
    } else if (searchDetails.type === "brand") {
      setFilteredProduct(
        filteredProduct.filter((el: any) =>
          el.brand.includes(searchDetails.query)
        )
      );
    } else if (searchDetails.type === "category") {
      setFilteredProduct(
        filteredProduct.filter((el: any) =>
          el.brand.includes(searchDetails.query)
        )
      );
    } else {
      // Handle other types if needed
    }

    setProducts(filteredProduct);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [singleProduct, setSingleProduct] = useState({});

  useEffect(() => {
    getData(setLoading, setProducts);
  }, []);
  useEffect(() => {
    setFilteredProduct(products);
  }, [products]);

  return (
    <Box p={4} w={"100%"} h={"85.3vh"}>
      <Flex justifyContent={"space-between"} w={"100%"}>
        <Text as={"b"} fontSize={"22px"}>
          All Products
        </Text>
        <Flex minW={"40%"} gap={4}>
          <Select
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              if (e.target.value === "") {
                setFilteredProduct(products);
                setSearchDetails((prevData) => ({
                  ...prevData,
                  query: "",
                }));
              }
              setSearchDetails((prevData) => ({
                ...prevData,
                type: e.target.value,
              }));
            }}
            value={searchDetails.type}
          >
            <option value="">Search By</option>
            <option value="id">Product ID</option>
            <option value="name">Product Name</option>
            <option value="brand" disabled>
              Product Brand
            </option>
            <option value="category" disabled>
              Product Category
            </option>
          </Select>
          {searchDetails.type === "category" ? (
            <Select onChange={handleFilter}>
              <option value="">Select Category</option>
              {category &&
                category.map((el: any, index: number) => (
                  <option key={index} value={el.id}>
                    {el.name}
                  </option>
                ))}
            </Select>
          ) : (
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                type={"text"}
                placeholder="Enter Query"
                value={searchDetails.query}
                onChange={(e: any) => {
                  setSearchDetails((prevData) => ({
                    ...prevData,
                    query: e.target.value,
                  }));
                }}
                isDisabled={searchDetails.type === "" ? true : false}
              />
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  size="md"
                  isDisabled={
                    searchDetails.type === "" || searchDetails.query === ""
                      ? true
                      : false
                  }
                  onClick={handleFilter}
                >
                  <SearchIcon />
                </Button>
              </InputRightElement>
            </InputGroup>
          )}
        </Flex>
      </Flex>
      {loading ? (
        <Loading />
      ) : (
        <Grid
          mt={5}
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
          // border={"1px solid red"}
          h={"75vh"}
          overflowY={"auto"}
        >
          {filteredProduct &&
            filteredProduct.map((el, index) => (
              <SingleProduct
                el={el}
                index={index}
                key={index}
                openModal={() => {
                  setIsModalOpen(true);
                  setSingleProduct(el);
                }}
              />
            ))}
        </Grid>
      )}
      {isModalOpen === true ? (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={singleProduct}
          category={category}
          setProducts={setProducts}
        />
      ) : (
        <></>
      )}
    </Box>
  );
};

export default AllProducts;

// to do filter using category and brand
