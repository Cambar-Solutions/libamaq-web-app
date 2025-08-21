import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Plus, Smartphone, Table2 } from 'lucide-react';
import { SearchBar } from "@/components/ui/SearchBar";
import SparePartsCardView from './SparePartsCardView';
import useSparePartsStore from '../../hooks/useSparePartsStore';

/**
 * Componente para mostrar la lista de repuestos en una tabla (escritorio) o tarjetas (móvil)
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onAddNew - Función para manejar la adición de un nuevo repuesto
 * @param {Function} props.onEdit - Función para manejar la edición de un repuesto
 * @param {Function} props.onDelete - Función para manejar la eliminación de un repuesto
 * @param {string} props.emptyStateMessage - Mensaje a mostrar cuando no hay repuestos
 */
export const SparePartsList = ({
  onAddNew,
  onEdit,
  onDelete,
  emptyStateMessage = 'No se encontraron repuestos'
}) => {
  const {
    filteredSpareParts: spareParts,
    isLoading,
    searchTerm,
    setSearchTerm
  } = useSparePartsStore();

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

  // Función para manejar la búsqueda
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  // Barra de búsqueda
  const renderSearchBar = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="w-full md:max-w-md">
        <SearchBar 
          value={searchTerm}
          onChange={setSearchTerm}
          onSearchClick={handleSearch}
          placeholder="Buscar repuestos..."
          className="w-full"
        />
      </div>
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
        <h2 className="text-2xl font-bold tracking-tight">Gestión de Refacciones</h2>
        <Button onClick={onAddNew} className="h-9">
          <Plus className="mr-2 h-4 w-4" />
          <span>Agregar refaccion</span>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="relative overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Nombre {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Código {getSortIcon('code')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Precio {getSortIcon('price')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center">
                      Stock {getSortIcon('stock')}
                    </div>
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Renta
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {sortedSpareParts.map((sparePart) => (
                  <TableRow key={sparePart.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sparePart.name}
                        </div>
                        {sparePart.externalId && (
                          <div className="text-sm text-gray-500">
                            ID: {sparePart.externalId}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sparePart.code}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(sparePart.price || 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={sparePart.stock <= 0 ? 'destructive' : sparePart.stock <= 5 ? 'warning' : 'success'}
                        className="text-xs"
                      >
                        {sparePart.stock || 0} unidades
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={sparePart.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {sparePart.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant={sparePart.rentable ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {sparePart.rentable ? 'Disponible' : 'No disponible'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(sparePart)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(sparePart)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
