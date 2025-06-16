import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Edit, Trash2, ShoppingCart, Box, DollarSign, Tag, Info } from 'lucide-react';
import PropTypes from 'prop-types';
import EditProductFormDialog from './EditProductFormDialog';

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
  brands,
  categories,
  isCreating
}) => {
  const mainImage = product.media?.find(m => m.fileType === 'IMAGE')?.url || '/placeholder-product.jpg';
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    


  const handleProductUpdate = async (productId, updatedData) => {
    console.log("Updating product:", productId, updatedData);
    if (onEdit) {
      await onEdit(productId, updatedData); // Call the onEdit prop with ID and data
    }
    setIsEditDialogOpen(false); // Close dialog after successful update
  };

  return (
    <Card className="w-full flex flex-col hover:shadow-md transition-shadow duration-200 h-full">
      <CardHeader className="p-3 pb-1 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-medium line-clamp-1">
            {product.name}
          </CardTitle>
          <Badge
            variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}
            className="ml-2 text-xs h-5"
          >
            {getStatusText(product.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3 flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-md mb-2">
          <img
            src={mainImage}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>

        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div>
            <div className="flex items-center text-xs text-muted-foreground mb-0.5">
              <DollarSign className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">Precio</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{formatCurrency(product.price)}</p>
          </div>

          {product.brand && (
            <div className="flex flex-col">
              <div className="flex items-center text-xs text-muted-foreground mb-0.5">
                <span className="truncate">Marca</span>
              </div>
              <Badge
                className="text-xs font-normal truncate w-fit"
                style={{
                  backgroundColor: `${product.brand.color}15`,
                  color: product.brand.color,
                  borderColor: product.brand.color
                }}
              >
                {product.brand.name}
              </Badge>
            </div>
          )}


          {product.category && (
            <div className="col-span-2">
              <div className="flex items-center text-xs text-muted-foreground mb-0.5">
                <Box className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">Categoría</span>
              </div>
              <p className="text-xs font-medium truncate">{product.category.name}</p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-1.5 p-2 border-t mt-auto">
        <TooltipProvider>
          {onView && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(product);
                  }}
                  className="h-7 w-7"
                >
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-600 text-white text-xs px-2 py-1 rounded-sm shadow-md">
                Ver detalles
              </TooltipContent>
            </Tooltip>
          )}

          {/* Edit Dialog Integration */}
          {onEdit && (
            <Dialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      // onClick is removed from here as DialogTrigger handles it
                      className="h-7 w-7"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-gray-600 text-white text-xs px-2 py-1 rounded-sm shadow-md">
                  Editar
                </TooltipContent>
              </Tooltip>

              <DialogContent className="sm:max-w-[425px]">
                <EditProductFormDialog
                product={product}
                  brands={brands}
                  categories={categories}
                  onSave={handleProductUpdate}
                  onClose={() => setIsEditDialogOpen(false)} // Pass onClose to allow form to close dialog
                  isCreating={isCreating}
                />
                
              </DialogContent>
            </Dialog>
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
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-gray-600 text-white text-xs px-2 py-1 rounded-sm shadow-md">
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
      color: PropTypes.string, // Assuming brand also has a color property
    }),
    category: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string
    })
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  brands: PropTypes.array.isRequired, // PropType for brands
  categories: PropTypes.array.isRequired // PropType for categories
};

export default ProductCard;