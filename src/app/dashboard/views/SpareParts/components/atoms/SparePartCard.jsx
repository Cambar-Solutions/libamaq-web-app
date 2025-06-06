import { useState, useEffect } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getSparePartById } from '@/services/admin/sparePartService';

export const SparePartCard = ({ sparePart, onClick, onDelete }) => {
  const [detailedSparePart, setDetailedSparePart] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Obtener detalles completos del repuesto al montar el componente
  useEffect(() => {
    const fetchDetails = async () => {
      if (!sparePart?.id) return;
      try {
        setIsLoadingDetails(true);
        const response = await getSparePartById(sparePart.id);
        if (response?.result) {
          setDetailedSparePart(response.result);
        }
      } catch (err) {
        console.error(`Error al obtener detalles del repuesto ${sparePart.id}:`, err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [sparePart.id]);

  // Determinar si hay imágenes disponibles
  const hasImages = sparePart?.media &&
    Array.isArray(sparePart.media) &&
    sparePart.media.length > 0;

  // Obtener la URL de la primera imagen si existe
  const firstImageUrl = Array.isArray(sparePart.media) && sparePart.media.length > 0
    ? sparePart.media[0].url
    : null;

  return (
    <>
      <Card
        onClick={(e) => {
          // Solo abrir el modal de edición si el clic no viene de un botón dentro de la tarjeta
          if (e.target.closest('button') === null) {
            onClick(e);
          }
        }}
        className="
          cursor-pointer
          filter grayscale-[40%] hover:grayscale-0
          transition-filter duration-500
          flex flex-col h-full
          shadow-md hover:shadow-lg
        "
      >
        <CardHeader>
          <div className="relative w-full h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
            {isLoadingDetails ? (
              <div className="animate-pulse w-full h-full bg-gray-200"></div>
            ) : firstImageUrl ? (
              <img
                src={firstImageUrl}
                alt={sparePart.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Si hay más imágenes, intentar con la siguiente
                  const currentIndex = sparePart.media.findIndex(img => img.url === e.target.src);
                  if (currentIndex < sparePart.media.length - 1) {
                    e.target.src = sparePart.media[currentIndex + 1].url;
                  } else {
                    // No hay más imágenes, mostrar placeholder
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.className = 'flex flex-col items-center justify-center w-full h-full';
                    placeholder.innerHTML = `
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-gray-400">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span class="text-sm text-gray-400 mt-2">Error al cargar la imagen</span>
                    `;
                    e.target.parentNode.appendChild(placeholder);
                  }
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span className="text-sm text-gray-400 mt-2">Sin imagen</span>
              </div>
            )}
          </div>
        </CardHeader>
        <div className="rounded-b-xl w-full px-6 py-3 bg-blue-600 text-white relative">
          <CardTitle className="truncate whitespace-nowrap overflow-hidden text-sm md:text-base" title={sparePart.name}>
            {sparePart.name}
          </CardTitle>
          <CardDescription>
            <div className="flex flex-col text-white">
              <span>Código: {sparePart.code}</span>
              <span>Precio: ${sparePart.price}</span>
              <span>Stock: {sparePart.stock}</span>
            </div>
          </CardDescription>

          {/* Botón de eliminar en la esquina inferior derecha */}
          <div className="absolute bottom-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors duration-500"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará el repuesto "{sparePart.name}". Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const success = await onDelete(sparePart);
                if (success) {
                  setIsDeleteDialogOpen(false);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
