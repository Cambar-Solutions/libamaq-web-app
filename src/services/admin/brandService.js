import apiClient from "../apiClient";

export const getAllBrands = async () => {
  try {
    const { data } = await apiClient.get("/admin/brand/all");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 