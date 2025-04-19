import apiClient from "../apiClient";

export const getAllCategories = async () => {
  try {
    const { data } = await apiClient.get("/admin/category/all");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 