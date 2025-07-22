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
import StarRating from './StarRating';

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

  // Mostrar toda la media: imágenes y archivos (PDF, etc.)
  if (key === 'media' && Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#888' }}>[Vacío]</span>;
    // Renderiza solo la fila de imágenes, fuera de la tabla de detalles
    const files = value.filter(item => item.fileType !== 'IMAGE' && item.url);
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Imágenes</div>
        <div style={{ maxWidth: '100%', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 6 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {value.map((item, idx) => {
              if (item.fileType === 'IMAGE' && item.url) {
                return (
                  <div
                    key={item.url || idx}
                    onClick={() => openImageModal(item.url)}
                    style={{ flex: '0 0 auto', width: 90, height: 90, cursor: 'pointer', borderRadius: 8, border: '1px solid #eee', background: '#fff' }}
                  >
                    <img
                      src={item.url}
                      alt={`Producto ${idx + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', borderRadius: 8 }}
                      onError={e => {
                        if (!e.target.src.endsWith('placeholder.png')) {
                          e.target.src = '/placeholder.png';
                        }
                      }}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
        {/* Archivos (PDFs y otros) */}
        {files.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Archivos</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {files.map((item, idx) => (
                <a
                  key={item.url || idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid #eee', borderRadius: 8, background: '#fafafa', fontSize: 13, textDecoration: 'none', color: '#333' }}
                >
                  {item.fileType === 'PDF' ? <span role="img" aria-label="PDF">📄</span> : <span role="img" aria-label="Archivo">📎</span>}
                  <span>{item.name || item.url.split('/').pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mostrar downloads como lista de enlaces
  if (key === 'downloads' && Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#888' }}>[Vacío]</span>;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>Archivos descargables</div>
        <ul className="list-disc pl-4 text-xs">
          {value.map((item, idx) => (
            <li key={idx}>
              <a href={item.value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {item.key || 'Descargar archivo'}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
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
        <DialogContent className="max-w-2xl" style={{ overflowX: 'unset' }}>
          <DialogHeader>
            <DialogTitle>Detalles del producto</DialogTitle>
            <DialogDescription>
              Visualiza la información registrada para este producto.
            </DialogDescription>
          </DialogHeader>
          {/* Ranking destacado al inicio */}
          {typeof productData?.ranking !== 'undefined' && (
            <div className="mb-6 flex flex-col items-start">
              <span className="font-semibold text-base text-gray-800 mb-1">Ranking</span>
              <StarRating value={productData.ranking || 0} readOnly />
            </div>
          )}
          <div className="overflow-y-auto max-h-[60vh] px-1" style={{ overflowX: 'unset' }}>
            {productData ? (
              <>
                {/* Fila de imágenes independiente, en card */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 1px 4px 0 #0001' }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, color: '#1e293b', letterSpacing: 0.2 }}>Imágenes del producto</div>
                  {renderValue('media', productData['media'], openImageModal)}
                </div>
                {/* Tabla de detalles en card */}
                <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 1px 4px 0 #0001', border: '1px solid #f1f5f9' }}>
                  <table className="w-full text-sm border-collapse">
                    <tbody>
                      {DISPLAY_FIELDS.filter(key => key !== 'media').map(key => {
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
                </div>
                {/* Archivos (PDFs y otros) debajo de la tabla, en card */}
                {Array.isArray(productData.media) && productData.media.some(item => item.fileType !== 'IMAGE') && (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 1px 4px 0 #0001' }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, color: '#1e293b', letterSpacing: 0.2 }}>Archivos adjuntos</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      {productData.media.filter(item => item.fileType !== 'IMAGE' && item.url).map((item, idx) => (
                        <a
                          key={item.url || idx}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', fontSize: 15, textDecoration: 'none', color: '#2563eb', fontWeight: 500, boxShadow: '0 1px 2px #0001', transition: 'background 0.2s', minWidth: 160 }}
                          onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'}
                          onMouseOut={e => e.currentTarget.style.background = '#fff'}
                        >
                          {item.fileType === 'PDF' ? <span role="img" aria-label="PDF" style={{ fontSize: 22 }}>📄</span> : <span role="img" aria-label="Archivo" style={{ fontSize: 22 }}>📎</span>}
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{item.name || item.url.split('/').pop()}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {/* Descargas por URL en card */}
                {Array.isArray(productData.downloads) && productData.downloads.length > 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: '0 1px 4px 0 #0001' }}>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 10, color: '#1e293b', letterSpacing: 0.2 }}>Archivos descargables</div>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {productData.downloads.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: 8 }}>
                          <a href={item.value} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 500, textDecoration: 'underline', fontSize: 15 }}>
                            {item.key || 'Descargar archivo'}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
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
        <DialogContent className="max-w-3xl w-full p-2 bg-white">
          <div className="relative w-full h-[70vh] flex items-center justify-center bg-white rounded-md">
            <img
              src={currentImage}
              alt="Imagen ampliada del producto"
              className="max-w-full max-h-full object-contain bg-white rounded-md"
              style={{ background: 'white' }}
              onError={e => {
                e.target.src = '/placeholder.png'; // Cambia por tu placeholder real si tienes uno
              }}
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