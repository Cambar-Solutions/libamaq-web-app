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
    <div>
      {/* Carrusel móvil */}
      <div className="flex items-center justify-between mb-4 sm:hidden">
        <h2 className="text-xl font-bold text-gray-500">Destacados</h2>
        <button
          className="text-blue-500 underline underline-offset-4 hover:text-indigo-800 hover:font-bold hover:transition-all hover:duration-200 hover:ease-in-out flex items-center cursor-pointer"
          onClick={() => {
            setSearchTerm("");
            scrollToSection();
          }}
        > Ver todos <ChevronRightIcon size={16} />
        </button>
      </div>
      <div className="flex overflow-x-auto gap-2 snap-x snap-mandatory sm:hidden bg-white rounded-lg">
        {topSellingItems.map((topSellingItem, index) => (
          <div
            key={`top-mobile-${index}`}
            className="snap-start min-w-[65vw] max-w-[250px] flex-shrink-0"
          >
            <Link to={`/producto/${topSellingItem.product_id}`} className="w-full max-w-[200px] mx-auto cursor-default">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="h-[16em] w-full flex flex-col duration-300 mx-auto "
              >
                <div className="flex flex-col w-full">
                  <ProductImageWithFallback
                    src={topSellingItem.media?.[0]?.url || "/placeholder-product.png"}
                    alt={topSellingItem.product_name || "Producto"}
                    className="max-h-full max-w-full object-contain relative z-10"
                  />
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-800 truncate">{topSellingItem.product_name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{topSellingItem.product_description}</p>
                    </div>
                    <div className="flex items-end justify-end w-full border-t border-gray-100 mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="cursor-pointer ml-auto p-1 mt-2 rounded-full hover:bg-gray-200 transition-colors"
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
      {/* Carrusel desktop (sm+) */}
      <div className="hidden sm:block w-full mb-6 overflow-hidden">
        <div className="rounded-t-[3rem] px-0 pt-0 w-full mx-auto flex-grow">
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-500">Destacados</h2>
              <button
                className="text-blue-500 underline underline-offset-4 hover:text-indigo-800 hover:font-bold hover:transition-all hover:duration-200 hover:ease-in-out flex items-center cursor-pointer"
                onClick={() => {
                  setSearchTerm("");
                  scrollToSection();
                }}
              > Ver todos <ChevronRightIcon size={16} />
              </button>
            </div>
            <div className="relative group">
              <div className="carousel-container overflow-hidden px-0 sm:px-0 rounded-lg">
                <div
                  className="carousel-track group p-0 flex transition-transform duration-300 ease-out justify-start"
                  style={{ paddingBottom: 14, paddingTop: 9, transform: `translateX(-${topSellingCarouselPosition}%)` }}
                >
                  {topSellingItems.map((topSellingItem, index) => (
                    <div
                      key={`top-${index}`}
                      className={`carousel-item p-0 flex-shrink-0 sm:px-0 md:px-0 ${index === 0 ? 'rounded-l-lg' : ''} ${index === topSellingItems.length - 1 ? 'rounded-r-lg' : ''} group-hover:bg-zinc-300`}
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
                      <Link to={`/producto/${topSellingItem.product_id}`} className="w-full max-w-[200px] mx-auto cursor-pointer">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="cardgroup-hover:blur-[0px] hover:!rounded-lg group-hover:!opacity-40 hover:!blur-none hover:!opacity-100 bg-white hover:shadow-md transition-all duration-500 overflow-hidden lg:w-full cursor-default hover:scale-105 group-hover:rounded-none h-[16em] w-[20em] lg:h-auto flex flex-col rounded-2xl lg:rounded-none shadow-md lg:shadow-none duration-300 mx-auto "
                        >
                          <div className="flex flex-col w-full">
                            <ProductImageWithFallback
                              src={topSellingItem.media?.[0]?.url || "/placeholder-product.png"}
                              alt={topSellingItem.product_name || "Producto"}
                              className="max-h-full max-w-full object-contain relative z-10"
                            />
                            <div className="p-4 flex-grow flex flex-col justify-between">
                              <div>
                                <h3 className="text-base sm:text-lg font-medium text-gray-800 truncate">{topSellingItem.product_name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{topSellingItem.product_description}</p>
                              </div>
                              <div className="flex items-end justify-end w-full border-t border-gray-100 mt-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        className="cursor-pointer ml-auto p-1 mt-2 rounded-full hover:bg-gray-200 transition-colors"
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
                {/* Flechas absolutas sobre el carrusel */}
                <div className="flex items-center justify-between">
                  {showTopSellingLeftArrow && (
                    <button
                      className="carousel-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-md cursor-pointer"
                      style={{ transform: 'translateY(-50%)' }}
                      onClick={() => {
                        let itemWidth = 20;
                        if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25;
                        else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333;
                        else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50;
                        else if (window.innerWidth < 640) itemWidth = 100;
                        const newPosition = Math.max(0, topSellingCarouselPosition - itemWidth);
                        setTopSellingCarouselPosition(newPosition);
                        setShowTopSellingLeftArrow(newPosition > 0);
                        setShowTopSellingRightArrow(true);
                      }}
                      aria-label="Anterior"
                    >
                      <ChevronLeft className="text-blue-600" size={20} />
                    </button>
                  )}
                  {showTopSellingRightArrow && (
                    <button
                      className="carousel-next absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-md cursor-pointer"
                      style={{ transform: 'translateY(-50%)' }}
                      onClick={() => {
                        let itemWidth = 20;
                        if (window.innerWidth < 1280 && window.innerWidth >= 1024) itemWidth = 25;
                        else if (window.innerWidth < 1024 && window.innerWidth >= 768) itemWidth = 33.333;
                        else if (window.innerWidth < 768 && window.innerWidth >= 640) itemWidth = 50;
                        else if (window.innerWidth < 640) itemWidth = 100;
                        const maxPosition = Math.max(0, (topSellingItems.length * itemWidth) - 100);
                        const newPosition = Math.min(maxPosition, topSellingCarouselPosition + itemWidth);
                        setTopSellingCarouselPosition(newPosition);
                        setShowTopSellingLeftArrow(true);
                        setShowTopSellingRightArrow(newPosition < maxPosition);
                      }}
                      aria-label="Siguiente"
                    >
                      <ChevronRight className="text-blue-600" size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}