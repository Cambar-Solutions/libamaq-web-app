import apiClient from "./apiClient";

export const createEmployee = async (employeeData) => {
  try {
    const { data } = await apiClient.post("/l/users", {
      name: employeeData.nombre,
      lastName: employeeData.apellido,
      email: employeeData.email,
      phoneNumber: employeeData.telefono,
      password: employeeData.password,
      role: "EMPLOYEE",
      status: "ACTIVE",
      code: employeeData.code
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateEmployee = async (employeeData) => {
  try {
    const { data } = await apiClient.put("/l/users", {
      id: employeeData.id,
      name: employeeData.nombre,
      lastName: employeeData.apellido,
      email: employeeData.email,
      phoneNumber: employeeData.telefono,
      password: employeeData.password || undefined,
      role: "EMPLOYEE",
      status: employeeData.status
    });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getEmployees = async () => {
  try {
    const { data } = await apiClient.get("/l/users");
    const employees = data.result.filter(user => user.role === "EMPLOYEE");
    return employees;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
