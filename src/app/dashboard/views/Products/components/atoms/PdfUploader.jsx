import { useState } from 'react';
import { FileText, Trash2, Download, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useId } from 'react';

/**
 * Componente para subir y gestionar archivos PDF
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.existingDownloads - Array de descargas existentes (para edición)
 * @param {Function} props.onPdfsChange - Callback cuando cambian los PDFs seleccionados
 * @param {Function} props.onPdfDelete - Callback cuando se elimina un PDF existente
 * @param {boolean} props.isUploading - Indica si se están subiendo archivos
 * @returns {JSX.Element} Componente de carga de PDFs
 */
const PdfUploader = ({
  existingDownloads = [],
  onPdfsChange,
  onPdfDelete,
  isUploading = false,
}) => {
  const [previewPdf, setPreviewPdf] = useState(null);
  const dialogDescriptionId = `pdf-preview-desc-${useId()}`;

  // Manejar la selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Filtrar solo archivos PDF
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Solo se permiten archivos PDF');
      // Reiniciar el input
      e.target.value = null;
      return;
    }
    
    if (pdfFiles.length === 0) {
      e.target.value = null;
      return;
    }
    
    // Notificar al componente padre sobre los archivos seleccionados
    if (onPdfsChange) {
      onPdfsChange(pdfFiles);
    }
    
    // Reiniciar el input para permitir cargar el mismo archivo nuevamente
    e.target.value = null;
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
            disabled={isUploading}
            aria-label="Seleccionar archivos PDF"
          />
          <Button
            type="button"
            variant="default"
            className="gap-2 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
            disabled={isUploading}
          >
            <FileText className="w-4 h-4" />
            {isUploading ? 'Subiendo...' : 'Agregar PDF'}
          </Button>
        </div>
        {isUploading && (
          <span className="text-sm text-blue-600 font-medium">
            Subiendo archivos al servidor...
          </span>
        )}
      </div>

      {/* Lista de PDFs existentes */}
      {existingDownloads.length > 0 && (
        <div className="space-y-2">
          {existingDownloads.map((dl, index) => (
            <div key={`download-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{dl.key || `PDF ${index + 1}`}</p>
                  <p className="text-xs text-gray-500">Documento disponible</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(dl.value)}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                  title="Ver PDF"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteExisting(index)}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                  title="Eliminar PDF"
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
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full w-10 h-10 cursor-pointer"
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