import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ShoppingCart, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { addProductToCart } from "@/services/customer/shoppingCar";
import { useCartStore } from "@/stores/useCartStore";
import { jwtDecode } from "jwt-decode";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function FC_CardProducts({ sectionRef, brand, selectedCategory, isLoading, filteredProducts, setSearchTerm, searchTerm }) {
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
      <div ref={sectionRef} className="max-w-7xl w-full mx-auto px-0 sm:px-0 lg:px-4">
        <div className="mb-6 lg:mt-8 mt-6 w-full">
          {/* <h1 className="text-xl md:text-2xl font-bold text-gray-500">
            {getTitle()}
          </h1> */}

          {/* Título de la sección de productos */}
          <div className="">
            <h1 className="text-xl md:text-2xl font-bold text-gray-500">
              {/* Aquí la lógica de título debe reflejar los productos que se están mostrando */}
              {/* Asumiendo que 'brand' y 'selectedCategory' son tus estados de filtro */}
              {brand && selectedCategory
                ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`
                : brand
                  ? `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
                  : selectedCategory
                    ? `Productos de la categoría ${selectedCategory.replace(/-/g, ' ')}`
                    : searchTerm // Si hay un término de búsqueda, muestra ese título
                      ? `Resultados para "${searchTerm}"`
                      : 'Todos los productos'} {/* Título por defecto si no hay filtros ni búsqueda */}
            </h1>
          </div>
        </div>
        <div className="sm:bg-gray-100 sm:min-h-[90vh] sm:rounded-t-[2rem] lg:rounded-t-[3rem] sm:shadow-inner px-0 sm:px-2 lg:px-6 py-0 sm:py-5 lg:py-10 mt-6 w-full mx-auto flex-grow">
          <div className="w-full mx-auto">
            {isLoading ? (
              <p className="text-center text-gray-600 text-lg py-10">Cargando productos...</p>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 lg:gap-x-6 sm:gap-x-2 gap-x-2 lg:gap-y-8 sm:gap-y-2 gap-y-2 mb-8">
                {filteredProducts.map((item, index) => (
                  <Link to={`/producto/${item.product_id || item.id}`} key={index} className="w-full cursor-default">
                    <Card className="h-[22em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden mx-auto w-full group relative">
                      <CardHeader className="flex items-center justify-center p-0 h-[10em] overflow-hidden">
                        <img
                          src={item.media && item.media.length > 0 ? item.media[0].url : "/placeholder-product.png"}
                          alt={item.product_name || item.name || "Producto"}
                          className="w-full h-full object-contain group-hover:scale-108 transition-all duration-800"
                        />
                      </CardHeader>
                      <CardContent className="flex flex-col flex-grow justify-between px-3 mt-2">
                        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2"> {item.product_name || item.name} </CardTitle>
                        <CardDescription className="text-gray-600 mt-1 mb-2 line-clamp-2 lg:line-clamp-3">{item.product_description || item.description}</CardDescription>
                        <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mt-auto pt-3 gap-1 sm:gap-0">
                          <div>
                            <div className="bg-red-500 rounded-2xl w-10 justify-items-center">
                              <p className="font-bold text-sm text-white mt-1">-{item.discount}%</p>
                            </div>

                            <p className="font-bold text-2xl text-blue-700 mt-1">${(item.product_price || item.price).toLocaleString()}</p>
                          </div>
                          
                          <div className="flex items-center justify-around w-full mt-2 sm:mt-0 md:hidden">
                            {/* Logo de la marca a la izquierda en móvil */}
                            <div className="flex items-center gap-2">
                              {item.brand?.url && (
                                <img
                                  src={item.brand.url}
                                  alt={item.brand.name}
                                  className="rounded-md object-contain"
                                  style={{ width: '48px', height: '27px', aspectRatio: '16/9', background: '#fff' }}
                                />
                              )}
                            </div>

                            {/* Botones de Ver detalles y Agregar al carrito a la derecha en móvil */}
                            <div className="flex items-center gap-3">
                              {/* <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Link
                                      to={`/producto/${item.id}`}
                                      className="mr-1 w-6 lg:w-5 h-6 lg:h-5 text-gray-500 transition-colors duration-500 flex items-center justify-center"
                                      aria-label="Ver detalles"
                                      onClick={e => e.stopPropagation()}
                                    >
                                      <Eye className="w-6 lg:w-5 h-6 lg:h-5 text-gray-500 hover:text-blue-600" />
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                    Ver detalles
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider> */}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="cursor-pointer mr-2 w-6 lg:w-5 h-6 lg:h-5 text-gray-500 transition-colors duration-500 flex items-center justify-center "
                                      onClick={async (e) => {
                                        e.preventDefault();
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
                                            productId: Number(item.product_id || item.id),
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
                                      <ShoppingCart className="w-6 lg:w-5 h-6 lg:h-5 text-gray-500 hover:text-yellow-600" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                    Agregar al carrito
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      {/* Barra inferior animada solo en desktop */}
                      <div className="hidden md:block relative">
                        <div className="absolute left-0 bottom-0 w-full h-15 overflow-visible pointer-events-none">
                          <div
                            className="group-hover:-translate-y-5 translate-y-5 group-hover:opacity-100 opacity-0 transition-all duration-600 ease-in-out w-full h-10 flex items-center px-4 rounded-b-lg pointer-events-auto bg-transparent border-t border-gray-200 mt-5">
                            {item.brand?.url && (
                              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 mt-1">
                                <img
                                  src={item.brand.url}
                                  alt={item.brand.name}
                                  className="rounded-md object-contain"
                                  style={{ width: '48px', height: '27px', aspectRatio: '16/9', background: '#fff' }}
                                />
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-1 ml-auto">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      className="cursor-pointer p-1 rounded-full"
                                      onClick={async (e) => {
                                        e.preventDefault();
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
                                            productId: Number(item.product_id || item.id),
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
                                      <ShoppingCart className="w-5 h-5 text-gray-500 hover:text-yellow-600 transition-colors duration-500" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                    Agregar al carrito
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className="cursor-pointer p-1 rounded-full"
                                      onClick={e => {
                                        e.preventDefault();
                                        window.location.href = `/producto/${item.id}`;
                                      }}
                                      aria-label="Ver detalles"
                                    >
                                      <Eye className="w-5 h-5 text-gray-500 hover:text-blue-500 transition-colors duration-500" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-md">
                                    Ver detalles
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-xl underline underline-offset-5 p-2">No se encontraron productos que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}