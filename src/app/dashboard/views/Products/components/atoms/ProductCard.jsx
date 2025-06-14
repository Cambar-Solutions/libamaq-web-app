import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Función local para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

const ProductCard = ({ 
  product, 
  onEdit, 
  onDelete,
  onView
}) => {
  const navigate = useNavigate();
  const mainImage = product.media?.find(m => m.fileType === 'IMAGE')?.url || '/placeholder-product.jpg';
  
  return (
    <Card className="w-full max-w-sm overflow-hidden transition-all duration-200 hover:shadow-lg dark:hover:shadow-gray-800">
      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover transition-all duration-300 hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        {product.status === 'INACTIVE' && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Inactivo
          </Badge>
        )}
      </div>

      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 h-14">
            {product.name}
          </CardTitle>
          <Badge variant="outline" className="whitespace-nowrap">
            {product.category?.name || 'Sin categoría'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(product.price || 0)}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span>{product.stock || 0} en stock</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {product.description || 'Sin descripción'}
        </p>
        
        {product.brand && (
          <div className="mt-2 flex items-center">
            <span className="text-xs text-muted-foreground mr-2">Marca:</span>
            <Badge variant="secondary">
              {product.brand.name}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onView(product)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(product)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(product)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
