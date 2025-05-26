import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';

export const SparePartCard = ({ 
  sparePart, 
  onEdit, 
  onDelete,
  className = ''
}) => {
  const { 
    id, 
    name, 
    code, 
    price, 
    stock, 
    status, 
    externalId,
    variant,
    material,
    media = []
  } = sparePart;

  const statusVariant = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    DISCONTINUED: 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800';

  const statusLabel = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    DISCONTINUED: 'Descontinuado'
  }[status] || status;

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium line-clamp-1">{name}</CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-muted-foreground">{code}</span>
              {externalId && (
                <span className="text-xs text-muted-foreground">• {externalId}</span>
              )}
            </div>
          </div>
          <Badge className={statusVariant}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Precio</p>
            <p className="font-medium">${Number(price).toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Stock</p>
            <div className="flex items-center">
              <Package className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="font-medium">{stock} unidades</span>
            </div>
          </div>
          {variant !== undefined && variant !== null && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Variante</p>
              <p className="font-medium">{variant}</p>
            </div>
          )}
          {material && (
            <div className="space-y-1">
              <p className="text-muted-foreground">Material</p>
              <p className="font-medium line-clamp-1">{material}</p>
            </div>
          )}
        </div>
        
        {media?.length > 0 && (
          <div className="mt-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {media.slice(0, 3).map((img) => (
                <div key={img.id} className="flex-shrink-0">
                  <img
                    src={img.url}
                    alt={`Imagen de ${name}`}
                    className="h-16 w-16 rounded-md object-cover border"
                  />
                </div>
              ))}
              {media.length > 3 && (
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-md bg-muted text-muted-foreground">
                  +{media.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t">
        <div className="flex w-full justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(sparePart)}
            className="flex-1 sm:flex-initial"
          >
            <Edit className="h-4 w-4 mr-2" />
            <span className="sr-only sm:not-sr-only">Editar</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(id)}
            className="flex-1 sm:flex-initial"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span className="sr-only sm:not-sr-only">Eliminar</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
