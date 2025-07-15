import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Trash2, ShoppingCart, Box, DollarSign, Tag, Info, Eye } from 'lucide-react';
import PropTypes from 'prop-types';

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

  return (
    <Card className="w-full flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-200 h-full border border-gray-200">
      <CardHeader className="p-4 pb-2 border-b bg-white rounded-t-2xl">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold line-clamp-1 text-gray-900">
            {product.name}
          </CardTitle>
          {product.brand?.url && (
            <img
              src={product.brand.url}
              alt={product.brand.name}
              className="w-8 h-8 object-contain rounded-full border border-gray-200 shadow-sm ml-2"
              title={product.brand.name}
            />
          )}
        </div>
        <Badge
          variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
          className={`ml-2 text-xs h-6 px-3 rounded-full font-medium ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-200 text-gray-600 border-gray-300'}`}
        >
          {getStatusText(product.status)}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 p-4 flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 rounded-xl mb-3 flex items-center justify-center group">
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">{product.description}</p>
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
      </CardContent>

      <CardFooter className="flex justify-end gap-2 p-3 border-t bg-gray-50 rounded-b-2xl mt-auto">
        <TooltipProvider>
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