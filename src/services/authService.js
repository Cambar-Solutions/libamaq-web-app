import apiClient from "./apiClient";

/**
 * Servicio para gestionar la autenticación de usuarios
 */

/**
 * Inicia sesión con credenciales de usuario
 * @param {string} email - Correo electrónico del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<Object>} - Datos del usuario autenticado y token
 */
export const login = async (email, password) => {
  try {
    const { data } = await apiClient.post("/l/auth/login", { email, password });
    
    // Si la autenticación es exitosa, guardar el token en localStorage
    if (data.result && data.result.token) {
      localStorage.setItem("token", data.result.token);
      localStorage.setItem("user", JSON.stringify(data.result.user));
    }
    
    return data;
  } catch (error) {
    console.error("Error en inicio de sesión:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Cierra la sesión del usuario actual
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {Object|null} - Datos del usuario o null si no hay usuario autenticado
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Error al parsear datos de usuario:", e);
    return null;
  }
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario a registrar
 * @returns {Promise<Object>} - Datos del usuario registrado
 */
export const register = async (userData) => {
  try {
    const { data } = await apiClient.post("/l/users/register", userData);
    return data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Envía un código de verificación al correo electrónico del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const sendVerificationCode = async (userId) => {
  try {
    const { data } = await apiClient.post(`/l/users/send-code-email/${userId}`);
    return data;
  } catch (error) {
    console.error("Error al enviar código de verificación:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Restablece la contraseña de un usuario con código de verificación
 * @param {Object} resetData - Datos para restablecer la contraseña
 * @param {string} resetData.email - Correo electrónico del usuario
 * @param {string} resetData.code - Código de verificación
 * @param {string} resetData.newPassword - Nueva contraseña
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const resetPasswordWithCode = async (resetData) => {
  try {
    const { data } = await apiClient.post("/l/users/reset-password-with-code", resetData);
    return data;
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    throw error.response?.data || error.message;
  }
};

/**
 * Solicita restablecer la contraseña (sin código)
 * @param {Object} resetData - Datos para solicitar restablecimiento
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export const resetPassword = async (resetData) => {
  try {
    const { data } = await apiClient.post("/l/users/reset-password", resetData);
    return data;
  } catch (error) {
    console.error("Error al solicitar restablecimiento de contraseña:", error);
    throw error.response?.data || error.message;
  }
};
