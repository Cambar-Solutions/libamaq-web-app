import apiClient from "../apiClient";

export const getAllUsers = async () => {
  try {
    const response = await apiClient.get("/l/users");
    console.log('Respuesta completa getAllUsers:', response);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    throw error.response?.data || error.message;
  }
};

// El endpoint /l/users/staff no existe en la API actual
// export const getStaffUsers = async () => {
//   try {
//     const response = await apiClient.get("/l/users/staff");
//     console.log('Respuesta completa getStaffUsers:', response);
//     return response.data?.data || [];
//   } catch (error) {
//     console.error('Error en getStaffUsers:', error);
//     throw error.response?.data || error.message;
//   }
// };

export const getCustomerUsers = async () => {
  try {
    const response = await apiClient.get("/l/users");
    console.log('Respuesta completa getCustomerUsers:', response);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error en getCustomerUsers:', error);
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/l/users/${userId}`);
    console.log('Respuesta completa getUserById:', response);
    return response.data?.data || {};
  } catch (error) {
    console.error('Error en getUserById:', error);
    throw error.response?.data || error.message;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post("/l/users", userData);
    console.log('Respuesta completa createUser:', response);
    return response.data;
  } catch (error) {
    console.error('Error en createUser:', error);
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userData) => {
  try {
    const response = await apiClient.put("/l/users", userData);
    console.log('Respuesta completa updateUser:', response);
    return response.data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error.response?.data || error.message;
  }
};

export const sendCodeToEmail = async (email) => {
  try {
    const response = await apiClient.post("/l/users/send-code-email", null, {
      params: { email }
    });
    console.log('Respuesta completa sendCodeToEmail:', response);
    return response.data;
  } catch (error) {
    console.error('Error en sendCodeToEmail:', error);
    throw error.response?.data || error.message;
  }
};

export const verifyResetCode = async (email, code) => {
  try {
    const response = await apiClient.post("/l/users/verify-code", null, {
      params: { email, code }
    });
    console.log('Respuesta completa verifyResetCode:', response);
    return response.data;
  } catch (error) {
    console.error('Error en verifyResetCode:', error);
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await apiClient.post("/l/users/reset-password-with-code", null, {
      params: { email, code, newPassword }
    });
    console.log('Respuesta completa resetPassword:', response);
    return response.data;
  } catch (error) {
    console.error('Error en resetPassword:', error);
    throw error.response?.data || error.message;
  }
}; 