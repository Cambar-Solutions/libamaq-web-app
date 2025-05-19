import apiClient from "../apiClient";

export const createUser = async (userData) => {
  try {
    const { data } = await apiClient.post("/l/users/register", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendCodeToEmail = async (email) => {
  try {
    const { data } = await apiClient.post("/l/users/send-code-email", null, {
      params: { email }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyResetCode = async (email, code) => {
  try {
    const { data } = await apiClient.post("/l/users/verify-code", null, {
      params: { email, code }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const { data } = await apiClient.post("/l/users/reset-password-with-code", null, {
      params: { email, code, newPassword }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 