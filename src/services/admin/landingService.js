import apiClient from "../apiClient";

// Crear nuevo landing (sin archivo, solo datos)
export const createLanding = async (landingData) => {
  try {
    const { data } = await apiClient.post("/admin/landing/create", landingData);
    return data.result || data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Subir archivo multimedia (por separado)
export const uploadLandingFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await apiClient.post("/admin/landing/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Accept": "application/json",
      },
    });

    return data.result || data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Actualizar un landing
export const updateLanding = async (landingData) => {
  try {
    const { data } = await apiClient.put("/admin/landing/update", landingData);
    return data.result || data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener un landing por ID
export const getLandingById = async (id) => {
  try {
    const { data } = await apiClient.get(`/admin/landing/${id}`);
    return data.result || data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Obtener todos los elementos activos
export const getAllActiveLandings = async () => {
  try {
    const { data } = await apiClient.get("/api/public/landing/all");
    return data.result || data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
