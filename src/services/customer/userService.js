import apiClient from "../apiClient";

export const getUserById = async (id) => {
  try {
    const { data } = await apiClient.get(`/customer/user/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userData) => {
  try {
    const { data } = await apiClient.put("/customer/user/update", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendCodeToEmail = async (email) => {
  try {
    const { data } = await apiClient.post("/customer/user/sendCodeToEmail", null, {
      params: { email }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyResetCode = async (email, code) => {
  try {
    const { data } = await apiClient.post("/customer/user/verifyResetCode", null, {
      params: { email, code }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const { data } = await apiClient.post("/customer/user/resetPassword", null, {
      params: { email, code, newPassword }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 