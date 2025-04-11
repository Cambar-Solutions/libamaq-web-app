import axios from 'axios';

const API_URL = 'https://libamaq.com/api';

export const createEmployee = async (employeeData) => {
  try {
    const response = await axios.post(`${API_URL}/admin/user/create`, {
      name: employeeData.nombre,
      lastName: employeeData.apellido,
      email: employeeData.email,
      phoneNumber: employeeData.telefono,
      password: employeeData.password,
      role: "EMPLOYEE",
      status: "ACTIVE",
      code: employeeData.code
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateEmployee = async (employeeData) => {
  try {
    const response = await axios.put(`${API_URL}/employee/user/update`, {
      id: employeeData.id,
      name: employeeData.nombre,
      lastName: employeeData.apellido,
      email: employeeData.email,
      phoneNumber: employeeData.telefono,
      password: employeeData.password || undefined, // Solo enviar si hay nueva contraseña
      role: "EMPLOYEE",
      status: employeeData.status
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployees = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/user/all`);
    // Filtrar solo los usuarios que son empleados
    const employees = response.data.result.filter(user => user.role === "EMPLOYEE");
    return employees;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
