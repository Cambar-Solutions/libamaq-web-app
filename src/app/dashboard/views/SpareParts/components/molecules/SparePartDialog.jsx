import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PropTypes from 'prop-types';
import { useId } from 'react';

/**
 * Componente de diálogo reutilizable para formularios de repuestos
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el diálogo está abierto
 * @param {Function} props.onClose - Función para cerrar el diálogo
 * @param {string} props.title - Título del diálogo
 * @param {string} props.description - Descripción del diálogo
 * @param {React.ReactNode} props.children - Contenido del diálogo (formulario)
 * @param {string} [props.size='md'] - Tamaño del diálogo (sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full)
 */
export const SparePartDialog = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md'
}) => {
  const descriptionId = useId();
  
// En SparePartDialog.jsx
const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-3xl',  // Aumentado de md a 4xl por defecto
  lg: 'sm:max-w-5xl',
  xl: 'sm:max-w-6xl',
  '2xl': 'sm:max-w-7xl',
  '3xl': 'sm:max-w-[90vw]',
  '4xl': 'sm:max-w-[95vw]',
  '5xl': 'sm:max-w-[98vw]',
  full: 'sm:max-w-full',
};

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${sizeClasses[size] || sizeClasses.md} max-h-[90vh] overflow-y-auto`}
        aria-describedby={description ? descriptionId : undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          {description && (
            <DialogDescription id={descriptionId} className="text-sm text-muted-foreground">
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
};

SparePartDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'full'])
};

export default SparePartDialog;
