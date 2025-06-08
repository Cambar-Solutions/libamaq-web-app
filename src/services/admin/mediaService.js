import apiClient from "../apiClient";

/**
 * Sube una o más imágenes al servidor
 * @param {File|File[]} files - Archivo o array de archivos a subir
 * @returns {Promise<Array<{id: number, url: string}>>} Array con los IDs y URLs de las imágenes subidas
 */
const uploadImages = async (files) => {
  const filesArray = Array.isArray(files) ? files : [files];
  const formData = new FormData();
  
  filesArray.forEach(file => formData.append('files', file));
  
  const { data } = await apiClient.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  // Mapeamos la respuesta para devolver solo lo necesario
  return data.data.map(media => ({
    id: parseInt(media.id, 10), // Aseguramos que sea un número
    url: media.url,
    fileType: media.fileType
  }));
};

/**
 * Elimina imágenes por sus IDs
 * @param {number|number[]} ids - ID o array de IDs de las imágenes a eliminar
 * @returns {Promise<Object>} Resultado de la operación
 */
const deleteImages = async (ids) => {
  const idsArray = Array.isArray(ids) ? ids : [ids];
  const { data } = await apiClient.post('/media/delete', idsArray);
  return data;
};

export default {
  uploadImages,
  deleteImages
};