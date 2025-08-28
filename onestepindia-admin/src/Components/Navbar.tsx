import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import { BellIcon, SearchIcon } from "@chakra-ui/icons";
import { BsCart2 } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import LoginContext from "../context/Login/LoginContext";
import { useCookies } from "react-cookie";

type Props = {
  scrollTop: boolean;
};

const Navbar = ({ scrollTop }: Props) => {
  const [searchText, setSearchText] = useState("");
  const { currentUser } = useContext(LoginContext);
  const [cookies, setCookie, removeCookie] = useCookies();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  if (scrollTop === false && navRef.current) {
    // console.log(navRef);
    navRef.current.style.position = "sticky";
    navRef.current.style.top = "0";
    navRef.current.style.zIndex = "1000";
  }
  const logout = () => {
    removeCookie("tAdmin");
    sessionStorage.removeItem("previousPage");
  };
  return (
    <Box ref={navRef} w={"100%"}>
      <Box h={16} w={"full"} bg={"white"} alignContent={"center"}>
        <HStack
          // border={"1px solid red"}
          h={"100%"}
          alignSelf={"center"}
          justifyContent={"space-between"}
          p={3}
        >
          <Flex
            // border={"1px solid red"}
            // h={"100%"}
            w={"60%"}
            alignItems={"center"}
            // ml={3}
          >
            <InputGroup
              // border={"1px solid red"}
              h={"80%"}
              position={"relative"}
              // alignItems={"center"}
            >
              <Input
                value={searchText}
                placeholder="Search ShoppingBoom.in"
                variant={"filled"}
                // focusBorderColor={"none"}
                _focus={{
                  borderColor: "rgb(204, 204, 204)",
                  bgColor: "rgb(255, 255, 255)",
                }}
                onFocus={() => {
                  // setSearchActive(true);
                }}
                onBlur={() => {
                  setTimeout(() => {
                    // setSearchActive(false);
                  }, 100);
                }}
                // outline="none"
                onChange={(e) => {
                  setSearchText(e.target.value);
                  // localStorage.setItem("query", JSON.stringify(e.target.value));
                  console.log(e.target.value);
                  if (e.target.value !== "") {
                    // searchData(e.target.value, setSearchResult);
                  } else {
                    // setSearchResult(searchResultData);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchText !== "") {
                    navigate(`/searchProduct/q=${searchText}`);
                  }
                }}
              />
              <InputRightElement
                // border={"1px solid rgb(204, 204, 204)"}
                // h={"90%"}
                // alignSelf={"center"}
                // alignItems={"center"}
                // h={"100%"}
                borderRadius={"md"}
                _hover={{
                  bgColor: "rgb(204, 205, 176, 0.50)",
                  // border: "none",
                }}
                boxSizing={"border-box"}
                cursor={"pointer"}
                // position={"relative"}
                onClick={() => {
                  navigate(`/searchProduct/q=${searchText}`);
                }}
              >
                <SearchIcon
                  fontSize={"2rem"}
                  _hover={{
                    border: "none",
                  }}
                  p={1}
                />
                {/* </Button> */}
              </InputRightElement>
              {/* {searchActive ? (
            <Box
              minH={"fit-content"}
              maxH={"300px"}
              h={"300px"}
              w={"100%"}
              overflowY={"auto"}
              position={"absolute"}
              top={10}
              // border={"1px solid black"}
              bg={"white"}
              borderRadius={"md"}
              // borderCollapse={"collapse"}
            >
              {searchText === ""
                ? ""
                : searchResult &&
                  searchResult.map((el) => (
                    <Card
                      borderBottom={"0.5px solid grey"}
                      h={"80px"}
                      bg={"transparent"}
                      direction={{ base: "row" }}
                      gap={3}
                      cursor={"pointer"}
                      onClick={() => {
                        handleProductClick(el, navigate);
                      }}
                      _hover={{
                        bg: "rgba(211,211,211,0.60 )",
                        transition: "background-color 0.4s, transform 5s", // Adding transition properties,
                      }}
                      key={el.id}
                    >
                      <HStack
                        h={"100%"}
                        width={"15%"}
                        // border={"1px solid red"}
                        p={2}
                        alignItems="center"
                        verticalAlign={"middle"}
                      >
                        <Image
                          src={el.images[0]}
                          h={""}
                          w={"100%"}
                          // border={"1px solid red"}
                        />
                      </HStack>
                      <Box>
                        <Text fontSize={"18px"} as={"b"}>
                          {el.name}
                        </Text>
                        <Text fontSize={"14px"} color={"blue.500"}>
                          {" "}
                          in {el.category}
                        </Text>
                      </Box>
                    </Card>
                  ))}
            </Box>
          ) : (
            <></>
          )} */}
            </InputGroup>
          </Flex>
          <Flex
            // border={"1px solid red"}
            h={"100%"}
            w={"30%"}
            // verticalAlign={"middle"}
            justify={"space-between"}
            alignItems={"center"}
            gap={4}
            // mr={3}
          >
            {/* {loginState ? ( */}
            <Button
              bg="transparent"
              // color="white"
              _hover={{ bg: "none" }}
            >
              <Stack direction="row" alignItems="center">
                <Stack position="relative">
                  <BellIcon fontSize="1.5rem" />
                  <Badge
                    position="absolute"
                    top="-8px"
                    right="-8px"
                    bg="red.500"
                    color="white"
                    h="20px"
                    w="20px"
                    textAlign="center"
                    borderRadius="50%"
                    fontSize="10px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    0
                  </Badge>
                </Stack>
              </Stack>
            </Button>
            {/* ) : ( */}
            {/* <></> */}
            {/* )} */}
            {/* {loginState ? ( */}
            <Text
              // color={"white"}
              as={"b"}
              fontSize={"18px"}
            >
              Wallet: <span style={{ fontWeight: "medium" }}>&#8377;</span>
              &nbsp;
              <span style={{ color: "red", fontSize: "20px" }}>
                {currentUser.wallet}
              </span>
            </Text>
            {/* ) : ( */}
            {/* <></> */}
            {/* )} */}
            {/* {loginState ? ( */}
            <Menu autoSelect={false}>
              <MenuButton>
                <Wrap>
                  <WrapItem>
                    <Avatar
                      name={`${currentUser.name}`}
                      src={
                        currentUser.profileImg
                          ? currentUser.profileImg
                          : currentUser.gender === "male"
                          ? ""
                          : currentUser.gender === "female"
                          ? ""
                          : ""
                      }
                    />
                  </WrapItem>
                </Wrap>
              </MenuButton>
              <MenuList m={"auto"}>
                <MenuGroup title={`Hi, ${currentUser.name}`}>
                  <MenuItem
                    onClick={() => {
                      console.log("hi this is 1");
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      console.log("hi this is 2");
                    }}
                  >
                    Orders
                  </MenuItem>
                  <MenuItem onClick={logout}>Logout</MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Your Network">
                  <MenuItem>Binary Tree</MenuItem>
                  <MenuItem>Refered User</MenuItem>
                  <MenuItem>Marketing Level</MenuItem>
                </MenuGroup>
                <MenuDivider />
                <MenuGroup title="Help">
                  <MenuItem>Docs</MenuItem>
                  <MenuItem>FAQ</MenuItem>
                </MenuGroup>
              </MenuList>
            </Menu>
            {/* ) : (
          <Button
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </Button>
        )} */}
          </Flex>
        </HStack>
      </Box>
    </Box>
  );
};

export default Navbar;
