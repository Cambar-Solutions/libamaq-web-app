import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Dialog as ImageDialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Campos que se mostrarán en el modal
const DISPLAY_FIELDS = [
  'media',
  'createdAt',
  'updatedAt',
  'externalId',
  'name',
  'brandName',
  'categoryName',
  'shortDescription',
  'description',
  'functionalities',
  'technicalData',
  'price',
  'cost',
  'discount',
  'stock',
  'garanty',
  'color',
  'status'
];

// Traducción de claves a español
const FIELD_LABELS = {
  createdAt: 'Creado el',
  updatedAt: 'Actualizado el',
  name: 'Nombre',
  brandName: 'Marca',
  categoryName: 'Categoría',
  shortDescription: 'Descripción corta',
  description: 'Descripción',
  functionalities: 'Funcionalidades',
  technicalData: 'Datos técnicos',
  price: 'Precio',
  cost: 'Costo',
  discount: 'Descuento',
  stock: 'Stock',
  garanty: 'Garantía',
  color: 'Color',
  status: 'Estado',
  externalId: 'ID externo',
  media: 'Imágenes'
};

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return '[Vacío]';
  try {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

function renderValue(key, value, openImageModal) {
  // Manejo de marca y categoría
  if (key === 'brandName' || key === 'categoryName') {
    if (!value || value === '') {
      return <span style={{ color: '#888' }}>[No asignada]</span>;
    }
    return <span className="font-medium">{value}</span>;
  }

  // Manejo de 'media' para mostrar la imagen y hacerla clicable
  if (key === 'media' && Array.isArray(value)) {
    console.log('Media value:', value); // Depuración: ver estructura del array
    let mainImageObj = value.find(m => m.fileType === 'IMAGE' && m.url);
    if (!mainImageObj && value.length > 0) {
      mainImageObj = value.find(m => m.url) || value[0];
    }
    const mainImage = mainImageObj?.url;
    if (mainImage) {
      return (
        <div
          className="relative w-24 h-24 sm:w-32 sm:h-32 cursor-pointer group overflow-hidden border rounded-md"
          onClick={() => openImageModal(mainImage)}
        >
          <img
            src={mainImage}
            alt="Producto"
            className="w-full h-full object-contain"
            style={{ display: 'block' }}
            onError={(e) => {
              console.error('Error loading image:', mainImage, e);
              // e.target.src = 'URL_IMAGEN_PLACEHOLDER_ERROR'; // Deja esta línea comentada o con una URL real si lo necesitas
            }}
          />
          {/* Overlay visual para indicar que es clicable */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-200">
            <span className="text-white opacity-0 group-hover:opacity-100 text-sm">Ver grande</span>
          </div>
        </div>
      );
    }
    return <span style={{ color: '#888' }}>No hay imágenes</span>;
  }

  // Formatear fechas
  if (key === 'createdAt' || key === 'updatedAt') {
    return formatDate(value);
  }

  // Mostrar color como cuadro pequeño
  if (key === 'color') {
    if (!value || value === '') return <span style={{ color: '#888' }}>[Vacío]</span>;
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded border border-gray-300"
          style={{ backgroundColor: value }}
        />
        <span>{value}</span>
      </div>
    );
  }

  // Formatear precio
  if (key === 'price' || key === 'cost' || key === 'discount') {
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#888' }}>[Vacío]</span>;
    }
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }

  // Mostrar technicalData como lista de viñetas clave: valor
  if (key === 'technicalData' && Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#888' }}>[Vacío]</span>;
    return (
      <ul className="list-disc pl-4 text-xs">
        {value.map((item, i) => (
          <li key={i} className="mb-1">
            <b>{item.key}:</b> {item.value}
          </li>
        ))}
      </ul>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#888' }}>[Vacío]</span>;
    // Mostrar arrays de objetos como tabla
    if (typeof value[0] === 'object' && value[0] !== null) {
      return (
        <table className="min-w-full text-xs border mt-1 mb-2">
          <thead>
            <tr>
              {Object.keys(value[0]).map((k) => (
                <th key={k} className="border px-2 py-1 bg-muted/30">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.map((item, idx) => (
              <tr key={idx}>
                {Object.values(item).map((v, i) => (
                  <td key={i} className="border px-2 py-1">{String(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    // Mostrar arrays simples como lista
    return (
      <ul className="list-disc pl-4 text-xs">
        {value.map((v, i) => <li key={i} className="mb-1">{String(v)}</li>)}
      </ul>
    );
  }
  if (typeof value === 'object' && value !== null) {
    return (
      <ul className="pl-4 text-xs">
        {Object.entries(value).map(([k, v]) => (
          <li key={k} className="mb-1"><b>{k}:</b> {String(v)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No';
  }
  if (value === null || value === undefined || value === '') {
    return <span style={{ color: '#888' }}>[Vacío]</span>;
  }
  return String(value);
}

const ViewProductDetailsDialog = ({ open, onOpenChange, productData }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  const openImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // DEBUG: Log para ver qué datos están disponibles
  console.log('📊 PRODUCT DATA:', productData);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del producto</DialogTitle>
            <DialogDescription>
              Visualiza la información registrada para este producto.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh] px-1">
            {productData ? (
              <table className="w-full text-sm border-collapse">
                <tbody>
                  {DISPLAY_FIELDS.map(key => {
                    // Manejo especial para marca y categoría
                    if (key === 'brandName') {
                      const brandId = productData.brandId;
                      let brandName = 'No asignada';
                      
                      if (productData.brandName) {
                        brandName = productData.brandName;
                      } else if (productData.brand?.name) {
                        brandName = productData.brand.name;
                      } else if (brandId) {
                        brandName = `Marca ID: ${brandId}`;
                      }
                      
                      return (
                        <tr key={key} className="align-top border-b last:border-b-0">
                          <td className="font-semibold pr-2 py-1 align-top text-right whitespace-nowrap text-xs text-muted-foreground">
                            {FIELD_LABELS[key] || capitalize(key)}
                          </td>
                          <td className="py-1 pl-2 align-top">
                            {renderValue(key, brandName, openImageModal)}
                          </td>
                        </tr>
                      );
                    }
                    
                    if (key === 'categoryName') {
                      const categoryId = productData.categoryId;
                      let categoryName = 'No asignada';
                      
                      if (productData.categoryName) {
                        categoryName = productData.categoryName;
                      } else if (productData.category?.name) {
                        categoryName = productData.category.name;
                      } else if (categoryId) {
                        categoryName = `Categoría ID: ${categoryId}`;
                      }
                      
                      return (
                        <tr key={key} className="align-top border-b last:border-b-0">
                          <td className="font-semibold pr-2 py-1 align-top text-right whitespace-nowrap text-xs text-muted-foreground">
                            {FIELD_LABELS[key] || capitalize(key)}
                          </td>
                          <td className="py-1 pl-2 align-top">
                            {renderValue(key, categoryName, openImageModal)}
                          </td>
                        </tr>
                      );
                    }
                    
                    const value = productData[key];
                    if (value === undefined) return null;
                    return (
                      <tr key={key} className="align-top border-b last:border-b-0">
                        <td className="font-semibold pr-2 py-1 align-top text-right whitespace-nowrap text-xs text-muted-foreground">
                          {FIELD_LABELS[key] || capitalize(key)}
                        </td>
                        <td className="py-1 pl-2 align-top">
                          {renderValue(key, value, openImageModal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-muted-foreground">No hay datos para mostrar.</div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de imagen ampliada */}
      <ImageDialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl w-full p-2">
          <div className="relative w-full h-[70vh] flex items-center justify-center">
            <img
              src={currentImage}
              alt="Imagen ampliada del producto"
              className="max-w-full max-h-full object-contain rounded-md"
            />
          </div>
          <DialogFooter className="pt-2">
            <Button onClick={() => setIsImageModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </ImageDialog>
    </>
  );
};

export default ViewProductDetailsDialog; 