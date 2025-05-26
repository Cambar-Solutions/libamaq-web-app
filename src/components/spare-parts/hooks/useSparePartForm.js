import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { uploadMedia } from '@/services/admin/mediaService';

export const useSparePartForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', 'SPARE_PART');
      formData.append('entityId', formData.id || '0');
      
      const response = await uploadMedia(formData);
      const newImage = response.data?.[0];
      
      if (newImage) {
        setUploadedImages(prev => [...prev, newImage]);
        toast.success('Imagen subida correctamente');
      }
      return newImage;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      // Asegurarse de incluir las imágenes en los datos a enviar
      const dataToSubmit = {
        ...formData,
        sparePartMultimediaDto: uploadedImages.map(img => ({
          id: img.id,
          url: img.url,
          fileType: img.fileType,
          displayOrder: img.displayOrder || 0
        }))
      };
      
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error al guardar el repuesto:', error);
      toast.error('Error al guardar el repuesto');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar imágenes existentes cuando se edita un repuesto
  useEffect(() => {
    if (initialState?.media?.length > 0) {
      setUploadedImages(initialState.media);
    }
  }, [initialState]);

  return {
    formData,
    setFormData,
    isLoading,
    isUploading,
    uploadedImages,
    handleInputChange,
    handleNumberInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
    setUploadedImages
  };
};
