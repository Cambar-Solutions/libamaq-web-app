import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom"; // Asegúrate de importar Link

export default function CardProducts({ sectionRef, brand, selectedCategory, isLoading, filteredProducts, setSearchTerm }) { // Añade setSearchTerm a las props
  const getTitle = () => {
    if (brand) {
      if (selectedCategory) {
        return `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`;
      }
      return `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`;
    }
    if (selectedCategory) {
      return selectedCategory.replace(/-/g, ' ');
    }
    return 'Todos los productos';
  };

  return (
    <div className="max-w-full mx-auto">
      <div ref={sectionRef} className="max-w-8xl w-full mx-auto px-4">
        <div className="mb-6 mt-8 w-full">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            {getTitle()}
          </h1>
        </div>
        <div className="bg-gray-100 min-h-[90vh] rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full mx-auto flex-grow">
          <div className="w-full mx-auto">
            {isLoading ? (
              <p className="text-center text-gray-600 text-lg py-10">Cargando productos...</p>
            ) : filteredProducts.length > 0 ? (
              <div className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 mb-8">
                {filteredProducts.map((item, index) => (
                  <Link to={`/producto/${item.id}`} key={index} className="w-full">
                    <Card className="h-[25em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden mx-auto w-full cursor-pointer">
                      <CardHeader className="flex items-center justify-center p-0 h-[10em] overflow-hidden">
                        <img
                          src={item.media && item.media.length > 0 ? item.media[0].url : "/placeholder-product.png"}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow justify-between p-3 mt-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2" title={item.name}> {item.name} </CardTitle>
                        <CardDescription className="text-gray-600 mt-1 line-clamp-3" title={item.description}>{item.description}</CardDescription>
                        <p className="mt-auto pt-2 font-bold text-2xl text-blue-700">${item.price.toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
                <button
                  onClick={() => setSearchTerm('')} // Asumiendo que setSearchTerm se pasa como prop
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}