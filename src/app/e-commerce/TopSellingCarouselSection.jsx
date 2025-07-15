import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, Eye } from "lucide-react";
import ProductImageWithFallback from "./ProductImageWithFallback";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TopSellingCarouselSection({
  topSellingItems,
  topSellingCarouselPosition,
  setTopSellingCarouselPosition,
  showTopSellingLeftArrow,
  setShowTopSellingLeftArrow,
  showTopSellingRightArrow,
  setShowTopSellingRightArrow,
  setSearchTerm,
  scrollToSection
}) {
  return (
    <div className="w-full mb-6 overflow-hidden">
      <div className="rounded-t-[3rem] px-0 pt-0 w-full mx-auto flex-grow">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-500">Los más vendidos</h2>
            <button
              className="text-blue-500 underline underline-offset-4 hover:text-indigo-800 hover:font-bold hover:transition-all hover:duration-200 hover:ease-in-out flex items-center cursor-pointer"
              onClick={() => {
                setSearchTerm("");
                scrollToSection();
              }}
            > Ver todos <ChevronRightIcon size={16} />
            </button>
          </div>
          <div className="">
            <div className="relative group">
              <div className="carousel-container overflow-hidden px-0 sm:px-0 rounded-lg">
                <div
                  className="carousel-track group p-0 flex transition-transform duration-300 ease-out justify-start"
                  style={{ paddingBottom: 14, paddingTop: 9, transform: `translateX(-${topSellingCarouselPosition}%)` }}
                >
                  {topSellingItems.map((topSellingItem, index) => (
                    <div
                      key={`top-${index}`}
                      className={`carousel-item p-0 flex-shrink-0 sm:px-0 md:px-0 ${index === 0 ? 'rounded-l-lg' : ''} ${index === topSellingItem.length - 1 ? 'rounded-r-lg' : ''} group-hover:bg-zinc-300`}
                      style={{
                        paddingInline: 0,
                        width: `${Math.max(
                          20,
                          window.innerWidth >= 1280 ? 20 :
                            window.innerWidth >= 1024 ? 25 :
                              window.innerWidth >= 768 ? 33.333 :
                                window.innerWidth >= 640 ? 50 :
                                  100
                        )}%`
                      }}
                    >
                      <Link to={`/producto/${topSellingItem.product_id}`} key={index} className="w-full p-0 m-0 space-x-0 ">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="cardgroup-hover:blur-[0px] hover:!rounded-lg group-hover:!opacity-40 hover:!blur-none hover:!opacity-100 bg-white hover:shadow-md transition-all duration-500 overflow-hidden w-full cursor-default hover:scale-105 group-hover:rounded-none"
                        >
                          <div className="flex flex-row sm:flex-col w-full">
                            <ProductImageWithFallback
                              src={topSellingItem.media?.[0]?.url || "/placeholder-product.png"}
                              alt={topSellingItem.product_name || "Producto"}
                              className="max-h-full max-w-full object-contain relative z-10"
                            />
                            <div className="w-2/3 sm:w-full p-3 sm:p-4 flex-grow flex flex-col justify-between sm:h-[150px]">
                              <div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate" title={topSellingItem.product_name}>{topSellingItem.product_name}</h3>
                                <p className="text-xs sm:text-sm text-gray-500 line-clamp-2" title={topSellingItem.product_description}>{topSellingItem.product_description}</p>
                              </div>
                              {/* Botón de ver detalles SIEMPRE visible */}
                              <div className="flex items-end justify-end w-full border-t border-gray-100">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="cursor-pointer ml-auto p-1 mt-4 rounded-full hover:bg-gray-200 transition-colors"
                                        onClick={e => {
                                          e.preventDefault();
                                          window.location.href = `/producto/${topSellingItem.product_id}`;
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
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
              {/* Botones de navegación simplificados para topSellingItems */}
              <>
                {showTopSellingLeftArrow && (
                  <button
                    className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                    onClick={() => {
                      let itemWidth = 20;
                      if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25;
                      else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333;
                      else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50;
                      else if (window.innerWidth < 640) itemWidth = 100;
                      const newPosition = Math.max(0, topSellingCarouselPosition - itemWidth);
                      setTopSellingCarouselPosition(newPosition);
                      setShowTopSellingLeftArrow(newPosition > 0);
                      setShowTopSellingRightArrow(true); // Siempre que te muevas a la izquierda, la flecha derecha debería aparecer
                    }}
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="text-blue-600" size={20} />
                  </button>
                )}
                {/* Nota: Necesitas calcular maxPosition para showRightArrow correctamente */}
                {showTopSellingRightArrow && (
                  <button
                    className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-100 rounded-full p-3 shadow-md cursor-pointer transition-opacity duration-300"
                    onClick={() => {
                      let itemWidth = 20;
                      if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25;
                      else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333;
                      else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50;
                      else if (window.innerWidth < 640) itemWidth = 100;

                      // Asegúrate de que topSellingProducts sea el array de productos correcto
                      const maxPosition = Math.max(0, (topSellingItems.length * itemWidth) - 100); // Usar topSellingItems aquí
                      const newPosition = Math.min(maxPosition, topSellingCarouselPosition + itemWidth);
                      setTopSellingCarouselPosition(newPosition);

                      setShowTopSellingLeftArrow(true); // Siempre que te muevas a la derecha, la flecha izquierda debería aparecer
                      setShowTopSellingRightArrow(newPosition < maxPosition);
                    }}
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="text-blue-600" size={20} />
                  </button>
                )}
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 