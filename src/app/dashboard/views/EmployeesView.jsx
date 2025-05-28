import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { getAllUsers, createUser, updateUser } from "@/services/admin/userService";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

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
    role: "DIRECTOR" // Rol predeterminado para empleados
  });

  // Consulta para obtener todos los usuarios y filtrar solo los empleados
  const { 
    data: allUsers = [], 
    isLoading: isLoadingUsers,
    error: usersError 
  } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    onError: (error) => {
      toast.error("Error al cargar usuarios");
      console.error('Error al cargar usuarios:', error);
    }
  });
  
  // Filtrar solo los empleados (DIRECTOR, PROVIDER, DELIVERY, ADMIN)
  const employees = Array.isArray(allUsers) 
    ? allUsers.filter(user => user && ["DIRECTOR", "PROVIDER", "DELIVERY", "ADMIN"].includes(user.role))
    : [];
    
  console.log('Usuarios totales:', allUsers);
  console.log('Empleados filtrados:', employees);

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

  const resetForm = () => {
    setNewEmployee({
      id: null,
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      password: "",
      status: "ACTIVE",
      role: "DIRECTOR"
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Mutación para crear un empleado
  const createEmployeeMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("Empleado registrado exitosamente");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error("Error al registrar empleado");
      console.error(error);
    }
  });

  // Mutación para actualizar un empleado
  const updateEmployeeMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      toast.success("Empleado actualizado exitosamente");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error("Error al actualizar empleado");
      console.error(error);
    }
  });

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
    
    // Verificar que el rol sea uno de los permitidos
    if (!['ADMIN', 'DIRECTOR', 'USER', 'CUSTOMER', 'PROVIDER', 'DELIVERY'].includes(userData.role)) {
      toast.error(`Rol no válido: ${userData.role}. Roles permitidos: ADMIN, DIRECTOR, USER, CUSTOMER, PROVIDER, DELIVERY`);
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
      updateEmployeeMutation.mutate(updateData);
    } else {
      // Para creación, incluir campos adicionales
      const createData = {
        ...userData,
        createdBy: "1", // ID del usuario administrador
        createdAt: new Date().toISOString(),
        password: newEmployee.password // Password es obligatorio para crear
      };
      
      console.log('Datos del empleado a crear:', createData);
      createEmployeeMutation.mutate(createData);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
        >
          + Registrar empleado
        </button>
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
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                        No hay empleados registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {`${employee.name} ${employee.lastName}`}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phoneNumber}</TableCell>
                        <TableCell>
                          {employee.role === 'ADMIN' && (
                            <Badge variant="destructive">Administrador</Badge>
                          )}
                          {employee.role === 'DIRECTOR' && (
                            <Badge variant="default">Director</Badge>
                          )}
                          {employee.role === 'PROVIDER' && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Proveedor</Badge>
                          )}
                          {employee.role === 'DELIVERY' && (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Repartidor</Badge>
                          )}
                          {employee.role === 'CUSTOMER' && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Cliente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            employee.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {employee.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(employee.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-pointer hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(employee);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Vista de tarjetas para dispositivos móviles y tablets */}
            <div className="lg:hidden">
              {employees.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No hay empleados registrados
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4">
                  {employees.map((employee) => (
                    <div 
                      key={employee.id} 
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{`${employee.name} ${employee.lastName}`}</h3>
                          <div className="flex space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              employee.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                            </span>
                            {employee.role === 'ADMIN' && (
                              <Badge variant="destructive" className="text-xs">Admin</Badge>
                            )}
                            {employee.role === 'DIRECTOR' && (
                              <Badge variant="default" className="text-xs">Director</Badge>
                            )}
                            {employee.role === 'PROVIDER' && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 text-xs">Proveedor</Badge>
                            )}
                            {employee.role === 'DELIVERY' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Repartidor</Badge>
                            )}
                            {employee.role === 'CUSTOMER' && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">Cliente</Badge>
                            )}
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
                        
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEdit(employee)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
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
                  required={!isEditing}
                  placeholder={isEditing ? "Dejar vacío para mantener la actual" : ""}
                />
              </div>
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
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="DIRECTOR">Director</SelectItem>
                    <SelectItem value="PROVIDER">Proveedor</SelectItem>
                    <SelectItem value="DELIVERY">Repartidor</SelectItem>
                    <SelectItem value="CUSTOMER">Cliente</SelectItem>
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
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
