import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer/Footer";
import { allOrders } from "../Components/CommonFunction";
import LoadingContext from "../context/Loading/LoadingContext";
import AllOrders from "../Components/OrdersPage/AllOrders";
import LoginContext from "../context/Login/LoginContext";

type Props = {};

const Orders = (props: Props) => {
  const [orders, setOrders] = useState([]);
  const { loading, setLoading } = useContext(LoadingContext);
  const { token, currentUser } = useContext(LoginContext);
  const params = useParams();
  console.log(params);
  console.log(currentUser.id);
  const headers = { Authorization: `Bearer ${token}` };
  const config = { headers: headers };
  const getData = async () => {
    let res = await allOrders(setLoading, currentUser.id, config);
    setOrders(res);
  };
  useEffect(() => {
    getData();
  }, []);

  document.title = `Orders ShoppingBoom`;
  return (
    <Flex
      // bg={""}
      // bgImage={
      //   "https://plus.unsplash.com/premium_photo-1671570756033-97f3cd4e9cb5?auto=format&fit=crop&q=60&w=900&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3BsYXNoJTIwaW1hZ2V8ZW58MHx8MHx8fDA%3D"
      // }
      // bgRepeat={"no-repeat"}
      h={"100vh"}
      minW={"100vw"}
      // backgroundSize={"cover"}
    >
      <Box w={"20%"} border={"1px solid red"} p={2}>
        <Sidebar />
      </Box>
      <Box w={"80%"} h={"100%"}>
        <Navbar scrollTop={true} />
        {params.id === "allOrders" ? (
          <AllOrders orders={orders} text={"Orders"} config={config} />
        ) : params.id === "allPending" ? (
          <>
            {(() => {
              const pendingOrder = orders.filter(
                (el: any) => el.pymentStatus === 0
              );
              return (
                <AllOrders
                  orders={pendingOrder}
                  text={"Pending Orders"}
                  config={config}
                />
              );
            })()}
          </>
        ) : params.id === "allDone" ? (
          <>
            {(() => {
              const pendingOrder = orders.filter(
                (el: any) => el.pymentStatus === 1
              );
              return (
                <AllOrders
                  orders={pendingOrder}
                  text={"Pending Orders"}
                  config={config}
                />
              );
            })()}
          </>
        ) : (
          //    : params.id === "allInActive" ? (
          //   <InactiveMembers users={users} />
          // )
          <Box>Error Page</Box>
        )}
        <Footer />
      </Box>
    </Flex>
  );
  // if (params.id === "addProduct") {
  //   // return <AddProduct />;
  // } else if (params.id === "allProducts") {
  //   return <AllProducts />;
  // } else if (params.id === "blockedProducts") {
  //   return <BlockedProducts />;
  // } else {
  //   return <Box>Error Page</Box>;
  // }
};

export default Orders;
