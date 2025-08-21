import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import useSparePartsStore from '../../hooks/useSparePartsStore';

/**
 * Componente para mostrar la lista de repuestos en tarjetas (vista móvil)
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.spareParts - Lista de repuestos a mostrar
 * @param {boolean} props.isLoading - Indica si se están cargando los datos
 * @param {Function} props.onEdit - Función para manejar la edición de un repuesto
 * @param {Function} props.onDelete - Función para manejar la eliminación de un repuesto
 */
export const SparePartsCardView = ({
  spareParts = [],
  isLoading = false,
  onEdit,
  onDelete
}) => {
  const { removeSparePart } = useSparePartsStore();

  // Función para formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'OUT_OF_STOCK':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Manejar eliminación de repuesto
  const handleDelete = async (sparePart) => {
    try {
      // Solo llama a onDelete para que la confirmación se maneje en el padre
      if (onDelete) {
        await onDelete(sparePart);
      }
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando repuestos...</span>
      </div>
    );
  }

  if (spareParts.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No se encontraron repuestos
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {spareParts.map((sparePart) => (
        <div key={sparePart.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full min-h-[350px]">
          {/* Contenedor de imagen del repuesto */}
          <div className="relative h-48 bg-gray-100">
            {sparePart.media?.[0]?.url ? (
              <div 
                className="w-full h-full bg-contain bg-center bg-no-repeat" 
                style={{ backgroundImage: `url(${sparePart.media[0].url})` }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-2" />
                <span>Sin imagen</span>
              </div>
            )}
            {/* Eliminado: Badge de estado arriba a la derecha */}
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg truncate">{sparePart.name}</h3>
              <span className="font-bold text-primary">{formatCurrency(sparePart.price)}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {sparePart.description}
            </p>
            
            <div className="flex items-center justify-between pt-3 border-t mt-auto">
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-muted-foreground">Stock:</div>
                <Badge 
                  variant="outline" 
                  className="border-purple-500 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                >
                  {sparePart.stock} unidades
                </Badge>
              </div>
              
              <div className="flex space-x-1 items-center">
                {/* Badge de estado al extremo izquierdo */}
                <Badge
                  variant={getStatusBadgeVariant(sparePart.status)}
                  className={`rounded-full font-semibold px-3 py-1 text-xs tracking-wide flex items-center border transition-all duration-200 mr-2
                    ${sparePart.status === 'ACTIVE'
                      ? 'bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-green-300 shadow-sm'
                      : sparePart.status === 'INACTIVE'
                        ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-blue-50 text-gray-700 border-gray-300 shadow-sm'
                        : 'bg-gray-200 text-gray-600 border-gray-300'}
                  `}
                >
                  {sparePart.status === 'ACTIVE' ? 'Activo' : 
                   sparePart.status === 'INACTIVE' ? 'Inactivo' : 'Sin stock'}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(sparePart)}
                  className="h-8 w-8"
                  aria-label="Editar repuesto"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(sparePart)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  aria-label="Eliminar repuesto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SparePartsCardView;
