import axios from "axios";

export const canisterApiService = axios.create({
  baseURL: import.meta.env.VITE_POINTS_CANISTER_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const wavvApiService = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
