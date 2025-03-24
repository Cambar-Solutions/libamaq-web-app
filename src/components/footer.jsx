import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FaStore } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-l from-gray-100 to-blue-300 text-black py-10 px-6 mt-4">
      <div className="max-w-6xl mx-auto text-center">
        {/* Título principal */}
        <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Conoce más sobre nosotros
        </h3>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
          Ofrecemos herramientas y servicios de alta calidad para profesionales.
        </p>

        {/* Sección de enlaces */}
        <div className="mt-6 flex justify-center space-x-6">
          <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
            Sobre Nosotros
          </Link>
          <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
            Contacto
          </Link>
          <Link to="/privacy" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
            Política de Privacidad
          </Link>
        </div>

        {/* Dirección */}
        <div className="mt-6 text-lg text-gray-700 dark:text-gray-300">
          <p className="font-semibold">Dirección:</p>
          <p>Blvd. Cuahunahuac Km. 3.5 S/N, Col. Puente Blanco, Jiutepec., Centro, 62555 Morelos</p>
        </div>

        {/* Botón Explorar Tienda */}
        <div className="mt-6 mx-auto justify-center flex  ">
        <Button className="bg-white border-2 border-blue-700 text-blue-600 rounded-full hover:bg-gray-200 hover:scale-105 p-3 flex items-center justify-center space-x-2">
  <Link to="/tienda" className="flex items-center justify-center space-x-2">
    <span>Explorar Tienda</span>
    <FaStore />
  </Link>
</Button>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-gray-600 dark:text-gray-400 font-medium">
          <p>&copy; 2025 LIBAMAQ. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
