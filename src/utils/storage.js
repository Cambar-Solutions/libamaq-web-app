// Constantes para las claves de almacenamiento
// Token
const AUTH_TOKEN_KEY = 'token';
const LEGACY_AUTH_TOKEN_KEY = 'auth_token';

// Datos de usuario
const USER_DATA_KEY = 'user_data';
const LEGACY_USER_DATA_KEY = 'user';

import { jwtDecode } from 'jwt-decode';

/**
 * Guarda el token de autenticación en localStorage
 * @param {string} token - Token de autenticación
 */
export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  // Limpiamos clave antigua si existía
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
};

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} Token de autenticación o null si no existe
 */
export const getAuthToken = () => {
  // Compatibilidad con clave antigua
  return localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
};

/**
 * Guarda los datos del usuario en localStorage
 * @param {Object} userData - Datos del usuario
 */
export const setUserData = (userData) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  localStorage.removeItem(LEGACY_USER_DATA_KEY);
};

/**
 * Obtiene los datos del usuario del localStorage
 * @returns {Object|null} Datos del usuario o null si no existen
 */
export const getUserData = () => {
  const dataStr = localStorage.getItem(USER_DATA_KEY) || localStorage.getItem(LEGACY_USER_DATA_KEY);
  return dataStr ? JSON.parse(dataStr) : null;
};

/**
 * Elimina todos los datos de autenticación del localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  localStorage.removeItem(LEGACY_USER_DATA_KEY);
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
  if (userData?.role) return userData.role;

  // Fallback: intentar decodificar el JWT para obtener el rol
  const token = getAuthToken();
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role || decoded.roles?.[0] || null;
  } catch {
    return null;
  }
};