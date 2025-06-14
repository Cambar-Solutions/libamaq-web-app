import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  onView,
  className = ""
}) => {
  // Obtener la URL de la imagen principal o usar una por defecto
  const mainImage = product.media?.[0]?.url || '/placeholder-product.jpg';
  
  // Formatear el precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG'
    }).format(price);
  };

  // Obtener una descripción corta (primeras 100 caracteres)
  const shortDescription = product.description 
    ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '')
    : 'Sin descripción';

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col ${className}`}>
      {/* Imagen del producto */}
      <div className="relative aspect-square bg-muted">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover"
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
      
      {/* Información del producto */}
      <CardHeader className="p-4 pb-2 flex-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">
            {product.name}
          </h3>
          <div className="text-right">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
        
        {/* Marca */}
        {product.brand && (
          <div className="mt-2">
            <Badge 
              variant="outline" 
              className="text-xs" 
              style={{ 
                backgroundColor: `${product.brand.color}15`,
                borderColor: product.brand.color,
                color: product.brand.color
              }}
            >
              {product.brand.name}
            </Badge>
          </div>
        )}
        
        {/* Descripción corta */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {shortDescription}
        </p>
      </CardHeader>
      
      {/* Acciones */}
      <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(product)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onEdit?.(product)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onDelete?.(product)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
