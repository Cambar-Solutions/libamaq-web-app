// Constantes para las claves de almacenamiento
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Guarda el token de autenticación en localStorage
 * @param {string} token - Token de autenticación
 */
export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} Token de autenticación o null si no existe
 */
export const getAuthToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Guarda los datos del usuario en localStorage
 * @param {Object} userData - Datos del usuario
 */
export const setUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Obtiene los datos del usuario del localStorage
 * @returns {Object|null} Datos del usuario o null si no existen
 */
export const getUserData = () => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Elimina todos los datos de autenticación del localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si el usuario está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Guarda la respuesta completa del servidor en localStorage
 * @param {Object} response - Respuesta del servidor
 */
export const saveAuthResponse = (response) => {
  if (response?.data?.access_token) {
    setAuthToken(response.data.access_token);
  }
  if (response?.data?.user) {
    setUserData(response.data.user);
  }
};

/**
 * Obtiene el rol del usuario actual
 * @returns {string|null} Rol del usuario o null si no está autenticado
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
}; 