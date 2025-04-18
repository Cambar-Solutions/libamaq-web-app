import apiClient from "../apiClient";

export const getAllUsers = async () => {
  try {
    const { data } = await apiClient.get("/admin/user/all");
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getStaffUsers = async () => {
  try {
    const { data } = await apiClient.get("/admin/user/staff");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getCustomerUsers = async () => {
  try {
    const { data } = await apiClient.get("/admin/user/customers");
    return data.result || [];
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getUserById = async (id) => {
  try {
    const { data } = await apiClient.get(`/admin/user/${id}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createUser = async (userData) => {
  try {
    const { data } = await apiClient.post("/admin/user/create", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (userData) => {
  try {
    const { data } = await apiClient.put("/admin/user/update", userData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendCodeToEmail = async (email) => {
  try {
    const { data } = await apiClient.post("/admin/user/sendCodeToEmail", null, {
      params: { email }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyResetCode = async (email, code) => {
  try {
    const { data } = await apiClient.post("/admin/user/verifyResetCode", null, {
      params: { email, code }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    const { data } = await apiClient.post("/admin/user/resetPassword", null, {
      params: { email, code, newPassword }
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 