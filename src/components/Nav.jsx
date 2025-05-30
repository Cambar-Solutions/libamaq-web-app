import { useState } from "react";
import { FaStore, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { GrMapLocation } from "react-icons/gr";
import { FaUser } from "react-icons/fa6";
import { Button } from "./ui/button";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(o => !o);

  return (
    <header className="fixed top-0 inset-x-0 z-20 bg-blue-950">
      {/* Mobile header: logo centered + hamburger */}
      <div className="flex items-center justify-between px-4 py-3 md:hidden">
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img
              src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
              alt="logo"
              className="h-8"
            />
          </Link>
        </div>
        <button onClick={toggleMenu} className="text-white">
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-6 z-30">
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-gray-600"
          >
            <FaTimes size={20} />
          </button>
          <nav className="mt-12 flex flex-col space-y-6">
            <Link
              to="/location"
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
              onClick={toggleMenu}
            >
              <GrMapLocation size={20} />
              Ubicaciones
            </Link>
            <Link
              to="/tienda"
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
              onClick={toggleMenu}
            >
              <FaStore size={20} />
              Tienda
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
              onClick={toggleMenu}
            >
              <FaUser size={20} />
              Iniciar sesión
            </Link>
          </nav>
        </div>
      )}

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between py-4 px-12 shadow-lg">
        <button>
          <img
            src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
            alt="logo"
            className="max-h-12"
          />
        </button>
        <div className="flex items-center space-x-4 md:flex ">
          <Button asChild className="flex items-center bg-transparent hover:bg-transparent text-white hover:text-yellow-500 transition-colors duration-400">
            <Link to="/location" className="flex items-center">
              Ubicaciones
              <GrMapLocation className="mr-2" />
            </Link>
          </Button>
          {/* Botón "Explorar Tienda" */}
          <Button asChild className="flex items-center bg-blue-600 hover:bg-blue-900 border border-blue-600 hover:border-white text-white transition-colors duration-600">
            <Link to="/tienda" className="flex items-center">
              Tienda
              <FaStore className="mr-2" />
            </Link>
          </Button>

          {/* Botón "Iniciar Sesión" */}
          <Button asChild className="bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 hover:border-gray-900 transition-colors duration-600">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
