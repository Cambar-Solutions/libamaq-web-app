import apiClient from "../apiClient";

export const generateDescriptionIA = async (query, type = "PRODUCT") => {
  // Añadimos 'type' con un valor por defecto
  try {
    const response = await apiClient.post("/l/ia/generate-description", { query, type });
    console.log('Respuesta completa generateDescriptionIA:', response);
    // Asumiendo que la descripción está directamente en response.data.data
    return response.data?.data || ''; // Devolver un string vacío si no hay datos
  } catch (error) {
    console.error('Error en generateDescriptionIA:', error);
    // Mejorar el manejo de errores para que devuelva un mensaje más claro
    throw error.response?.data?.message || error.message || "Error al generar la descripción.";
  }
};