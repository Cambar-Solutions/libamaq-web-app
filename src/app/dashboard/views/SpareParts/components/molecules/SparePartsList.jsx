import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Plus } from 'lucide-react';

/**
 * Componente para mostrar la lista de repuestos en una tabla
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.spareParts - Lista de repuestos a mostrar
 * @param {boolean} props.isLoading - Indica si se están cargando los datos
 * @param {string} props.searchTerm - Término de búsqueda actual
 * @param {Function} props.onSearchChange - Función para manejar cambios en la búsqueda
 * @param {Function} props.onAddNew - Función para manejar la adición de un nuevo repuesto
 * @param {Function} props.onEdit - Función para manejar la edición de un repuesto
 * @param {Function} props.onDelete - Función para manejar la eliminación de un repuesto
 * @param {string} props.emptyStateMessage - Mensaje a mostrar cuando no hay repuestos
 */
export const SparePartsList = ({
  spareParts = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  onAddNew,
  onEdit,
  onDelete,
  emptyStateMessage = 'No se encontraron repuestos'
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Función para manejar el ordenamiento
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Aplicar ordenamiento
  const sortedSpareParts = [...spareParts].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y botón de agregar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar repuestos..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={onAddNew} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Repuesto
        </Button>
      </div>

      {/* Tabla de repuestos */}
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Cargando repuestos...</span>
          </div>
        ) : sortedSpareParts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {emptyStateMessage}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('code')}
                >
                  Código {getSortIcon('code')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('name')}
                >
                  Nombre {getSortIcon('name')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('price')}
                >
                  Precio {getSortIcon('price')}
                </TableHead>
                <TableHead 
                  className="text-right cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('stock')}
                >
                  Stock {getSortIcon('stock')}
                </TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSpareParts.map((sparePart) => (
                <TableRow key={sparePart.id}>
                  <TableCell className="font-medium">
                    <div className="font-semibold">{sparePart.code}</div>
                    {sparePart.externalId && (
                      <div className="text-xs text-muted-foreground">
                        {sparePart.externalId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sparePart.name}</div>
                    {sparePart.material && (
                      <div className="text-xs text-muted-foreground">
                        {sparePart.material}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sparePart.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={sparePart.stock > 0 ? 'default' : 'destructive'}
                      className="min-w-[60px] justify-center"
                    >
                      {sparePart.stock} unidades
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={sparePart.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {sparePart.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(sparePart)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(sparePart)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default SparePartsList;
