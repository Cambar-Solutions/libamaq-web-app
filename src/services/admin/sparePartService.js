import apiClient from "../apiClient";

export const getAllSpareParts = async (page = 1, size = 10) => {
  try {
    const { data } = await apiClient.get("/admin/sparePart/all", {
      params: { page, size }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSparePartById = async (id) => {
  try {
    const { data } = await apiClient.get(`/admin/sparePart/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createSparePart = async (sparePartData) => {
  try {
    const { data } = await apiClient.post("/admin/sparePart/create", sparePartData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateSparePart = async (sparePartData) => {
  try {
    const { data } = await apiClient.put("/admin/sparePart/update", sparePartData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 