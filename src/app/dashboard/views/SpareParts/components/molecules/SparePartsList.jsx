import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Plus, Smartphone, Table2 } from 'lucide-react';
import SparePartsCardView from './SparePartsCardView';

/**
 * Componente para mostrar la lista de repuestos en una tabla (escritorio) o tarjetas (móvil)
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
  const [viewMode, setViewMode] = useState('table');
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setViewMode('card');
      }
    };
    
    // Verificar al cargar
    checkIfMobile();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile);
    
    // Limpiar el event listener
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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

  // Barra de búsqueda
  const renderSearchBar = () => (
    <div className="relative flex-1 max-w-2xl">
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
  );

  // Controles de vista (solo escritorio)
  const renderViewControls = () => !isMobile && (
    <div className="flex items-center gap-2">
      <div className="flex border rounded-md overflow-hidden">
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-r-none h-9 px-3"
          onClick={() => setViewMode('table')}
        >
          <Table2 className="h-4 w-4 mr-2" />
          <span>Tabla</span>
        </Button>
        <Button
          variant={viewMode === 'card' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-l-none h-9 px-3"
          onClick={() => setViewMode('card')}
        >
          <Smartphone className="h-4 w-4 mr-2" />
          <span>Tarjetas</span>
        </Button>
      </div>
    </div>
  );

  // Barra de herramientas principal
  const renderToolbar = () => (
    <div className="space-y-4">
      {/* Primera fila: Botón de agregar */}
      <div className="flex justify-between items-center mt-3">
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Repuestos</h2>
        <Button onClick={onAddNew} className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          <span>Agregar repuesto</span>
        </Button>
      </div>

      {/* Segunda fila: Búsqueda y controles de vista */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {renderSearchBar()}
        {renderViewControls()}
      </div>
    </div>
  );

  // Renderizar la vista de carga
  if (isLoading) {
    return (
      <div className="space-y-4">
        {renderToolbar()}
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Cargando repuestos...</span>
        </div>
      </div>
    );
  }

  // Renderizar mensaje cuando no hay resultados
  if (sortedSpareParts.length === 0) {
    return (
      <div className="space-y-4">
        {renderToolbar()}
        <div className="p-8 text-center text-muted-foreground">
          {emptyStateMessage}
        </div>
      </div>
    );
  }

  // Renderizar la vista según el modo seleccionado
  return (
    <div className="space-y-6">
      {renderToolbar()}
      
      {/* Vista de tarjetas (móvil/tablet) */}
      {viewMode === 'card' ? (
        <SparePartsCardView 
          spareParts={sortedSpareParts}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ) : (
        /* Vista de tabla (escritorio) */
        <div className="rounded-md border overflow-hidden">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleSort('name')}
                  >
                    Nombre {getSortIcon('name')}
                  </TableHead>
                  <TableHead>Descripción</TableHead>
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
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSpareParts.map((sparePart) => (
                  <TableRow key={sparePart.id}>
                    <TableCell className="font-medium">{sparePart.name}</TableCell>
                    <TableCell className="text-muted-foreground line-clamp-1 max-w-[200px]">
                      {sparePart.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(sparePart.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge 
                        variant="outline" 
                        className="border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                      >
                        {sparePart.stock} unidades
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          sparePart.status === 'ACTIVE' ? 'default' : 
                          sparePart.status === 'INACTIVE' ? 'secondary' : 'destructive'
                        }
                      >
                        {sparePart.status === 'ACTIVE' ? 'Activo' : 
                         sparePart.status === 'INACTIVE' ? 'Inactivo' : 'Sin stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(sparePart)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(sparePart)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsList;
