import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/SearchBar";
import { cn } from "@/lib/utils";

const FILTER_OPTIONS = {
  type: [
    { id: 'renta', label: 'Renta', color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' },
    { id: 'compra', label: 'Compra', color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' },
  ],
  payment: [
    { id: 'efectivo', label: 'Efectivo', color: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200' },
    { id: 'transferencia', label: 'Transferencia', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' }
  ],
  status: [
    { id: 'pendiente', label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' },
    { id: 'proceso', label: 'En Proceso', color: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200' },
    { id: 'completado', label: 'Completado', color: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' },
  ]
};

export const OrdersFilters = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: null,
    payment: null,
    status: null,
    period: 'todos'
  });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Handler for explicit search (button click or Enter)
  const handleSearchExecute = (currentSearchText) => {
    onFilterChange?.({
      search: currentSearchText && currentSearchText.length >= 2 ? currentSearchText : undefined,
      ...filters
    });
  };

  // Actualizar los filtros cuando cambian (searchTerm via typing, or other filters)
  useEffect(() => {
    // This effect handles debounced search-as-you-type and changes to other filters.
    // An explicit search via button/Enter calls onFilterChange immediately via handleSearchExecute.
    const timer = setTimeout(() => {
      onFilterChange?.({
        search: searchTerm && searchTerm.length >= 2 ? searchTerm : undefined,
        ...filters
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, filters, onFilterChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: null,
      payment: null,
      status: null,
      period: 'todos'
    });
  };

  const activeFiltersCount = [
    // searchTerm ? 1 : 0, // Excluido del conteo de filtros activos
    filters.type ? 1 : 0,
    filters.payment ? 1 : 0,
    filters.status ? 1 : 0,
    filters.period !== 'todos' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="w-full mb-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200">
      {/* Mobile Header */}
      <div 
        className="md:hidden flex items-center justify-between p-4 border-b cursor-pointer"
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-sm">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          {isMobileFiltersOpen ? (
            <>
              <span className="mr-1">Ocultar</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span className="mr-1">Mostrar</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </div>
      </div>

      {/* Filters Container */}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        isMobileFiltersOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100   "
      )}>
        <div className="p-4 md:p-5 space-y-4">
          {/* Search and Filters Row - Responsive */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 items-center w-full">
            {/* Search Bar */}
            <div className="w-full md:flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                onSearchClick={handleSearchExecute}
                placeholder="Buscar por ID, cliente o producto..."
                className="w-full"
              />
            </div>
            {/* Filters (Periodo, Tipo, Pago, Estado) */}
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto md:items-center">
              {/* Periodo */}
              <div className="w-full md:w-[180px]">
                <Select 
                  value={filters.period}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los pedidos</SelectItem>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Tipo */}
              <div className="w-full md:w-[140px]">
                <Select
                  value={filters.type || 'all'}
                  onValueChange={value => handleFilterChange('type', value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {FILTER_OPTIONS.type.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Pago */}
              <div className="w-full md:w-[140px]">
                <Select
                  value={filters.payment || 'all'}
                  onValueChange={value => handleFilterChange('payment', value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {FILTER_OPTIONS.payment.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Estado */}
              <div className="w-full md:w-[140px]">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={value => handleFilterChange('status', value === 'all' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {FILTER_OPTIONS.status.map(option => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar todos los filtros
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500 mr-1">Filtros activos:</span>
            
            {/* searchTerm ya no se muestra como un badge de filtro activo aquí */}
            
            {Object.entries(filters).map(([key, value]) => {
              if (!value || value === 'todos') return null;
              
              const option = FILTER_OPTIONS[key]?.find(opt => opt.id === value);
              if (!option) return null;
              
              return (
                <Badge 
                  key={`${key}-${value}`} 
                  className={cn("flex items-center gap-1 bg-white border", option.color)}
                >
                  {key === 'type' ? 'Tipo' : key === 'payment' ? 'Pago' : 'Estado'}: {option.label}
                  <button 
                    onClick={() => handleFilterChange(key, value)}
                    className="ml-1 text-current/70 hover:text-current"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
