import { authInstance } from "../Axios/Axios";

export const navigation = (path: string, navigate: any) => {
  navigate(path);
};
export const formatAmountToINR = (amount: number) => {
  // Use toLocaleString to add commas as thousand separators
  const formattedAmount = amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
  return formattedAmount;
};

export const getTurnOver = async (id: number, token: string) => {
  console.log(token);
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const config = {
    headers: headers,
  };
  let res = await authInstance.get(`/getTurnover/${id}`, config);
  console.log(res.data.message.totalTurnOver);
  return res.data.message.totalTurnOver;
};

export const allUsers = async (setLoading: any) => {
  setLoading(true);
  let res = await authInstance.get("/users");
  setLoading(false);
  return res.data.Users;
};
export const allOrders = async (setLoading: any, id: Number, config: any) => {
  setLoading(true);
  let res = await authInstance.get(`/getAllOrderAdmin/${id}`, config);
  setLoading(false);
  // console.log(res);
  if (res.data.result) {
    return res.data.result;
  } else {
    return [];
  }
};

export const getCategory = async () => {
  let res = await authInstance.get("/allCategory");
  // console.log(res.data.categories);
  return res.data.categories;
};
