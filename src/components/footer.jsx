import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-white to-blue-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Mapa de Google */}
          <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3775.5347090523106!2d-99.17859732374084!3d18.875999155967237!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce7486dd624777%3A0x0!2sBlvd.+Cuahunahuac+Km.+3.5%2C+Jiutepec%2C+Morelos!5e0!3m2!1ses!2smx!4v1428000000000!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Información de contacto y enlaces */}
          <div className="space-y-8 text-center lg:text-left">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Conoce más sobre nosotros</h3>
              <p className="text-gray-600 mb-6">
                Ofrecemos herramientas y servicios de alta calidad para profesionales.
              </p>
            </div>

            {/* Información de contacto */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600">
                  Blvd. Cuahunahuac Km. 3.5 S/N, Col. Puente Blanco, Jiutepec., Centro, 62577 Morelos
                </p>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600">+52 735 102 3279</p>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600">soporte@libamaq.com</p>
              </div>
            </div>

            {/* Enlaces */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/about" className="text-gray-600 hover:text-blue-600 hover:font-medium transition-colors">
                Sobre Nosotros
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-blue-600 hover:font-medium transition-colors">
                Contacto
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 hover:font-medium transition-colors">
                Política de Privacidad
              </Link>
            </div>

            {/* Redes sociales */}
            <div className="flex gap-4 justify-center lg:justify-start">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>

            {/* Botón de tienda */}
            <div className="flex justify-center lg:justify-start">
              <Button
                className="bg-white border-2 border-blue-700 text-blue-600 rounded-full hover:bg-blue-700 hover:text-white hover:scale-105 transition-transform transition-colors duration-500"
              >
                <Link to="/tienda" className="flex items-center justify-center space-x-2">
                  <span>Explorar Tienda</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-center text-gray-500">
            {new Date().getFullYear()} LIBAMAQ. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
