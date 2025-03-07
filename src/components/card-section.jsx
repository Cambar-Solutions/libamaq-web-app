import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CardSection = ({ title, description, items }) => {
  return (
    <section className="py-10 px-6 w-3/4 m-auto">
      <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
      <p className="text-center mb-4 text-gray-600">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.text}</p>
            </div>
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              {/* Enlace "Ver más" para ir a la página de detalles */}
              <Link to={`/detalle/${item.title}`}>
                <Button className="mt-4 w-full bg-black text-white hover:bg-gray-700">Ver más</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CardSection;
