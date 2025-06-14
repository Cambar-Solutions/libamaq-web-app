import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ImageUploader = ({
  label,
  value = [],
  onChange,
  multiple = true,
  maxFiles = 10,
  accept = 'image/*',
  disabled = false,
  className = ''
}) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Verificar límite de archivos
    if (value.length + files.length > maxFiles) {
      alert(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }
    
    // Convertir archivos a objetos URL para vista previa
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    if (onChange) {
      onChange([...value, ...newFiles]);
    }
    
    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value, maxFiles, onChange]);

  const removeImage = (index) => {
    const newFiles = [...value];
    // Revocar la URL del objeto para evitar fugas de memoria
    if (newFiles[index]?.preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    newFiles.splice(index, 1);
    if (onChange) {
      onChange(newFiles);
    }
  };

  const openFileDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Limpiar las URLs de vista previa al desmontar
  React.useEffect(() => {
    return () => {
      value.forEach(file => {
        if (file?.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [value]);

  const remainingSlots = maxFiles - value.length;
  const canUpload = !disabled && remainingSlots > 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled || remainingSlots <= 0}
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Vista previa de imágenes existentes */}
        {value.map((file, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-md overflow-hidden border border-muted">
              <img
                src={file.preview || file.url}
                alt={file.name || `Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        
        {/* Botón para agregar más imágenes */}
        {canUpload && (
          <div 
            className={cn(
              'aspect-square rounded-md border-2 border-dashed border-muted-foreground/25',
              'flex flex-col items-center justify-center cursor-pointer',
              'hover:border-primary hover:bg-muted/50 transition-colors',
              'text-muted-foreground hover:text-foreground',
              'p-4 text-center',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={openFileDialog}
          >
            <Upload className="h-8 w-8 mb-2" />
            <span className="text-xs">
              {multiple ? `Subir imágenes (${remainingSlots} restantes)` : 'Subir imagen'}
            </span>
          </div>
        )}
      </div>
      
      {!canUpload && multiple && (
        <p className="text-sm text-muted-foreground">
          Límite de {maxFiles} imágenes alcanzado
        </p>
      )}
    </div>
  );
};
