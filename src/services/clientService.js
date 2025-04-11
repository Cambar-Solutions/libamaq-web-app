import axios from 'axios';

const API_URL = 'https://libamaq.com/api';

export const createClient = async (clientData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/user/create`, {
      name: clientData.nombre,
      lastName: clientData.apellido,
      email: clientData.email,
      phoneNumber: clientData.telefono,
      password: clientData.password,
      role: "FREQUENT_CUSTOMER",
      status: "ACTIVE",
      code: clientData.code
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateClient = async (clientData) => {
  try {
    const response = await axios.put(`${API_URL}/employee/user/update`, {
      id: clientData.id,
      name: clientData.nombre,
      lastName: clientData.apellido,
      email: clientData.email,
      phoneNumber: clientData.telefono,
      password: clientData.password || undefined,
      role: "FREQUENT_CUSTOMER",
      status: clientData.status
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getClients = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/user/all`);
    // Filtrar solo los usuarios que son clientes frecuentes
    const clients = response.data.result.filter(user => user.role === "FREQUENT_CUSTOMER");
    return clients;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
