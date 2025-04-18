import apiClient from "../apiClient";

export const getAllBrands = async (page, size) => {
  try {
    const { data } = await apiClient.get("/admin/brand/all", {
      params: { page, size }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 