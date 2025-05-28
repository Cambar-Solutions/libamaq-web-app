import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { getCustomerUsers, createUser, updateUser } from "@/services/admin/userService";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient(prev => ({
      ...prev,
      [name]: value
    }));
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
      telefono: client.phoneNumber,
      password: "",
      status: client.status,
      role: client.role
    });
    setIsModalOpen(true);
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
      role: "CUSTOMER"
    });
    setIsEditing(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Datos base para crear o actualizar
    const userData = {
      email: newClient.email,
      name: newClient.nombre,
      lastName: newClient.apellido,
      phoneNumber: newClient.telefono,
      role: 'CUSTOMER', // Forzar el rol CUSTOMER para clientes
      status: newClient.status
    };
    
    console.log('Datos del cliente a guardar:', userData);

    if (isEditing) {
      // Para actualización, incluir el ID como número
      const updateData = {
        ...userData,
        id: Number(newClient.id), // Convertir a número
        // No incluir password si está vacío
        ...(newClient.password ? { password: newClient.password } : {})
      };
      
      console.log('Datos del usuario a actualizar:', updateData);
      updateClientMutation.mutate(updateData);
    } else {
      // Para creación, incluir campos adicionales
      const createData = {
        ...userData,
        createdBy: "1", // ID del usuario administrador
        createdAt: new Date().toISOString(),
        password: newClient.password // Password es obligatorio para crear
      };
      
      console.log('Datos del usuario a crear:', createData);
      createClientMutation.mutate(createData);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
        >
          + Registrar cliente
        </button>
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
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                        No hay clientes registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {`${client.name} ${client.lastName}`}
                        </TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.phoneNumber}</TableCell>
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
                        <TableCell>{formatDate(client.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(client);
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
              {clients.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No hay clientes registrados
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4">
                  {clients.map((client) => (
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
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEdit(client)}
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
              {isEditing ? "Editar Cliente" : "Registrar Nuevo Cliente"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            {(createClientMutation.isPending || updateClientMutation.isPending) && (
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
                  value={newClient.nombre}
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
                  value={newClient.apellido}
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
                  value={newClient.email}
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
                  value={newClient.telefono}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                  placeholder="+52..."
                />
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
                    <SelectItem value="CUSTOMER">Cliente General</SelectItem>
                    <SelectItem value="FREQUENT_CUSTOMER">Cliente Frecuente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  required={!isEditing}
                  placeholder={isEditing ? "Dejar vacío para mantener la actual" : ""}
                />
              </div>
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
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createClientMutation.isPending || updateClientMutation.isPending}
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
