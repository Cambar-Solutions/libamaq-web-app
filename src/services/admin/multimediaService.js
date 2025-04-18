import apiClient from "../apiClient";

export const createMultimedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post("/admin/multimedia/create", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 