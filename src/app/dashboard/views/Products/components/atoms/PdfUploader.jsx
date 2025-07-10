import { useState, useCallback, useEffect } from 'react';
import { FileText, X, Trash2, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useId } from 'react';

/**
 * Componente para subir y gestionar archivos PDF
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.existingDownloads - Array de descargas existentes (para edición)
 * @param {Function} props.onPdfsChange - Callback cuando cambian los PDFs seleccionados
 * @param {Function} props.onPdfDelete - Callback cuando se elimina un PDF existente
 * @param {number} props.maxFiles - Número máximo de archivos permitidos (por defecto 10)
 * @returns {JSX.Element} Componente de carga de PDFs
 */
const PdfUploader = ({
  existingDownloads = [],
  onPdfsChange,
  onPdfDelete,
  maxFiles = 10,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewPdf, setPreviewPdf] = useState(null);
  const dialogDescriptionId = `pdf-preview-desc-${useId()}`;

  // Limpiar archivos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      setSelectedFiles([]);
    };
  }, []);

  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Filtrar solo archivos PDF
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Solo se permiten archivos PDF');
    }
    
    // Evitar duplicados por nombre
    const existingFileNames = selectedFiles.map(f => f.name);
    const uniqueFiles = pdfFiles.filter(f => !existingFileNames.includes(f.name));

    // Verificar límite de archivos
    if (selectedFiles.length + uniqueFiles.length > maxFiles) {
      alert(`Solo puedes subir hasta ${maxFiles} archivos PDF en total`);
      return;
    }

    const newFiles = [...selectedFiles, ...uniqueFiles];
    setSelectedFiles(newFiles);
    
    // Notificar al componente padre sobre el cambio
    if (onPdfsChange) {
      onPdfsChange(newFiles);
    }
    
    // Reiniciar el input para permitir cargar el mismo archivo nuevamente
    e.target.value = null;
  };

  // Eliminar un PDF seleccionado
  const handleRemovePdf = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    // Notificar al componente padre sobre el cambio
    if (onPdfsChange) {
      onPdfsChange(newFiles);
    }
  };

  // Eliminar un PDF existente
  const handleDeleteExisting = (index) => {
    if (onPdfDelete) {
      onPdfDelete(index);
    }
  };

  // Mostrar vista previa de un PDF
  const handlePreview = (url) => {
    setPreviewPdf(url);
  };

  // Cerrar la vista previa
  const closePreview = () => {
    setPreviewPdf(null);
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

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Área de carga */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={selectedFiles.length >= maxFiles}
            aria-label="Seleccionar archivos PDF"
          />
          <Button
            type="button"
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={selectedFiles.length >= maxFiles}
          >
            <FileText className="w-4 h-4" />
            Agregar PDF
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
            <span>Subiendo PDFs...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Lista de PDFs */}
      {(selectedFiles.length > 0 || existingDownloads.length > 0) && (
        <div className="space-y-2">
          {/* PDFs existentes (solo archivos subidos, no URLs) */}
          {existingDownloads
            .filter(dl => dl.file && dl.value && dl.value.startsWith('blob:'))
            .map((dl, index) => (
              <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{dl.key || `PDF ${index + 1}`}</p>
                    <p className="text-xs text-gray-500">Archivo subido</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(dl.value)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExisting(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

          {/* Nuevos PDFs seleccionados */}
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-green-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)} - URL temporal generada</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(URL.createObjectURL(file))}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePdf(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de vista previa */}
      <Dialog open={!!previewPdf} onOpenChange={closePreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>Vista previa del PDF</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full w-10 h-10"
              onClick={closePreview}
              aria-label="Cerrar vista previa"
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                src={previewPdf || ''}
                title="Vista previa del PDF"
                className="w-full h-[80vh] border-0"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfUploader; 