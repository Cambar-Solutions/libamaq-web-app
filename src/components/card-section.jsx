import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useFeaturedProducts } from "@/hooks/useFeaturedProducts";

const CardSection = ({ title, description, items: propItems }) => {
  // Utilizamos TanStack Query para obtener los modelos representativos
  // Si se pasan items como prop, los usamos; de lo contrario, usamos el hook
  const { data: queryItems, isLoading } = useFeaturedProducts();
  
  // Usamos los items de las props si están disponibles, de lo contrario usamos los del query
  const items = propItems || queryItems;
  
  // Si está cargando y no hay items de las props, mostramos un indicador de carga
  if (isLoading && !propItems) {
    return (
      <section className="py-10 px-6 w-full sm:w-3/4 m-auto mb-14">
        <h2 className="text-3xl font-bold text-center mb-4 select-none">{title}</h2>
        <p className="text-center mb-10 text-gray-600 select-none">{description}</p>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-10 px-6 w-full sm:w-3/4 m-auto mb-14">
      <h2 className="text-3xl font-bold text-center mb-4 select-none">{title}</h2>
      <p className="text-center mb-10 text-gray-600 select-none">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item, index) => (
        <motion.div
        key={index}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 ease-in-out overflow-hidden
                   w-full max-w-[90%] sm:max-w-full mx-auto"
      >
      
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 select-none">{item.title}</h3>
              <p className="text-sm text-gray-500 select-none">{item.text}</p>
            </div>

            <img
              src={item.image}
              alt={item.title}
              className="w-3/4 mx-auto h-48 object-contain transition-transform duration-600 hover:scale-105"
            />

            <div className="p-4">
              <Link to={`/detalle/${item.title}`}>
                <Button className="w-full mt-4 rounded-2xl bg-blue-500 text-white hover:bg-white hover:text-blue-500 hover:border-blue-500 border-2 transition-colors duration-600 cursor-pointer">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;
