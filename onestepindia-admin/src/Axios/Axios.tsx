import axios, { AxiosInstance } from "axios";
// import React from "react";

// const baseURL: string = "http://localhost:8080/api/v1";
const baseURL: string = "http://localhost:8080/api/v1";
// const transformRequest = (data: any, headers: any) => {
//   // Create a copy of the data object to modify it
//   const modifiedData = { ...data };

//   // Check if the payload contains a password field
//   if (modifiedData.password) {
//     // Mask or remove the password value
//     modifiedData.password = "********"; // Replace with your preferred masking or removal logic
//   }

//   // Return the modified payload
//   return JSON.stringify(modifiedData);
// };
export const authInstance: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: { "Content-Type": "application/json" },
  maxBodyLength: Infinity,
});
