import apiClient from "../apiClient";

export const uploadToCloudflare = async (files) => {
  const formData = new FormData();
  
  // Si es un solo archivo, lo convertimos a array
  const filesArray = Array.isArray(files) ? files : [files];
  
  // Agregamos cada archivo al FormData
  filesArray.forEach((file) => {
    formData.append('files', file);
  });

  const response = await apiClient.post('/l/cloudflare/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}; 