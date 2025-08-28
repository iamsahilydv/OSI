import {
  Badge,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  extendTheme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import Loading from "../LoadingDesign/Loading";
import { authInstance } from "../../Axios/Axios";
import LoginContext from "../../context/Login/LoginContext";
import AuthToast from "../Toast";

type Props = {
  users: any;
  loading: boolean;
  text: string;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};
type UserStageProps = {
  status: string;
  name: string;
  email: string;
  referId: string;
  user: any;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};
const UserStage: React.FC<UserStageProps> = ({
  status,
  name,
  email,
  referId,
  user,
  apiCall,
  setApiCall,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checked, setChecked] = useState(status === "active");
  const [canActivate, setCanActivate] = useState(false); // Controls switch activation
  const { token } = useContext(LoginContext);
  const toast = useToast();
  const getBackgroundColor = (stage: number) => {
    const colors = [
      "red.200",
      "orange.200",
      "yellow.200",
      "green.200",
      "teal.200",
      "blue.200",
      "cyan.200",
      "purple.200",
      "pink.200",
      "blue.400",
      "gray.400",
    ];
    return colors[stage] || "gray.200";
  };
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  const handleSwitchChange = async (id: number) => {
    let body = {
      id: id,
      status: checked ? "inactive" : "active", // Toggle status
    };
    try {
      if (canActivate) {
        let res = await authInstance.patch(`updateUserStatus`, body, config);
        if (res.status === 200) {
          setChecked(!checked);
          setApiCall(!apiCall);
          AuthToast(``, toast, "User status updated!!", "success");
        } else {
          AuthToast(
            ``,
            toast,
            "Problem in updating User Status Contact Support!!",
            "warning"
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setChecked(status === "active");
  }, [status]);

  return (
    <Flex
      p={4}
      mb={4}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="sm"
      bg={getBackgroundColor(0)}
      justifyContent="space-between"
    >
      {/* User Info */}
      <Flex flexDir="column" gap={3}>
        <Text fontWeight="bold">{name}</Text>
        <Flex align="center" gap={2}>
          <Text fontStyle="italic">Status:</Text>
          <Badge colorScheme={checked ? "green" : "red"} variant="solid">
            {checked ? "Active" : "Inactive"}
          </Badge>

          {/* Switch for Activation */}
          <>
            {console.log(user.id)}
            {console.log(status)}
            {console.log(checked)}
          </>
          {status === "inactive" && (
            <Switch
              colorScheme="green"
              isChecked={checked}
              isDisabled={!canActivate} // Disabled until admin grants permission
              onChange={() => {
                handleSwitchChange(user.id);
              }}
            />
          )}
          {/* Grant Permission Button */}
          {status === "inactive" && (
            <>
              {!canActivate && (
                <Button colorScheme="red" onClick={() => setCanActivate(true)}>
                  Active User
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>

      {/* Email & Refer ID */}
      <Flex flexDir="column" gap={3}>
        <Text fontStyle="italic">
          Email: <strong>{email}</strong>
        </Text>
        <Text fontStyle="italic">
          Refer ID: <strong>{referId}</strong>
        </Text>
      </Flex>

      {/* Buttons */}
      <Flex alignItems="center" gap={3}>
        {/* View Details Button */}
        <Button colorScheme="gray" variant="outline" onClick={onOpen}>
          View Details
        </Button>
      </Flex>

      {/* User Modal */}
      <UserModal isOpen={isOpen} onClose={onClose} user={user} />
    </Flex>
  );
};

const UserModal = ({ isOpen, onClose, user }: any) => {
  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"full"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader
          textAlign={"center"}
          fontSize={"30px"}
          fontWeight={"bolder"}
        >
          User Details
        </ModalHeader>
        <ModalCloseButton fontSize={"18px"} />
        <ModalBody p="4" bg="white" borderRadius="md">
          <Flex justifyContent="space-around">
            <Flex flexDir="column" w="45%">
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Name: <span style={{ marginLeft: "30px" }}>{user.name}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Email: <span style={{ marginLeft: "30px" }}>{user.email}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Gender:{" "}
                <span style={{ marginLeft: "30px" }}>{user.gender}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Mobile:{" "}
                <span style={{ marginLeft: "30px" }}>{user.mobile}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                PAN Card:{" "}
                <span style={{ marginLeft: "30px" }}>{user.pancard}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Status:{" "}
                <span style={{ marginLeft: "30px" }}>{user.status}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Role: <span style={{ marginLeft: "30px" }}>{user.role}</span>
              </Text>
            </Flex>

            <Flex flexDir="column" w="45%">
              {/* <Text fontSize="22px" fontWeight="bold" mb="2">
                Subscription:{" "}
                <span style={{ marginLeft: "30px" }}>{user.subscription}</span>
              </Text> */}
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Today's Income:{" "}
                <span style={{ marginLeft: "30px" }}>{user.today_income}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Total Income:{" "}
                <span style={{ marginLeft: "30px" }}>{user.total_income}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Total Withdraw:{" "}
                <span style={{ marginLeft: "30px" }}>
                  {user.total_withdraw}
                </span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Wallet:{" "}
                <span style={{ marginLeft: "30px" }}>{user.wallet}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Left Count:{" "}
                <span style={{ marginLeft: "30px" }}>{user.leftCount}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Right Count:{" "}
                <span style={{ marginLeft: "30px" }}>{user.rightCount}</span>
              </Text>
              <Text fontSize="22px" fontWeight="bold" mb="2">
                Refered User:{" "}
                <span style={{ marginLeft: "30px" }}>{user.totalRefered}</span>
              </Text>
            </Flex>
          </Flex>
          {/* Add more user details here */}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const NetworkMainComponent = ({
  users,
  loading,
  text,
  apiCall,
  setApiCall,
}: Props) => {
  const dummyUsers = [
    { id: 1, name: "User 1", stage: 5 },
    { id: 2, name: "User 2", stage: 8 },
    // Add more users with different stages
  ];
  if (loading) {
    return <Loading />;
  } else {
    return (
      <Box p={4} h={"100%"} overflow="hidden">
        <Flex p={4} justifyContent={"space-between"} h={"10%"}>
          <Text fontSize="2xl" mb={4}>
            {text}
          </Text>
          <Text fontSize="xl" mb={4}>
            Total {text}: <span style={{ color: "blue" }}>{users.length}</span>
          </Text>
        </Flex>
        {/* Make sure this container doesn't cause overflow */}
        <Box h={"90%"} overflow="auto" zIndex={0}>
          {users.map((user: any) => (
            <UserStage
              key={user.id}
              status={user.status}
              name={user.name}
              email={user.email}
              referId={user.referId}
              user={user}
              apiCall={apiCall}
              setApiCall={setApiCall}
            />
          ))}
        </Box>
      </Box>
    );
  }
};

export default NetworkMainComponent;
