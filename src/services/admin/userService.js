import apiClient from "../apiClient";

export const getAllUsers = async () => {
  try {
    const { data } = await apiClient.get("/l/users");
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStaffUsers = async () => {
  try {
    const { data } = await apiClient.get("/l/users/staff");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCustomerUsers = async () => {
  try {
    const { data } = await apiClient.get("/l/users");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (userId) => {
  try {
    const { data } = await apiClient.get(`/l/users/${userId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createUser = async (userData) => {
  try {
    const { data } = await apiClient.post("/l/users", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userData) => {
  try {
    const { data } = await apiClient.put("/l/users", userData);
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