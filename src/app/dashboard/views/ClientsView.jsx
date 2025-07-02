import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import toast, { Toaster } from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { getCustomerUsers, createUser, updateUser, resetUserPassword, deleteUser } from "@/services/admin/userService";
import { Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDeleteUser } from '../../../hooks/useUsers';
import ActionButtons from '@/components/ui/ActionButtons';
import { SearchBar } from '@/components/ui/SearchBar';
import { Loader2 } from "lucide-react";


export function ClientsView() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newClient, setNewClient] = useState({
    id: null,
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    status: "ACTIVE",
    role: "CUSTOMER"
  });
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [nombreError, setNombreError] = useState(false);
  const [apellidoError, setApellidoError] = useState(false);
  const [clientToChangePassword, setClientToChangePassword] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para la búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  // Estado para el filtro de rol
  const [selectedRole, setSelectedRole] = useState("ALL"); // "ALL" para mostrar todos los roles

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Número de elementos por página (cambiado a 9)

  // Inicializar la mutación de eliminación
  const deleteClientMutation = useDeleteUser();

  // Consulta para obtener los clientes
  const { 
    data: clients = [], 
    isLoading: isLoadingClients,
    error: clientsError 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getCustomerUsers,
    onSuccess: (data) => {
      console.log('Clientes cargados:', data);
    },
    onError: (error) => {
      toast.error("Error al cargar clientes");
      console.error('Error al cargar clientes:', error);
    }
  });

  // Filtrar clientes basado en la búsqueda y el rol seleccionado
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Filtrar por búsqueda
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(lowerCaseQuery) ||
        client.lastName.toLowerCase().includes(lowerCaseQuery) ||
        client.email.toLowerCase().includes(lowerCaseQuery) ||
        client.phoneNumber.includes(lowerCaseQuery)
      );
    }

    // Filtrar por rol
    if (selectedRole !== "ALL") {
      filtered = filtered.filter(client => client.role === selectedRole);
    }

    return filtered;
  }, [clients, searchQuery, selectedRole]); // Recalcular cuando clients, searchQuery o selectedRole cambien

  // Calcular los elementos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClients.slice(indexOfFirstItem, indexOfLastItem);

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Validaciones en tiempo real
    let isValid = true;
    if (name === 'nombre' || name === 'apellido') {
      // Permitir solo letras y espacios
      isValid = /^[a-zA-Z\s]*$/.test(value);
      if (name === 'nombre') setNombreError(!isValid);
      if (name === 'apellido') setApellidoError(!isValid);
    } else if (name === 'telefono') {
      // Limitar a 13 caracteres
      if (value.length > 13) {
        return;
      }
      // Permitir solo dígitos y + (la validación de lada se hace al guardar/cambiar lada)
      isValid = /^[0-9+]*$/.test(value);
      setPhoneError(!isValid);

      // No actualizar el estado si la entrada no es válida para telefono (evitar caracteres inválidos)
      if (!isValid) {
        return; 
      }

      // Si la entrada es válida, actualizar el estado del teléfono
      setNewClient(prev => ({
        ...prev,
        [name]: value
      }));

      // La validación de lada se hará al guardar
      setPhoneError(false); // Limpiar error visual en tiempo real si la entrada es válida
      return; // Salir para no duplicar la actualización del estado
    }

    // No actualizar el estado si la entrada no es válida para nombre o apellido
    if (!isValid && (name === 'nombre' || name === 'apellido')) {
      return; 
    }

    // Limpiar error específico si el campo es válido globalmente (para nombre y apellido)
     if (name === 'nombre' && isValid) { setNombreError(false); }
     if (name === 'apellido' && isValid) { setApellidoError(false); }

    // No actualizar newClient.password si estamos editando y el nombre del campo es password
    if (isEditing && name === 'password') {
      setNewPassword(value);
    } else {
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
    }
  };

  const handleStatusChange = (value) => {
    setNewClient(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleRoleChange = (value) => {
    setNewClient(prev => ({
      ...prev,
      role: value
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

  const handleEdit = (client) => {
    setIsEditing(true);
    setNewClient({
      id: client.id,
      nombre: client.name,
      apellido: client.lastName,
      email: client.email,
      telefono: client.phoneNumber, // Cargar el número tal cual, sin añadir +52 automáticamente
      password: "", // Limpiar la contraseña al abrir el modal de edición
      status: client.status,
      role: client.role
    });
    setNewPassword(""); // Limpiar el estado de la nueva contraseña
    setIsModalOpen(true);
    setPhoneError(false);
    setNombreError(false);
    setApellidoError(false);
  };

  const handleChangePasswordClick = (client) => {
    setClientToChangePassword(client);
    setNewPassword("");
    setConfirmPassword("");
    setNewPasswordError("");
    setConfirmPasswordError("");
    setIsPasswordModalOpen(true);
  };

  const resetForm = () => {
    setNewClient({
      id: null,
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      status: "ACTIVE",
      role: "GENERAL_CUSTOMER"
    });
    setIsEditing(false);
    setNewPassword("");
    setIsPasswordModalOpen(false);
    setPhoneError(false);
    setNombreError(false);
    setApellidoError(false);
    setClientToChangePassword(null);
    setNewPasswordError("");
    setConfirmPasswordError("");
    setConfirmPassword("");

    console.log("Estado de newClient después de resetForm:", {
      email: "", // Esperamos que sea vacío
      password: "" // Esperamos que sea vacío
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Mutación para crear un cliente
  const createClientMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Cliente registrado exitosamente");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error("Error al registrar cliente");
      console.error(error);
    }
  });

  // Mutación para actualizar un cliente
  const updateClientMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success("Cliente actualizado exitosamente");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error) => {
      toast.error("Error al actualizar cliente");
      console.error(error);
    }
  });

  // Nueva mutación para restablecer contraseña
  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }) => resetUserPassword(userId, newPassword),
    onSuccess: () => {
      toast.success("Contraseña actualizada exitosamente");
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setNewPasswordError("");
      setConfirmPasswordError("");
    },
    onError: (error) => {
      toast.error("Error al actualizar contraseña");
      console.error(error);
    }
  });

  // Función de validación de complejidad de contraseña (copiada de EmployeesView)
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
    if (clientToChangePassword?.id && newPassword) {
      resetPasswordMutation.mutate({ userId: clientToChangePassword.id, newPassword });
    } else {
      // Esto debería ser manejado por validación, pero como fallback
      toast.error("Ocurrió un error. Intenta de nuevo.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const toastId = toast.loading('Guardando cliente...');
    try {
      // Validar campos antes de enviar
      if (nombreError || apellidoError || phoneError) {
         toast.error("Corrige los errores en el formulario antes de guardar.", { id: toastId });
         return;
      }

      // Validar que el teléfono comience con la lada seleccionada
      if (!newClient.telefono.startsWith('+52')) {
        toast.error("El número de teléfono debe comenzar con +52", { id: toastId });
        setPhoneError(true); // Asegurarse de que el error visual esté activo
        return; // Detener el envío del formulario
      }

      // Validar que el teléfono tenga algo más que solo la lada (si aplica)
      if (newClient.telefono === '+52') {
          toast.error("Por favor, ingresa el resto del número de teléfono.", { id: toastId });
          setPhoneError(true);
          return;
      }

      // Validar que el teléfono tenga exactamente 13 caracteres
      if (newClient.telefono.length !== 13) {
        toast.error("El teléfono debe tener exactamente 13 caracteres (ejemplo: +527772686839)", { id: toastId });
        setPhoneError(true);
        return;
      }

      // Validar que los campos de nombre y apellido no estén vacíos (required ya debería manejar esto, pero doble check)
      if (!newClient.nombre.trim() || !newClient.apellido.trim()) {
         toast.error("Nombre y Apellido son campos obligatorios.", { id: toastId });
         // No establecemos errores visuales aquí, ya que el atributo 'required' lo manejará
         return;
      }
      
      // Datos base para crear o actualizar
      const userData = {
        email: newClient.email,
        name: newClient.nombre,
        lastName: newClient.apellido,
        phoneNumber: newClient.telefono,
        role: newClient.role,
        status: newClient.status
      };
      
      console.log('Datos del cliente a guardar:', userData);

      // Agregar console.log antes de llamar a la mutación
      console.log('Llamando a createClientMutation.mutate con datos:', userData);

      if (isEditing) {
        // Para actualización, incluir el ID como número
        const updateData = {
          ...userData,
          id: Number(newClient.id),
        };
        
        console.log('Datos del usuario a actualizar:', updateData);
        updateClientMutation.mutate(updateData, {
          onSuccess: () => {
            toast.success("Cliente actualizado exitosamente", { id: toastId });
            setIsModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['clients'] });
          },
          onError: (error) => {
            toast.error("Error al actualizar cliente", { id: toastId });
            console.error(error);
          },
          onSettled: () => {
            setIsSubmitting(false);
            toast.dismiss(toastId);
          }
        });
      } else {
        // Para creación, incluir campos adicionales
        const createData = {
          ...userData,
          createdBy: "1",
          createdAt: new Date().toISOString(),
          password: newClient.password
        };
        
        console.log('Datos del usuario a crear:', createData);
        createClientMutation.mutate(createData, {
          onSuccess: () => {
            toast.success("Cliente registrado exitosamente", { id: toastId });
            setIsModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ['clients'] });
          },
          onError: (error) => {
            toast.error("Error al registrar cliente", { id: toastId });
            console.error(error);
          },
          onSettled: () => {
            setIsSubmitting(false);
            toast.dismiss(toastId);
          }
        });
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error("Error inesperado", { id: toastId });
      toast.dismiss(toastId);
    }
  };

  // Manejador para el cambio en la barra de búsqueda
  const handleSearchInputChange = (value) => {
    setSearchQuery(value);
    // Aquí podrías añadir lógica para filtrar inmediatamente o esperar a que se presione Enter/botón
  };

  // Manejador para el cambio en el filtro de rol
  const handleRoleFilterChange = (value) => {
    setSelectedRole(value);
  };

  // Manejador para el cambio de página
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
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
              placeholder="Buscar cliente..."
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
                <SelectItem value="GENERAL_CUSTOMER">Cliente General</SelectItem>
                <SelectItem value="FREQUENT_CUSTOMER">Cliente Frecuente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botón de registro */}
        <div className="flex-shrink-0 w-full sm:w-auto flex justify-end sm:justify-start">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer w-full sm:w-auto"
          >
            + Registrar cliente
          </button>
        </div>
      </div>

      <div className="rounded-md border">
        {isLoadingClients ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Cargando clientes...</p>
          </div>
        ) : clientsError ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-red-500">Error al cargar los clientes. Intenta de nuevo.</p>
          </div>
        ) : (
          <>
            {/* Vista de tabla solo para pantallas grandes */}
            <div className="hidden lg:block">
              <Table className="bg-white">
                <TableHeader>
                  <TableRow className="select-none">
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
                        {searchQuery || selectedRole !== "ALL" ? "No se encontraron clientes que coincidan" : "No hay clientes registrados"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((client) => (
                      <TableRow key={client.id} className=" hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {`${client.name} ${client.lastName}`}
                        </TableCell>
                        <TableCell className="select-all">{client.email}</TableCell>
                        <TableCell className="select-all">{client.phoneNumber}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            client.role === "GENERAL_CUSTOMER" || client.role === "CUSTOMER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {client.role === "GENERAL_CUSTOMER" || client.role === "CUSTOMER" ? "Cliente General" :
                             client.role === "FREQUENT_CUSTOMER" ? "Cliente Frecuente" :
                             client.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            client.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="select-all">{formatDate(client.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <ActionButtons
                            showView={false}
                            showEdit={true}
                            showDelete={true}
                            showChangePassword={true}
                            onEdit={() => handleEdit(client)}
                            onChangePassword={() => handleChangePasswordClick(client)}
                            onDelete={() => {
                              if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.name} ${client.lastName}?`)) {
                                deleteClientMutation.mutate(client.id);
                              }
                            }}
                            editTitle="Editar Cliente"
                            changePasswordTitle="Cambiar Contraseña"
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
                  {searchQuery || selectedRole !== "ALL" ? "No se encontraron clientes que coincidan" : "No hay clientes registrados"}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4">
                  {currentItems.map((client) => (
                    <div
                      key={client.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{`${client.name} ${client.lastName}`}</h3>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {client.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.role === "GENERAL_CUSTOMER" || client.role === "CUSTOMER"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }`}>
                              {client.role === "GENERAL_CUSTOMER" || client.role === "CUSTOMER" ? "Cliente General" :
                               client.role === "FREQUENT_CUSTOMER" ? "Cliente Frecuente" :
                               client.role}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Email:</span>
                            <span className="text-gray-900 truncate">{client.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Teléfono:</span>
                            <span className="text-gray-900">{client.phoneNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-500 w-24">Registrado:</span>
                            <span className="text-gray-900">{formatDate(client.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <ActionButtons
                            showView={false}
                            showEdit={true}
                            showDelete={true}
                            showChangePassword={true}
                            onEdit={() => handleEdit(client)}
                            onChangePassword={() => handleChangePasswordClick(client)}
                            onDelete={() => {
                              if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.name} ${client.lastName}?`)) {
                                deleteClientMutation.mutate(client.id);
                              }
                            }}
                            editTitle="Editar Cliente"
                            changePasswordTitle="Cambiar Contraseña"
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

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={newClient.nombre}
                  onChange={handleInputChange}
                  className={`col-span-3 ${nombreError ? 'border-red-500' : ''}`}
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
                  value={newClient.apellido}
                  onChange={handleInputChange}
                  className={`col-span-3 ${apellidoError ? 'border-red-500' : ''}`}
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
                  value={newClient.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  disabled={isEditing}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">
                  Teléfono
                </Label>
                <div className="col-span-3">
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +52
                    </span>
                    <Input
                      id="telefono"
                      name="telefono"
                      value={newClient.telefono.startsWith('+52') ? newClient.telefono.substring(3) : newClient.telefono}
                      onChange={(e) => {
                        // Solo permitir números y asegurar que siempre tenga +52 al inicio
                        const value = e.target.value.replace(/\D/g, '');
                        setNewClient(prev => ({
                          ...prev,
                          telefono: '+52' + value
                        }));
                        // Limpiar error de teléfono cuando el usuario empieza a escribir
                        if (phoneError) {
                          setPhoneError(false);
                        }
                      }}
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-l-0 ${phoneError ? 'border-red-500' : ''}`}
                      placeholder="Ej: 5512345678"
                      maxLength={10}
                      type="tel"
                      pattern="[0-9]{10}"
                      title="Ingresa un número de 10 dígitos"
                      required
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Formato: +52 55 1234 5678
                  </p>
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">
                      El número de teléfono debe tener 10 dígitos
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rol
                </Label>
                <Select
                  value={newClient.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL_CUSTOMER">Cliente General</SelectItem>
                    <SelectItem value="FREQUENT_CUSTOMER">Cliente Frecuente</SelectItem>
                  </SelectContent>
                </Select>
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
                  value={newClient.password}
                  onChange={handleInputChange}
                  className="col-span-3"
                    required
                />
              </div>
              )}
              {isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Estado
                  </Label>
                  <Select
                    value={newClient.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Activo</SelectItem>
                      <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              {(createClientMutation.isPending || updateClientMutation.isPending) && (
              <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                Procesando solicitud...
              </div>
            )}
              <Button type="button" variant="outline" onClick={handleCloseModal} className="cursor-pointer">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || createClientMutation.isPending || updateClientMutation.isPending}
                className="cursor-pointer"
              >
                {isSubmitting || createClientMutation.isPending || updateClientMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  isEditing ? "Actualizar" : "Registrar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Cambiar Contraseña */}
      <Dialog open={isPasswordModalOpen} onOpenChange={() => setIsPasswordModalOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña de {clientToChangePassword?.name} {clientToChangePassword?.lastName}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            {resetPasswordMutation.isPending && (
              <div className="mb-4 p-2 bg-blue-50 text-blue-700 rounded">
                Actualizando contraseña...
              </div>
            )}
            <div className="grid gap-y-4 py-4">
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

      {/* Controles de paginación */}
      {filteredClients.length > itemsPerPage && (
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

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
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
