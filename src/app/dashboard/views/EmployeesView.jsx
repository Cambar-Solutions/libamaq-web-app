import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { createEmployee, getEmployees, updateEmployee } from "@/services/employeeService";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export function EmployeesView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    id: null,
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    password: "",
    code: "",
    status: "ACTIVE"
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Error al cargar empleados");
      console.error(error);
    }
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
    setIsEditing(true);
    setNewEmployee({
      id: employee.id,
      nombre: employee.name,
      apellido: employee.lastName,
      email: employee.email,
      telefono: employee.phoneNumber,
      password: "", // Campo vacío para la contraseña en edición
      status: employee.status,
      code: employee.code
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
      code: "",
      status: "ACTIVE"
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await updateEmployee(newEmployee);
        toast.success("Empleado actualizado exitosamente");
      } else {
        await createEmployee(newEmployee);
        toast.success("Empleado registrado exitosamente");
      }
      setIsModalOpen(false);
      await fetchEmployees();
      resetForm();
    } catch (error) {
      toast.error(isEditing ? "Error al actualizar empleado" : "Error al registrar empleado");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Registrar empleado
        </button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium">
                  {`${employee.name} ${employee.lastName}`}
                </TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    employee.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(employee.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(employee);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Empleado" : "Registrar Nuevo Empleado"}
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
              {!isEditing && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="code" className="text-right">
                    Código
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    value={newEmployee.code}
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
                    value={newEmployee.status}
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Guardando..." : (isEditing ? "Actualizar" : "Guardar empleado")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
