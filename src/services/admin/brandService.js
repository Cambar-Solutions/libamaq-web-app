import apiClient from "../apiClient";

// Obtener todas las marcas
export const getAllBrands = async () => {
  try {
    console.log('Obteniendo todas las marcas...');
    const { data } = await apiClient.get("/admin/brand/all");
    console.log('Respuesta de marcas:', data);
    return data; // Devolver el objeto completo con type y result
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    throw error.response?.data || error.message;
  }
};

// Obtener todas las marcas activas
export const getAllActiveBrands = async () => {
  try {
    console.log('Obteniendo marcas activas...');
    const { data } = await apiClient.get("/admin/brand/all/active");
    console.log('Respuesta de marcas activas:', data);
    return data;
  } catch (error) {
    console.error('Error al obtener marcas activas:', error);
    throw error.response?.data || error.message;
  }
};

// Crear una nueva marca
export const createBrand = async (brandData) => {
  try {
    console.log('Creando nueva marca:', brandData);
    const { data } = await apiClient.post("/admin/brand/create", brandData);
    console.log('Respuesta de creación de marca:', data);
    return data;
  } catch (error) {
    console.error('Error al crear marca:', error);
    throw error.response?.data || error.message;
  }
};

// Actualizar una marca existente
export const updateBrand = async (brandData) => {
  try {
    console.log('Actualizando marca:', brandData);
    const { data } = await apiClient.put("/admin/brand/update", brandData);
    console.log('Respuesta de actualización de marca:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    throw error.response?.data || error.message;
  }
};

// Cambiar el estado de una marca (activar/desactivar)
export const changeBrandStatus = async (id, status) => {
  try {
    console.log(`Cambiando estado de marca ${id} a ${status}`);
    const brandData = {
      id: id,
      status: status
    };
    const { data } = await apiClient.put("/admin/brand/update", brandData);
    console.log('Respuesta de cambio de estado:', data);
    return data;
  } catch (error) {
    console.error('Error al cambiar estado de marca:', error);
    throw error.response?.data || error.message;
  }
};