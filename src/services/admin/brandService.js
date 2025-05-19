import apiClient from "../apiClient";
import axios from "axios";

// Obtener todas las marcas con sus categorías
export const getAllBrands = async () => {
  try {
    console.log('Obteniendo todas las marcas con categorías...');
    const { data } = await apiClient.get("/l/brands/categories");
    console.log('Respuesta de marcas con categorías:', data);
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
    const { data } = await apiClient.get("/l/brands/active");
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
    const { data } = await apiClient.post("/l/brands", brandData);
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
    console.log('Actualizando marca:', JSON.stringify(brandData, null, 2));
    const { data } = await apiClient.put("/l/brands", brandData);
    console.log('Respuesta de actualización de marca:', data);
    return data;
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    console.error('Detalles del error:', error.response?.data);
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
    const { data } = await apiClient.put("/l/brands", brandData);
    console.log('Respuesta de cambio de estado:', data);
    return data;
  } catch (error) {
    console.error('Error al cambiar estado de marca:', error);
    throw error.response?.data || error.message;
  }
};