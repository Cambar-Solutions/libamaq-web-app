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
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.4661262655997!2d-99.17959492373906!3d18.91969495427647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce7481d3aed4c3%3A0x9f4e9f76e3752738!2sBlvd.%20Paseo%20Cuauhn%C3%A1huac%201742%2C%20Puente%20Blanco%2C%2062577%20Jiutepec%2C%20Mor.!5e0!3m2!1ses!2smx!4v1715572500000!5m2!1ses!2smx"
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
            <div className="select-none">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Conoce más sobre nosotros</h3>
              <p className="text-gray-600 mb-6">
                Ofrecemos herramientas y servicios de alta calidad para profesionales.
              </p>
            </div>

            {/* Información de contacto */}
            {/* Información de contacto */}
            <div className="space-y-4">
              {/* Primera ubicación */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600 select-all">
                  Blvd. Paseo Cuauhnáhuac 1742, Puente Blanco, 62577 Jiutepec, Mor.
                </p>
              </div>

              {/* Segunda ubicación */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600 select-all">
                  Carr Federal México-Cuautla 1617, Empleado Postal, 62747 Cuautla, Mor.
                </p>
              </div>

              {/* Teléfono */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600 select-all">+52 735 102 3279</p>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-gray-600 select-all">soporte@libamaq.com</p>
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
                className="bg-white border-2 border-blue-700 text-blue-600 rounded-full hover:bg-blue-700 hover:text-white hover:scale-105 transition-all duration-500"
              >
                <Link to="/tienda" className="flex items-center justify-center space-x-1">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left side - Copyright */}
            <div className="text-black text-sm">
              {new Date().getFullYear()} LIBAMAQ. Todos los derechos reservados.
            </div>
            
            {/* Right side - Made with love and Levsek branding */}
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              {/* Heart message */}
              <div className="flex items-center space-x-2">
                <span className="text-black/70 text-sm">Hecho con</span>
                <span className="text-black text-lg">♥</span>
                <span className="text-black/70 text-sm">para el constructor</span>
              </div>
              
              {/* Levsek branding */}
              <div className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <span className="text-black/50 text-xs">|</span>
                <span className="text-black/50 text-xs">Desarrollado por</span>
                <img 
                  src="/logo_levsek.jpg" 
                  alt="Levsek" 
                  className="h-4 w-4 rounded-sm"
                />
                <span className="text-black/50 text-xs font-medium">Levsek {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}
