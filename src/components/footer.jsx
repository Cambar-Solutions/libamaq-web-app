import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-l from-gray-100 to-blue-200 text-black py-10 px-6 mt-4">
      <div className="max-w-6xl mx-auto text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          Conoce más sobre nosotros
        </h3>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Ofrecemos herramientas y servicios de alta calidad para profesionales.
        </p>

        <div className="mt-6 flex justify-center space-x-6">
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Sobre Nosotros
          </Link>
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Contacto
          </Link>
          <Link to="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-blue-500">
            Política de Privacidad
          </Link>
        </div>

        <div className="mt-6">
        <Button className="bg-white text-blue-600 hover:bg-gray-200 p-4">
            Explorar Tienda
          </Button>
        </div>

        <div className="mt-6 text-gray-600 dark:text-gray-400 font-bold">
          <p>&copy; 2025 LIBAMAQ. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
