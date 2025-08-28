import { Box } from "@chakra-ui/react";
import NetworkMainComponent from "../NetworkPage/NetworkMainComponent";
import { useContext } from "react";
import LoadingContext from "../../context/Loading/LoadingContext";

type props = {
  users: any;
  apiCall: boolean;
  setApiCall: (value: boolean) => void;
};
const AllMembers = ({ users, apiCall, setApiCall }: props) => {
  const { loading } = useContext(LoadingContext);
  return (
    <Box h={"100%"}>
      <NetworkMainComponent
        users={users}
        loading={loading}
        text={"All Users"}
        apiCall={apiCall}
        setApiCall={setApiCall}
      />
    </Box>
  );
};
export default AllMembers;
