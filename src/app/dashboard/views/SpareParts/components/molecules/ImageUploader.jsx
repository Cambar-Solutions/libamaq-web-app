import { useState, useCallback, useEffect } from 'react';
import { ImagePlus, X, Trash2, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useId } from 'react';

/**
 * Componente para subir y previsualizar imágenes
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.existingImages - Array de imágenes existentes (para edición)
 * @param {Function} props.onImagesChange - Callback cuando cambian las imágenes seleccionadas
 * @param {Function} props.onImageDelete - Callback cuando se elimina una imagen existente
 * @param {number} props.maxFiles - Número máximo de archivos permitidos (por defecto 5)
 * @returns {JSX.Element} Componente de carga de imágenes
 */
const ImageUploader = ({
  existingImages = [],
  onImagesChange,
  onImageDelete,
  maxFiles = 5,
}) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const dialogDescriptionId = `image-preview-desc-${useId()}`;

  // Limpiar URLs de objeto cuando el componente se desmonte
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Obtener URLs de vista previa para los archivos seleccionados
  const createPreviewUrls = useCallback((files) => {
    return files.map(file => URL.createObjectURL(file));
  }, []);

  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Verificar límite de archivos
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`Solo puedes subir hasta ${maxFiles} imágenes en total`);
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    
    // Crear URLs de vista previa para los nuevos archivos
    const newPreviewUrls = createPreviewUrls(files);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Notificar al componente padre sobre el cambio
    if (onImagesChange) {
      onImagesChange(newFiles);
    }
    
    // Reiniciar el input para permitir cargar el mismo archivo nuevamente
    e.target.value = null;
  };

  // Eliminar una imagen seleccionada
  const handleRemoveImage = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviewUrls = [...previewUrls];
    
    // Revocar la URL del objeto
    URL.revokeObjectURL(newPreviewUrls[index]);
    
    // Eliminar el archivo y su vista previa
    newFiles.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    
    // Notificar al componente padre sobre el cambio
    if (onImagesChange) {
      onImagesChange(newFiles);
    }
  };

  // Eliminar una imagen existente
  const handleDeleteExisting = (index) => {
    if (onImageDelete) {
      onImageDelete(index);
    }
  };

  // Mostrar vista previa de una imagen
  const handlePreview = (url) => {
    setPreviewImage(url);
  };

  // Cerrar la vista previa
  const closePreview = () => {
    setPreviewImage(null);
  };

  // Calcular el progreso de carga (simulado)
  useEffect(() => {
    if (isUploading) {
      const timer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(timer);
    }
  }, [isUploading]);

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={selectedFiles.length >= maxFiles}
            aria-label="Seleccionar imágenes"
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={selectedFiles.length >= maxFiles}
          >
            <ImagePlus className="w-4 h-4" />
            Subir imágenes
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">
          {selectedFiles.length} de {maxFiles} archivos seleccionados
        </span>
      </div>

      {/* Barra de progreso */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo imágenes...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Vista previa de imágenes seleccionadas */}
      {(previewUrls.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Imágenes existentes */}
          {existingImages.map((img, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border">
                <img
                  src={img.url}
                  alt={`Vista previa ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => handlePreview(img.url)}
                  aria-label={`Ver imagen ${index + 1}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleDeleteExisting(index)}
                  aria-label={`Eliminar imagen ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Nuevas imágenes */}
          {previewUrls.map((url, index) => (
            <div key={url} className="relative group">
              <div className="aspect-square overflow-hidden rounded-md border">
                <img
                  src={url}
                  alt={`Vista previa ${index + 1 + existingImages.length}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => handlePreview(url)}
                  aria-label={`Ver imagen ${index + 1 + existingImages.length}`}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleRemoveImage(index)}
                  aria-label={`Eliminar imagen ${index + 1 + existingImages.length}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de vista previa */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vista previa de la imagen</DialogTitle>
          </DialogHeader>
          <div className="relative flex justify-center items-center">
            <img
              src={previewImage}
              alt="Vista previa ampliada"
              className="max-h-[70vh] max-w-full object-contain"
              aria-describedby={dialogDescriptionId}
            />
            <p id={dialogDescriptionId} className="sr-only">
              Vista previa ampliada de la imagen seleccionada
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploader;
