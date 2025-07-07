import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Box, DollarSign, Hash, Info, ExternalLink } from 'lucide-react';
import PropTypes from 'prop-types';
import useSparePartsStore from '../../hooks/useSparePartsStore';

/**
 * Componente de tarjeta para mostrar información de un repuesto
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.sparePart - Datos del repuesto a mostrar
 * @param {Function} [props.onEdit] - Función para manejar la edición del repuesto
 * @param {Function} [props.onDelete] - Función para manejar la eliminación del repuesto
 * @param {Function} [props.onClick] - Función para manejar el clic en la tarjeta
 */
const SparePartCard = ({ sparePart, onEdit, onDelete, onClick }) => {
  const { removeSparePart } = useSparePartsStore();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formatear el precio como moneda
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  };

  // Determinar el color del badge según el estado del stock
  const getStockBadgeVariant = (stock) => {
    if (stock <= 0) return 'destructive';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  // Determinar el texto del estado
  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'OUT_OF_STOCK':
        return 'Sin stock';
      default:
        return status || 'Desconocido';
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!sparePart?.id) return;
    
    try {
      setIsDeleting(true);
      // Actualizar el store localmente
      removeSparePart(sparePart.id);
      
      // Llamar a la función onDelete si existe (para operaciones adicionales)
      if (onDelete) {
        await onDelete(sparePart);
      }
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error al eliminar el repuesto:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card 
        className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 overflow-hidden"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {sparePart.name}
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-1 mt-1">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono">{sparePart.code}</span>
                {sparePart.externalId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center text-xs text-muted-foreground ml-2">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {sparePart.externalId}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ID Externo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardDescription>
            </div>
            <Badge 
              variant={sparePart.status === 'ACTIVE' ? 'default' : 'secondary'}
              className="ml-2"
            >
              {getStatusText(sparePart.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {sparePart.description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {sparePart.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>Precio</span>
              </div>
              <p className="font-medium">{formatPrice(sparePart.price || 0)}</p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Box className="h-4 w-4 mr-1" />
                <span>Stock</span>
              </div>
              <Badge 
                variant={getStockBadgeVariant(sparePart.stock || 0)}
                className="font-medium"
              >
                {sparePart.stock || 0} unidades
              </Badge>
            </div>

            {sparePart.material && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Info className="h-4 w-4 mr-1" />
                  <span>Material</span>
                </div>
                <p className="text-sm">{sparePart.material}</p>
              </div>
            )}
          </div>
        </CardContent>

        {(onEdit || onDelete) && (
          <CardFooter className="flex justify-end gap-2 pt-2 border-t">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sparePart);
                }}
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteClick}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar repuesto?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar "{sparePart.name}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

SparePartCard.propTypes = {
  sparePart: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    externalId: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
    material: PropTypes.string,
    status: PropTypes.string,
    rentable: PropTypes.bool,
    media: PropTypes.array
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func
};

export default SparePartCard;
