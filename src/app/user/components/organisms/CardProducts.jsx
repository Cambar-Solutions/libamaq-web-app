import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom"; // Asegúrate de importar Link
import { ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { addProductToCart } from "@/services/customer/shoppingCar";
import { useCartStore } from "@/stores/useCartStore";
import { jwtDecode } from "jwt-decode";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
              <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 mb-8">
                {filteredProducts.map((item, index) => (
                  <Link to={`/producto/${item.id}`} key={index} className="w-full cursor-default">
                    <Card className="h-[25em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden mx-auto w-full group">
                      <CardHeader className="flex items-center justify-center p-0 h-[10em] overflow-hidden">
                        <img
                          src={item.media && item.media.length > 0 ? item.media[0].url : "/placeholder-product.png"}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-108 transition-all duration-800"
                        />
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow justify-between p-3 mt-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2" title={item.name}> {item.name} </CardTitle>
                        <CardDescription className="text-gray-600 mt-1 line-clamp-3" title={item.description}>{item.description}</CardDescription>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <p className="font-bold text-2xl text-blue-700">${item.price.toLocaleString()}</p>
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Link
                                    to={`/producto/${item.id}`}
                                    className="mr-1 w-5 h-5 text-gray-500 transition-colors duration-500 flex items-center justify-center"
                                    aria-label="Ver detalles"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <Eye className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                                  </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                  Ver detalles
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="cursor-pointer mr-2 w-5 h-5 text-gray-500 transition-colors duration-500 flex items-center justify-center "
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      // Obtener userId del token
                                      const token = localStorage.getItem("token");
                                      if (!token) {
                                        toast.error("Debes iniciar sesión para agregar productos al carrito.");
                                        return;
                                      }
                                      let userId;
                                      try {
                                        const decoded = jwtDecode(token);
                                        userId = decoded.sub ? parseInt(decoded.sub, 10) : null;
                                      } catch {
                                        toast.error("Sesión inválida. Inicia sesión de nuevo.");
                                        return;
                                      }
                                      if (!userId) {
                                        toast.error("No se pudo obtener el usuario. Inicia sesión de nuevo.");
                                        return;
                                      }
                                      try {
                                        const now = new Date();
                                        const cartItemData = {
                                          createdBy: "USER",
                                          createdAt: now.toISOString(),
                                          userId,
                                          productId: Number(item.id),
                                          quantity: 1,
                                        };
                                        await addProductToCart(cartItemData);
                                        toast.success("Producto agregado al carrito.");
                                        const refreshCart = useCartStore.getState().refreshCart;
                                        refreshCart && refreshCart();
                                      } catch (err) {
                                        toast.error("Error al agregar el producto al carrito.");
                                      }
                                    }}
                                    aria-label="Agregar al carrito"
                                  >
                                    <ShoppingCart className="w-5 h-5 text-gray-500 hover:text-yellow-600" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                  Agregar al carrito
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
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