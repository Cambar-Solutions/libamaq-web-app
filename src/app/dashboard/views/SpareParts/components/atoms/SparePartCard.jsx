import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, Box, DollarSign, Eye } from 'lucide-react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

const SparePartCard = ({ sparePart, onEdit, onDelete, onViewDetails }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const mainImage = sparePart.media?.find(m => m.fileType === 'IMAGE')?.url || '/placeholder-product.jpg';

  return (
    <>
      {/* Ranking de estrellas fuera de la card, igual que en ProductCard.jsx */}
      <div className="px-4 pt-4 mb-2 flex items-center">
        <StarRating value={sparePart.ranking || 0} readOnly size={24} />
      </div>
      <Card className="min-w-[220px] max-w-xs w-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 h-full border border-gray-200">
        <CardHeader className="p-4 pb-2 border-b bg-white rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate line-clamp-1 text-gray-900">
                {sparePart.name}
              </CardTitle>
            </div>
            {sparePart.brand?.url && (
              <img
                src={sparePart.brand.url}
                alt={sparePart.brand.name}
                className="w-10 h-10 object-contain rounded-full border border-gray-200 shadow-sm ml-2 flex-shrink-0"
                title={sparePart.brand.name}
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 flex flex-col">
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 rounded-xl mb-3 flex items-center justify-center group">
            <img
              src={mainImage}
              alt={sparePart.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 max-h-32"
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          </div>

          {sparePart.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-1 truncate min-h-[32px]">{sparePart.description}</p>
          )}

          {/* Ranking de estrellas debajo de la descripción */}
          <div className="flex items-center mt-1 mb-2 min-w-0 max-w-full overflow-hidden">
            <StarRating value={sparePart.ranking || 0} readOnly size={20} />
          </div>

          {sparePart.brand && (
            <div className="flex flex-col items-end">
              <div className="flex items-center text-xs text-gray-400 mb-0.5">
                <span className="truncate">Marca</span>
              </div>
              <Badge 
                className="text-xs font-semibold truncate w-fit px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${sparePart.brand.color || '#cccccc'}10`,
                  color: sparePart.brand.color || '#333333',
                  borderColor: sparePart.brand.color || '#cccccc'
                }}
              >
                {sparePart.brand.name}
              </Badge>
              </div>
            )}
        </CardContent>

        <CardFooter className="flex flex-wrap justify-between items-center gap-2 p-3 border-t bg-gray-50 rounded-b-2xl mt-auto">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Ver detalles */}
            {onViewDetails && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(sparePart);
                    }}
                    className="h-8 w-8 hover:bg-gray-200"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                  Ver detalles
                </TooltipContent>
              </Tooltip>
            )}

            {/* Editar */}
            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
              <Button 
                    variant="ghost"
                    size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sparePart);
                }}
                    className="h-8 w-8 hover:bg-blue-100 text-blue-600"
              >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                Editar
                </TooltipContent>
              </Tooltip>
            )}

            {/* Badge de estado al lado del botón de editar */}
            <Badge
              variant={sparePart.status === 'ACTIVE' ? 'default' : 'secondary'}
              className={`rounded-full font-semibold px-3 py-1 text-xs tracking-wide flex items-center border transition-all duration-200 ml-1
                ${sparePart.status === 'ACTIVE'
                  ? 'bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-green-300 shadow-sm'
                  : sparePart.status === 'INACTIVE'
                    ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-blue-50 text-gray-700 border-gray-300 shadow-sm'
                    : 'bg-gray-200 text-gray-600 border-gray-300'}
              `}
            >
              {getStatusText(sparePart.status)}
            </Badge>

            {/* Eliminar */}
            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
              <Button 
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(sparePart);
                    }}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                    <Trash2 className="h-4 w-4" />
              </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                  Eliminar
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          </CardFooter>
      </Card>
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
    media: PropTypes.array,
    brand: PropTypes.shape({
      url: PropTypes.string,
      name: PropTypes.string,
      color: PropTypes.string
    }),
    ranking: PropTypes.number
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func
};

export default SparePartCard;
