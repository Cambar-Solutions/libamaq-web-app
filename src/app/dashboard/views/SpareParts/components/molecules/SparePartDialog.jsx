import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * SparePartDialog - Componente de diálogo genérico para mostrar formularios de repuestos
 * Sigue el principio de responsabilidad única y composición
 */
export const SparePartDialog = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  dialogClassName = "max-w-4xl max-h-[90vh] overflow-y-auto"
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Asegurarse de que el componente esté montado para evitar problemas de hidratación
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // No renderizar nada en el servidor
  if (!isMounted) return null;

  const handleOpenChange = (open) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className={dialogClassName} 
        aria-describedby="dialog-description"
      >
        <p id="dialog-description" className="sr-only">
          {description}
        </p>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

SparePartDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  dialogClassName: PropTypes.string
};

// Exportación por defecto para compatibilidad con importaciones existentes
export default SparePartDialog;
