import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SparePartCard } from '../atoms/SparePartCard';

export const SparePartsList = ({
  spareParts = [],
  isLoading = false,
  searchTerm = '',
  onSearchChange = () => {},
  onAddNew = () => {},
  onEdit = () => {},
  onDelete = () => {},
  emptyStateMessage = 'No se encontraron repuestos'
}) => {
  // Si está cargando y no hay repuestos, mostrar skeleton
  if (isLoading && spareParts.length === 0) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 rounded-lg h-80" />
        ))}
      </div>
    );
  }

  // Si no hay repuestos, mostrar estado vacío
  if (spareParts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 text-gray-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No hay repuestos</h3>
        <p className="mt-1 text-sm text-gray-500">
          {emptyStateMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:max-w-md">
          <Input
            type="text"
            placeholder="Buscar por nombre, código o ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
       
      </div>

      {/* Grid de repuestos */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {spareParts.map((sparePart) => (
          <motion.div
            key={sparePart.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SparePartCard
              sparePart={sparePart}
              onClick={() => onEdit(sparePart)}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </div>

      {/* Paginación (opcional) */}
      {/* <div className="flex justify-center mt-8">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div> */}
    </div>
  );
};
