import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CardSection = ({ title, description, items }) => {
  return (
    <section className="py-10 px-6 w-full sm:w-3/4 m-auto">
      <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
      <p className="text-center mb-4 text-gray-600">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transition-all duration-300 ease-in-out">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.text}</p>
            </div>
            <img
              src={item.image}
              alt={item.title}
              className="w-3/4 mx-auto h-48 object-contain"
            />
            <div className="p-4 m-auto">
              {/* Enlace "Ver más" para ir a la página de detalles */}
              <Link to={`/detalle/${item.title}`}>
                <Button className="mt-4 w-4/5 mx-auto flex justify-center rounded-2xl bg-blue-700 text-white hover:bg-gray-700">
                  Ver detalles
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;
