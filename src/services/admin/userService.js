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
    // Filtrar solo los usuarios con rol GENERAL_CUSTOMER o FREQUENT_CUSTOMER
    const customers = Array.isArray(response.data?.data) 
      ? response.data.data.filter(user => user.role === 'GENERAL_CUSTOMER' || user.role === 'FREQUENT_CUSTOMER') 
      : [];
    console.log('Clientes filtrados:', customers);
    return customers;
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

// Nueva función para resetear la contraseña de un usuario
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const response = await apiClient.post("/l/users/reset-password", {
      id: userId,
      password: newPassword,
    });
    console.log('Respuesta completa resetUserPassword:', response);
    return response.data;
  } catch (error) {
    console.error('Error en resetUserPassword:', error);
    throw error.response?.data || error.message;
  }
};

// Nueva función para obtener todos los usuarios activos
export const getAllActiveUsers = async () => {
  try {
    const response = await apiClient.get("/l/users/active");
    console.log('Respuesta completa getAllActiveUsers:', response);
    return response.data?.data || [];
  } catch (error) {
    console.error('Error en getAllActiveUsers:', error);
    throw error.response?.data || error.message;
  }
};

// Nueva función para obtener un usuario por email
export const getUserByEmail = async (email) => {
  try {
    const response = await apiClient.get(`/l/users/email/${email}`);
    console.log('Respuesta completa getUserByEmail:', response);
    return response.data?.data || null;
  } catch (error) {
    console.error('Error en getUserByEmail:', error);
    throw error.response?.data || error.message;
  }
};

// Nueva función para eliminar un usuario por ID
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/l/users/delete/${userId}`);
    console.log('Respuesta completa deleteUser:', response);
    return response.data;
  } catch (error) {
    console.error('Error en deleteUser:', error);
    throw error.response?.data || error.message;
  }
};

// Nueva función para registrar un nuevo usuario
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post("/l/users/register", userData);
    console.log('Respuesta completa registerUser:', response);
    return response.data;
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error.response?.data || error.message;
  }
};

// La función resetUserPassword ya existe (usa /l/users/reset-password)

// La función sendCodeToEmail existente usa /l/users/send-code-email sin userId.
// Basado en la imagen del endpoint /l/users/send-code-email/{userId}, crearé una nueva función.
export const sendCodeToUserEmail = async (userId) => {
  try {
    const response = await apiClient.post(`/l/users/send-code-email/${userId}`);
    console.log('Respuesta completa sendCodeToUserEmail:', response);
    return response.data;
  } catch (error) {
    console.error('Error en sendCodeToUserEmail:', error);
    throw error.response?.data || error.message;
  }
};

// La función resetPassword existente usa /l/users/reset-password-with-code.
// Basado en la imagen, crearé una nueva función con un nombre más descriptivo si es necesario.
// Pero mantendré la existente y crearé un hook para ella.

// Nueva función para enviar código de verificación via WhatsApp
export const sendVerificationCode = async (userId) => {
  try {
    const response = await apiClient.post(`/l/users/send-verification-code/${userId}`); // Asumiendo que necesita userId
    console.log('Respuesta completa sendVerificationCode:', response);
    return response.data;
  } catch (error) {
    console.error('Error en sendVerificationCode:', error);
    throw error.response?.data || error.message;
  }
};

// La función verifyResetCode existente usa /l/users/verify-code.
// Basado en la imagen, crearé una nueva función con un nombre más descriptivo si es necesario.
// Pero mantendré la existente y crearé un hook para ella.

// Nueva función para actualizar perfil de usuario
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await apiClient.put(`/l/users/update-profile/${userId}`, profileData);
    console.log('Respuesta completa updateUserProfile:', response);
    return response.data;
  } catch (error) {
    console.error('Error en updateUserProfile:', error);
    throw error.response?.data || error.message;
  }
};

// Nueva función para obtener estadísticas de clientes
export const getCustomerStatistics = async () => {
  try {
    const response = await apiClient.get("/l/users/stats/customers");
    console.log('Respuesta completa getCustomerStatistics:', response);
    return response.data?.data || {};
  } catch (error) {
    console.error('Error en getCustomerStatistics:', error);
    throw error.response?.data || error.message;
  }
}; 