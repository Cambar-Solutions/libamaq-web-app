import apiClient from "../apiClient";

export const getAllProducts = async () => {
  try {
    const { data } = await apiClient.get("/admin/product/all");
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductPreviews = async () => {
  try {
    const { data } = await apiClient.get("/admin/product/preview/all");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductById = async (id) => {
  try {
    const { data } = await apiClient.get(`/admin/product/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createProduct = async (productData) => {
  try {
    const { data } = await apiClient.post("/admin/product/create", productData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateProduct = async (productData) => {
  try {
    const { data } = await apiClient.put("/admin/product/update", productData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 