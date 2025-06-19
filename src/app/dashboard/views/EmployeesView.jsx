import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useResetUserPassword,
} from '@/hooks/useUsers';
import { Pencil } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import ActionButtons from '@/components/ui/ActionButtons';
import { SearchBar } from '@/components/ui/SearchBar';

// Array estático de roles de empleados disponibles
const EMPLOYEE_ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'MANAGER', label: 'Gerente' }
];

export function EmployeesView() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: null,
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    status: "ACTIVE",
    role: "MANAGER" // Rol predeterminado para empleados
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Nuevo estado para el modal de contraseña
  const [employeeToChangePassword, setEmployeeToChangePassword] = useState(null); // Estado para el empleado a cambiar contraseña
  const [newPassword, setNewPassword] = useState(""); // Estado para la nueva contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Estado para confirmar contraseña
  const [newPasswordError, setNewPasswordError] = useState(""); // Estado para errores de nueva contraseña
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // Estado para errores de confirmar contraseña
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL"); // "ALL" para mostrar todos los roles

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Número de elementos por página (cambiado a 9)

  // Consulta para obtener todos los usuarios y filtrar solo los empleados
  const {
    data: allUsers = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useAllUsers();

  // Filtrar solo los empleados (DIRECTOR, PROVIDER, DELIVERY, ADMIN)
  const employees = Array.isArray(allUsers)
    ? allUsers.filter(user => user && EMPLOYEE_ROLES.some(role => role.value === user.role))
    : [];

  console.log('Usuarios totales:', allUsers);
  console.log('Empleados filtrados (iniciales):', employees);
  console.log('Roles de empleados permitidos (Frontend):', EMPLOYEE_ROLES);

  // Filtrar empleados basado en la búsqueda y el rol seleccionado
  const filteredEmployees = useMemo(() => {
    // Primero, filtrar por rol (si se ha seleccionado uno)
    let roleFiltered = selectedRole === "ALL"
      ? employees
      : employees.filter(employee => employee.role === selectedRole);

    // Luego, filtrar los resultados por la búsqueda
    if (!searchQuery) {
      return roleFiltered; // Si la búsqueda está vacía, devolver solo los filtrados por rol
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    return roleFiltered.filter(employee =>
      employee.name.toLowerCase().includes(lowerCaseQuery) ||
      employee.lastName.toLowerCase().includes(lowerCaseQuery) ||
      employee.email.toLowerCase().includes(lowerCaseQuery) ||
      employee.phoneNumber.includes(lowerCaseQuery)
    );
  }, [employees, searchQuery, selectedRole]); // Recalcular cuando employees, searchQuery o selectedRole cambien

  // Calcular los elementos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  // Manejador para el cambio en la barra de búsqueda
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    // Aquí podrías añadir lógica para filtrar inmediatamente o esperar a que se presione Enter/botón
  };

  // Manejador para el cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  // Manejador para el cambio en el filtro de rol
  const handleRoleFilterChange = (value) => {
    setSelectedRole(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value) => {
    setNewEmployee(prev => ({
      ...prev,
      status: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (employee) => {
    console.log('Editando empleado:', employee);
    setIsEditing(true);
    setNewEmployee({
      id: employee.id,
      nombre: employee.name,
      apellido: employee.lastName,
      email: employee.email,
      telefono: employee.phoneNumber,
      password: "",
      status: employee.status,
      role: employee.role // Usar el rol actual del empleado
    });
    setIsModalOpen(true);
  };

  // Nueva función para manejar el clic en "Cambiar Contraseña"
  const handleChangePasswordClick = (employee) => {
    setEmployeeToChangePassword(employee);
    setNewPassword(""); // Limpiar el campo de contraseña al abrir el modal
    setConfirmPassword(""); // Limpiar el campo de confirmar contraseña
    setNewPasswordError(""); // Limpiar errores
    setConfirmPasswordError(""); // Limpiar errores
    setIsPasswordModalOpen(true);
  };

  const resetForm = () => {
    setNewEmployee({
      id: null,
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      status: "ACTIVE",
      role: "MANAGER"
    });
    setIsEditing(false);
    setEmployeeToChangePassword(null); // Resetear empleado para cambiar contraseña
    setNewPassword(""); // Resetear la nueva contraseña
    setConfirmPassword(""); // Resetear confirmar contraseña
    setNewPasswordError(""); // Limpiar errores
    setConfirmPasswordError(""); // Limpiar errores
    setIsPasswordModalOpen(false); // Cerrar modal de contraseña
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Mutación para crear un empleado
  const createEmployeeMutation = useCreateUser();

  // Mutación para actualizar un empleado
  const updateEmployeeMutation = useUpdateUser();

  // Nueva mutación para restablecer contraseña (usada ahora por el modal específico)
  const resetPasswordMutation = useResetUserPassword();

  // Mutación para eliminar un empleado
  const deleteEmployeeMutation = useDeleteUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Datos base para crear o actualizar
    const userData = {
      email: newEmployee.email,
      name: newEmployee.nombre,
      lastName: newEmployee.apellido,
      phoneNumber: newEmployee.telefono,
      role: newEmployee.role,
      status: newEmployee.status
    };

    // Verificar que el rol sea uno de los permitidos para empleados
    if (!EMPLOYEE_ROLES.some(role => role.value === userData.role)) {
      toast.error(`Rol no válido: ${userData.role}. Roles permitidos: ${EMPLOYEE_ROLES.map(role => role.label).join(', ')}`);
      return;
    }

    if (isEditing) {
      // Para actualización, incluir el ID como número
      const updateData = {
        ...userData,
        id: Number(newEmployee.id), // Convertir a número
        // No incluir password si está vacío
        ...(newEmployee.password ? { password: newEmployee.password } : {})
      };

      console.log('Datos del empleado a actualizar:', updateData);
      updateEmployeeMutation.mutate(updateData, {
        onSuccess: () => {
          toast.success("Empleado actualizado correctamente");
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error("Error al registrar empleado");
          console.error('Error al registrar empleado:', error);
        }
      });
    } else {
      // Para creación, incluir campos adicionales
      const createData = {
        ...userData,
        createdBy: "1", // ID del usuario administrador
        createdAt: new Date().toISOString(),
        password: newEmployee.password // Password es obligatorio para crear
      };

      console.log('Datos del empleado a crear:', createData);
      console.log('Role a enviar en creación:', createData.role);
      createEmployeeMutation.mutate(createData, {
        onSuccess: () => {
          toast.success("Empleado registrado correctamente");
          setIsModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error("Error al registrar empleado");
          console.error('Error al registrar empleado:', error);
        }
      });
    }
  };

  // Función de validación de complejidad de contraseña
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
      return "La contraseña debe contener al menos una mayúscula.";
    }
    if (!/[a-z]/.test(password)) {
      return "La contraseña debe contener al menos una minúscula.";
    }
    if (!/[0-9]/.test(password)) {
      return "La contraseña debe contener al menos un número.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "La contraseña debe contener al menos un carácter especial.";
    }
    return ""; // Retorna cadena vacía si es válida
  };

  // Función para manejar el envío del formulario de cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    let valid = true;

    // Validar complejidad de la nueva contraseña
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setNewPasswordError(passwordError);
      valid = false;
    } else {
      setNewPasswordError("");
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Las contraseñas no coinciden.");
      valid = false;
    } else {
      setConfirmPasswordError("");
    }

    console.log('Password validation results:', {
      length: validatePassword(newPassword).includes('caracteres') ? validatePassword(newPassword) : 'OK',
      uppercase: validatePassword(newPassword).includes('mayúscula') ? validatePassword(newPassword) : 'OK',
      lowercase: validatePassword(newPassword).includes('minúscula') ? validatePassword(newPassword) : 'OK',
      number: validatePassword(newPassword).includes('número') ? validatePassword(newPassword) : 'OK',
      specialChar: validatePassword(newPassword).includes('carácter especial') ? validatePassword(newPassword) : 'OK',
      match: newPassword === confirmPassword ? 'OK' : 'Passwords do not match'
    });

    // Si alguna validación falla, detener el envío
    if (!valid) {
      return;
    }

    // Si las validaciones pasan, proceder con la mutación
    if (employeeToChangePassword?.id && newPassword) {
      resetPasswordMutation.mutate({ userId: employeeToChangePassword.id, newPassword }, {
        onSuccess: () => {
          toast.success("Contraseña actualizada correctamente");
          setIsPasswordModalOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error("Error al actualizar contraseña");
          console.error('Error al actualizar contraseña:', error);
        }
      });
    } else {
      // Esto debería ser manejado por validación, pero como fallback
      toast.error("Ocurrió un error. Intenta de nuevo.");
    }
  };

  return (
    <>
      {/* Contenedor para alinear la barra de búsqueda, el filtro de rol y el botón de registro */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
        {/* Barra de búsqueda y filtro en un contenedor flex para que estén uno al lado del otro en pantallas grandes */}
        <div className="flex w-full sm:w-auto gap-4 items-center flex-grow">
          <div className="flex-grow">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder="Buscar empleado..."
              // Ajustar className si es necesario para que ocupe el espacio en el flex-grow
              className="w-full"
            />
          </div>

          {/* Filtro de rol */}
          <div className="flex-shrink-0 w-40">
            <Select
              value={selectedRole}
              onValueChange={handleRoleFilterChange}
            >
              <SelectTrigger className="w-full bg-white rounded-full">
                <SelectValue placeholder="Filtrar por Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los roles</SelectItem>
                {EMPLOYEE_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón de registro */}
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-end sm:justify-start">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer w-full sm:w-auto"
          >
            + Registrar empleado
          </button>
        </div>
      </div>

      <div className="rounded-md border">
        {isLoadingUsers ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Cargando empleados...</p>
          </div>
        ) : usersError ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">Error al cargar los empleados. Intenta de nuevo.</p>
          </div>
        ) : (
          <>
            {/* Vista de tabla solo para pantallas grandes */}
            <div className="hidden lg:block">
              <Table className="bg-white">
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                        {searchQuery || selectedRole !== "ALL" ? "No se encontraron empleados que coincidan" : "No hay empleados registrados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {`${employee.name} ${employee.lastName}`}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            employee.role === 'ADMIN' 
                              ? 'bg-blue-100 text-blue-800' // Color para Admin (ej. azul)
                              : 'bg-purple-100 text-purple-800' // Color para Manager (ej. morado)
                          }`}>
                            {EMPLOYEE_ROLES.find(role => role.value === employee.role)?.label || employee.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {employee.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(employee.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <ActionButtons
                            showView={false}
                            showEdit={true}
                            showDelete={true}
                            onEdit={() => handleEdit(employee)}
                            onDelete={() => {
                              if (window.confirm(`¿Estás seguro de que quieres eliminar a ${employee.name} ${employee.lastName}?`)) {
                                deleteEmployeeMutation.mutate(employee.id);
                              }
                            }}
                            editTitle="Editar Empleado"
                            deleteTitle="Eliminar"
                            onChangePassword={() => handleChangePasswordClick(employee)}
                            showChangePassword={true}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Vista de tarjetas para dispositivos móviles y tablets */}
            <div className="lg:hidden">
              {currentItems.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  {searchQuery || selectedRole !== "ALL" ? "No se encontraron empleados que coincidan" : "No hay empleados registrados"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4">
                  {currentItems.map((employee) => (
                    <div
                      key={employee.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{`${employee.name} ${employee.lastName}`}</h3>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {employee.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                            </span>
                            <Badge className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              employee.role === 'ADMIN'
                                ? 'bg-blue-100 text-blue-800' // Color para Admin (ej. azul)
                                : 'bg-purple-100 text-purple-800' // Color para Manager (ej. morado)
                            }`}>
                              {EMPLOYEE_ROLES.find(role => role.value === employee.role)?.label || employee.role}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Email:</span>
                            <span className="text-gray-900 truncate">{employee.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Teléfono:</span>
                            <span className="text-gray-900">{employee.phoneNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Registrado:</span>
                            <span className="text-gray-900">{formatDate(employee.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-center">
                          <ActionButtons
                            showView={false}
                            showEdit={true}
                            showDelete={true}
                            onEdit={() => handleEdit(employee)}
                            onDelete={() => {
                              if (window.confirm(`¿Estás seguro de que quieres eliminar a ${employee.name} ${employee.lastName}?`)) {
                                deleteEmployeeMutation.mutate(employee.id);
                              }
                            }}
                            editTitle="Editar"
                            deleteTitle="Eliminar"
                            onChangePassword={() => handleChangePasswordClick(employee)}
                            showChangePassword={true}
                            className="!bg-transparent hover:!bg-blue-50 border border-blue-200 !text-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Controles de paginación */}
      {filteredEmployees.length > itemsPerPage && (
        <div className="flex justify-center items-center space-x-2 mt-1 -ml-20">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Siguiente
          </Button>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) && (
              <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                Procesando solicitud...
              </div>
            )}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={newEmployee.nombre}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apellido" className="text-right">
                  Apellido
                </Label>
                <Input
                  id="apellido"
                  name="apellido"
                  value={newEmployee.apellido}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={newEmployee.telefono}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="+52..."
                />
              </div>
              {!isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={newEmployee.password}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Select
                  value={newEmployee.role}
                  onValueChange={(value) => setNewEmployee(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={newEmployee.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3 cursor-pointer">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE" className="cursor-pointer">Activo</SelectItem>
                      <SelectItem value="INACTIVE" className="cursor-pointer">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                className="cursor-pointer"
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Cambiar Contraseña */}
      <Dialog open={isPasswordModalOpen} onOpenChange={() => setIsPasswordModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña de {employeeToChangePassword?.name} {employeeToChangePassword?.lastName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            {resetPasswordMutation.isPending && (
              <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                Actualizando contraseña...
              </div>
            )}
            <div className="grid gap-y-4 py-4">
              {/* Campo Nueva Contraseña */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="new-password" className="text-right">
                  Nueva Contraseña
                </Label>
                <div className="col-span-3 w-full flex flex-col">
                  <Input
                    id="new-password"
                    name="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full ${newPasswordError ? 'border-red-500' : ''}`}
                    required
                  />
                  {newPasswordError && (
                    <p className="text-sm text-red-500 mt-1">{newPasswordError}</p>
                  )}
                  {!newPasswordError && (
                    <p className="text-xs text-gray-500 mt-1">
                      Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
                    </p>
                  )}
                </div>
              </div>

              {/* Campo Confirmar Contraseña */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="confirm-password" className="text-right">
                  Confirmar Contraseña
                </Label>
                <div className="col-span-3 w-full flex flex-col">
                  <Input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ${confirmPasswordError ? 'border-red-500' : ''}`}
                    required
                  />
                  {confirmPasswordError && (
                    <p className="text-sm text-red-500 mt-1">{confirmPasswordError}</p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending || !newPassword}
                className="cursor-pointer"
              >
                Actualizar Contraseña
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          // Estilos por defecto para todos los toasts
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          // Estilos específicos para toasts de éxito
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          // Estilos específicos para toasts de error
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
