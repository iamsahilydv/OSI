import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useState } from "react";
import LoginContext from "../../context/Login/LoginContext";
import logo from "../../Assets/Logo Images/ShoppingBoomLogo.jpeg";
import { useCookies } from "react-cookie";
import { authInstance } from "../../Axios/Axios";
import AuthToast from "../Toast";
import { useNavigate } from "react-router-dom";

type Props = {};

const LoginBox = (props: Props) => {
  const [loginObject, setLoginObject] = useState({
    email: "",
    password: "",
  });
  let { currentUser, setLoginState } = useContext(LoginContext);
  const [cookies, setCookie, removeCookie] = useCookies();
  const toast = useToast();
  const navigate = useNavigate();
  const login = async () => {
    try {
      const res = await authInstance.post("/login", loginObject);
      console.log(res.data);
      if (res.data.message === "Login Successfully") {
        const token = res.data.token;
        setCookie("tAdmin", token, { path: "/" });
        try {
          let res = await authInstance.post(`/verify-token`, { token: token });
          if (res.status === 200 && res.data.success === true) {
            if (
              res.data.Data[0].role === "superAdmin" ||
              res.data.Data[0].role === "admin"
            ) {
              // cartCount = res.data.cartCount;
              currentUser = res.data.Data[0];
              AuthToast(
                `Welcome ${loginObject.email}`,
                toast,
                "Login Successfull.",
                "success"
              );
              navigate("/");
              return true;
            } else {
              currentUser = {};
              AuthToast(`Not Authorised`, toast, "Login Failed.", "error");
            }
          } else {
            removeCookie("tAdmin");
            setLoginState(false);
            return false;
          }
        } catch (err) {
          removeCookie("tAdmin");
          setLoginState(false);
        }
        setLoginState(true);
        // setLoginButtonText("Login");
        // setLoginDisabled(false);
        // localStorage.setItem("Login", JSON.stringify(true));
        // navigate("/");
        // alert("Login");
      }
    } catch (error) {
      //   setLoginButtonText("Login");
      //   setLoginDisabled(false);
      console.log(error);

      if (
        (error as any)?.response?.status === 404 ||
        (error as any)?.response.data.message === "You don't have an account!"
      ) {
        // setLoginEmailError(true);
        // setLoginEmailErrorText("Email not found, Please SignUp");
      } else if (
        (error as any)?.response?.status === 400 ||
        (error as any)?.response.data.message === "Incorrect Password!"
      ) {
        // setLoginPasswordError(true);
        // setLoginPasswordErrorText("Wrong Password, Try Again!");
      }
      // (error as any)?.response?.status === 404
      //   ? (() => {
      //       setLoginEmailError(true);
      //       setLoginEmailErrorText("Email not found, Please SignUp");
      //     })()
      //   : "";
    }
  };
  const backdropFilterStyle = {
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  };

  const loginBoxStyle = {
    // border: "1px solid red",
    backgroundColor: "#D0E3F4",
    boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
    padding: "20px",
  };

  return (
    <Flex h={"100vh"} alignItems="center" justifyContent="center">
      <Flex
        w={"100%"}
        h={"100%"}
        alignItems="center"
        justifyContent="center"
        style={backdropFilterStyle}
      >
        <Box
          w={"40%"}
          h={"70%"}
          style={loginBoxStyle}
          overflowY={"auto"}
          borderRadius={"lg"}
        >
          <VStack spacing={4} p={5}>
            <Flex gap={2}>
              <Image h={"175px"} w={"175px"} borderRadius={"50%"} src={logo} />
              <Flex flexDir={"column"} justifyContent={"center"}>
                <Box>
                  <Text
                    fontSize={"24px"}
                    fontWeight={"bold"}
                    letterSpacing={"4px"}
                  >
                    ShoppingBoom
                  </Text>
                  <Text fontSize={"18px"}>We Believe in making Trust</Text>
                </Box>
              </Flex>
            </Flex>
            <Heading as="h2" size="lg">
              Login
            </Heading>
            <Flex flexDir={"column"} gap={2} w={"100%"}>
              <label
                htmlFor="username"
                style={{
                  fontSize: "22px",
                }}
              >
                Username or Email
              </label>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                variant="filled"
                onChange={(e) => {
                  setLoginObject({ ...loginObject, email: e.target.value });
                }}
              />
              <label
                htmlFor="password"
                style={{
                  fontSize: "22px",
                }}
              >
                Password
              </label>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                variant="filled"
                onChange={(e) => {
                  setLoginObject({ ...loginObject, password: e.target.value });
                }}
              />
            </Flex>
            <Button onClick={login} colorScheme="teal" size="md">
              Login
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};

export default LoginBox;
