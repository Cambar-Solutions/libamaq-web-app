import apiClient from "../apiClient";

export const createMultimedia = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await apiClient.post("/l/media/upload", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    });

    if (data.result) {
      return data.result;
    }
    return data;
  } catch (error) {
    console.error('Error en createMultimedia:', error);
    console.error('Respuesta del servidor:', error.response?.data);
    throw error.response?.data || error.message;
  }
};
