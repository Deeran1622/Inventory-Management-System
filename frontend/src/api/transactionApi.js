import api from "./axios";

export const getTransactions       = ()           => api.get("/transactions");
export const getTransactionsByProduct = (product_id) => api.get(`/transactions?product_id=${product_id}`);
export const createTransaction     = (data)       => api.post("/transactions", data);