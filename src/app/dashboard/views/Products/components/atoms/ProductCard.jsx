import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, ShoppingCart, Box, DollarSign, Tag, Info, Eye } from 'lucide-react';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

// Función local para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount || 0);
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

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onView,
  onViewDetails,
  brands,
  categories,
  isCreating
}) => {
  const mainImage = product.media?.find(m => m.fileType === 'IMAGE')?.url || '/placeholder-product.jpg';

  const handleProductUpdate = async (productId, updatedData, files = [], mediaToDelete = []) => {
    console.log("Updating product:", productId, updatedData, files, mediaToDelete);
    if (onEdit) {
      await onEdit(productId, updatedData, files, mediaToDelete);
    }
  };

  // Log temporal para depuración del stock
  console.log('PRODUCT:', product.name, 'STOCK:', product.stock);

  return (
    <Card className="w-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 h-full border border-gray-200">
      <CardHeader className="p-4 pb-2 border-b bg-white rounded-t-2xl">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1 truncate text-gray-900">
            {product.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between p-4 pt-2">
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-center items-center mb-2">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-32 object-contain rounded-lg bg-gray-50 border border-gray-100"
            />
          </div>
          {product.description && (
            <div className="text-xs text-gray-600 line-clamp-2 mb-1">
              {product.description}
            </div>
          )}
          {/* Eliminar o comentar la sección de precio */}
          {/*
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div>
            <div className="flex items-center text-xs text-gray-400 mb-0.5">
              <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Precio</span>
            </div>
            <p className="text-lg font-bold text-gray-900 truncate">{formatCurrency(product.price)}</p>
          </div>
        </div>
        */}

          {product.brand && (
            <div className="flex flex-col items-end">
              <div className="flex items-center text-xs text-gray-400 mb-0.5">
                <span className="truncate">Marca</span>
              </div>
              <Badge
                className="text-xs font-semibold truncate w-fit px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: `${product.brand.color}10`,
                  color: product.brand.color,
                  borderColor: product.brand.color
                }}
              >
                {product.brand.name}
              </Badge>
            </div>
          )}

          {product.category && (
            <div className="col-span-2 mt-2">
              <div className="flex items-center text-xs text-gray-400 mb-0.5">
                <Box className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Categoría</span>
              </div>
              <p className="text-xs font-medium truncate text-gray-700">{product.category.name}</p>
            </div>
          )}
        </div>
      </CardContent>
      {/* Ranking de estrellas justo encima del footer, alineado a la izquierda */}
      <div className="px-4 pb-1 flex items-center">
        <StarRating value={product.ranking || 0} readOnly size={10} />
      </div>

      <CardFooter className="flex justify-between items-center gap-2 p-3 border-t bg-gray-50 rounded-b-2xl mt-auto">
        <div className="flex items-center gap-2">
          <Badge
            variant={getStockBadgeVariant(product.stock)}
            className={`rounded-full font-semibold px-3 py-1 text-xs tracking-wide flex items-center border transition-all duration-200`}
          >
            {product.stock ?? 0} 
          </Badge>
          <Badge
            variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
            className={`rounded-full font-semibold px-3 py-1 text-xs tracking-wide flex items-center border transition-all duration-200
              ${product.status === 'ACTIVE'
                ? 'bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-green-300 shadow-sm'
                : product.status === 'INACTIVE'
                  ? 'bg-gradient-to-r from-gray-200 via-gray-100 to-blue-50 text-gray-700 border-gray-300 shadow-sm'
                  : 'bg-gray-200 text-gray-600 border-gray-300'}
            `}
          >
            {getStatusText(product.status)}
          </Badge>
        </div>
        <TooltipProvider>
          <div className="flex items-center gap-1">
          {/* Ver detalles */}
          {onViewDetails && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(product.id);
                  }}
                    className="h-8 w-8 hover:bg-gray-200 cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                Ver detalles
              </TooltipContent>
            </Tooltip>
          )}

          {/* Edit Dialog Integration */}
          {onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product.id);
                  }}
                    className="h-8 w-8 hover:bg-blue-100 text-blue-600 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                Editar
              </TooltipContent>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(product);
                  }}
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 cursor-pointer"
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
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number,
    stock: PropTypes.number,
    sku: PropTypes.string,
    status: PropTypes.oneOf(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']),
    media: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        url: PropTypes.string,
        fileType: PropTypes.string
      })
    ),
    brand: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      color: PropTypes.string,
      url: PropTypes.string // Added url to brand prop type
    }),
    category: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onViewDetails: PropTypes.func,
  brands: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired
};

export default ProductCard;