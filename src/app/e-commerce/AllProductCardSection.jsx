import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AllProductCardSection({ product }) {
  return (
    <Link to={`/producto/${product.id}`} className="w-full cursor-default">
      <Card className="h-[25em] flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden mx-auto w-full group border border-gray-200">
        <CardHeader className="flex items-center justify-between p-0 h-[10em] overflow-hidden relative">
          <img
            src={product.media && product.media.length > 0 ? product.media[0].url : "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-all duration-900 bg-white"
          />
          {/* Logo de marca eliminado de la esquina superior derecha */}
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between p-4 gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-base font-bold text-gray-900 line-clamp-1 mb-1" title={product.name}>{product.name}</span>
            <CardDescription className="text-gray-600 line-clamp-3 min-h-[48px] mb-2" title={product.description}>{product.description}</CardDescription>
            {product.category && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">Categoría:</span>
                <span className="text-xs font-medium truncate text-gray-700">{product.category.name}</span>
              </div>
            )}
            {/* Separador visual */}
            <div className="my-2 border-t border-gray-100" />
            {product.brand && (
              <div className="flex items-center justify-between gap-2 mt-2 w-full">
                <span className="text-xs font-semibold truncate px-2 py-0.5 rounded-full border" style={{
                  backgroundColor: product.brand.color ? `${product.brand.color}10` : '#f3f4f6',
                  color: product.brand.color || '#374151',
                  borderColor: product.brand.color || '#d1d5db'
                }}>{product.brand.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        className="cursor-pointer ml-auto p-1 rounded-full hover:bg-gray-200 transition-colors"
                        onClick={e => {
                          e.preventDefault();
                          window.location.href = `/producto/${product.id}`;
                        }}
                        aria-label="Ver detalles"
                      >
                        <Eye className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                      Ver detalles
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 