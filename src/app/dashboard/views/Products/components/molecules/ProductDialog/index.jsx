import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/**
 * Componente de diálogo reutilizable para formularios de productos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Indica si el diálogo está abierto
 * @param {Function} props.onOpenChange - Función para manejar cambios en el estado de apertura
 * @param {string} props.title - Título del diálogo
 * @param {string} props.description - Descripción del diálogo
 * @param {React.ReactNode} props.children - Contenido del diálogo (formulario)
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.size='md'] - Tamaño del diálogo (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, full)
 * @returns {JSX.Element} Componente de diálogo
 */
export function ProductDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children, 
  className = '',
  size = 'md' 
}) {
  // Mapeo de tamaños a clases de ancho
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    full: 'sm:max-w-full'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`${sizeClasses[size] || sizeClasses['md']} max-h-[90vh] overflow-y-auto ${className}`}
        onInteractOutside={(e) => {
          // Prevenir que el diálogo se cierre al hacer clic fuera
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDialog;
