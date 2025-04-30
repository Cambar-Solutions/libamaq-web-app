import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CardSection = ({ title, description, items }) => {
  return (
    <section className="py-10 px-6 w-full sm:w-3/4 m-auto mb-14">
      <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
      <p className="text-center mb-10 text-gray-600">{description}</p>

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
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.text}</p>
            </div>

            <img
              src={item.image}
              alt={item.title}
              className="w-3/4 mx-auto h-48 object-contain transition-transform duration-300 hover:scale-105"
            />

            <div className="p-4">
              <Link to={`/detalle/${item.title}`}>
                <Button className="w-full mt-4 rounded-2xl bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 cursor-pointer">
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
