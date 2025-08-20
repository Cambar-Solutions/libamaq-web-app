import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Tag } from "lucide-react";

/**
 * Componente simplificado para asignar categorías a marcas
 * Solo permite asignar/desasignar categorías existentes, sin CRUD
 */
const CategoryAssignmentManager = ({ 
  categories = [], 
  selectedCategories = [], 
  onCategoriesChange
}) => {
  return (
    <div className="space-y-4">
      {/* Lista de categorías asignadas */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Categorías asignadas:</Label>
        <div className="grid gap-3">
          {categories
            .filter(cat => selectedCategories.includes(cat.id.toString()))
            .map(cat => {
              const displayName = cat.name || cat.description || "Sin nombre";
              return (
                <div key={cat.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-shrink-0">
                    {cat.url ? (
                      <img
                        src={cat.url}
                        alt={displayName}
                        className="w-12 h-12 object-contain rounded-md bg-white border border-gray-200 p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center ${cat.url ? 'hidden' : 'flex'}`}
                    >
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-sm text-blue-900 truncate">{displayName}</h4>
                    {cat.description && cat.description !== displayName && (
                      <p className="text-xs text-blue-700 truncate mt-0.5">{cat.description}</p>
                    )}
                    <p className="text-xs text-blue-600 mt-0.5">ID: {cat.id}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0 hover:bg-blue-100 text-blue-700 hover:text-blue-900"
                    onClick={() => onCategoriesChange(selectedCategories.filter(id => id !== cat.id.toString()))}
                    title={`Quitar categoría: ${displayName}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          {selectedCategories.length === 0 && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay categorías asignadas</p>
                <p className="text-xs text-gray-400 mt-1">Selecciona categorías de la lista de abajo</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Lista de categorías disponibles */}
      <div>
        <Label className="mb-3 block text-sm font-medium">Categorías disponibles:</Label>
        <div className="grid gap-3 max-h-80 overflow-y-auto">
          {categories
            .filter(cat => !selectedCategories.includes(cat.id.toString()) && cat.status === 'ACTIVE')
            .map(cat => {
              const displayName = cat.name || cat.description || "Sin nombre";
              return (
                <div 
                  key={cat.id} 
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    onCategoriesChange([...selectedCategories, cat.id.toString()]);
                  }}
                >
                  <div className="flex-shrink-0">
                    {cat.url ? (
                      <img
                        src={cat.url}
                        alt={displayName}
                        className="w-12 h-12 object-contain rounded-md bg-white border border-gray-200 p-1"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-12 h-12 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center ${cat.url ? 'hidden' : 'flex'}`}
                    >
                      <Tag className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{displayName}</h4>
                    {cat.description && cat.description !== displayName && (
                      <p className="text-xs text-gray-600 truncate mt-0.5">{cat.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">ID: {cat.id}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategoriesChange([...selectedCategories, cat.id.toString()]);
                      }}
                    >
                      Asignar
                    </Button>
                  </div>
                </div>
              );
            })}
          {categories.filter(cat => !selectedCategories.includes(cat.id.toString()) && cat.status === 'ACTIVE').length === 0 && (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center">
                <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No hay más categorías disponibles</p>
                <p className="text-xs text-gray-400 mt-1">
                  {categories.length === 0 
                    ? "No hay categorías creadas" 
                    : "Todas las categorías activas ya están asignadas"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryAssignmentManager;