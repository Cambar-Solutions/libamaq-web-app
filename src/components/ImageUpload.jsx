import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon } from "lucide-react";

export function ImageUpload({ onUpload, loading, accept = "image/*", multiple = false }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files);
      e.target.value = '';
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-gray-50'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      <div className="flex flex-col items-center space-y-4">
        {loading ? (
          <div className="animate-pulse">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <ImageIcon className="w-12 h-12 text-gray-400" />
        )}
        <div className="text-center">
          <Button
            type="button"
            variant={isDragging ? "secondary" : "outline"}
            onClick={handleClick}
            disabled={loading}
            className="mb-2"
          >
            {loading ? "Subiendo..." : "Seleccionar Imágenes"}
          </Button>
          <p className="text-sm text-gray-500">
            {isDragging ? (
              <span className="text-blue-500 font-medium">Suelta las imágenes aquí</span>
            ) : (
              <span>
                Arrastra y suelta imágenes aquí o{" "}
                <span className="text-blue-500">selecciona archivos</span>
              </span>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {multiple ? "Puedes seleccionar múltiples imágenes" : "Selecciona una imagen"}
          </p>
        </div>
      </div>
    </div>
  );
}
