import api from "./axios";

export const getProducts     = ()         => api.get("/products");
export const getProductById  = (id)       => api.get(`/products/${id}`);
export const getLowStock     = ()         => api.get("/products/low-stock");
export const createProduct   = (data)     => api.post("/products", data);
export const updateProduct   = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct   = (id)       => api.delete(`/products/${id}`);