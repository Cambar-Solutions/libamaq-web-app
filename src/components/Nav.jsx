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

      {/* Mobile menu drawer - expandiendo de arriba hacia abajo */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-white shadow-lg p-6 z-30 transform transition-all duration-300 ease-in-out ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <img
              src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
              alt="logo"
              className="h-8"
            />
          </Link>
          <button
            onClick={toggleMenu}
            className="text-gray-600"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <nav className="flex flex-col space-y-6">
          <Link
            to="/location"
            className="flex items-center gap-2 text-gray-800 hover:text-blue-600 text-lg py-2"
            onClick={toggleMenu}
          >
            <GrMapLocation size={20} />
            Ubicaciones
          </Link>
          <Link
            to="/tienda"
            className="flex items-center gap-2 text-gray-800 hover:text-blue-600 text-lg py-2"
            onClick={toggleMenu}
          >
            <FaStore size={20} />
            Tienda
          </Link>
          <div className="pt-4">
            <Button asChild className="w-full mb-3">
              <Link to="/login">Iniciar sesión</Link>
            </Button>

            <Button
              asChild
              className="w-full bg-transparent border border-blue-700 text-blue-700 hover:bg-blue-50 transition-all duration-600"
            >
              <Link to="/register">Crear tu cuenta</Link>
            </Button>
          </div>
        </nav>
      </div>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center justify-between py-4 px-12 shadow-lg">
        <Link to="/">
          <img
            src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
            alt="logo"
            className="max-h-12"
          />
        </Link>
        <div className="flex items-center space-x-4 md:flex ">
          <Button
            asChild
            className="flex items-center bg-transparent shadow-transparent text-white hover:text-transparent bg-clip-text bg-no-repeat transition-colors duration-600"
          >
            <Link
              to="/location"
              className="flex items-center group hover:bg-gradient-to-l from-yellow-400 from via-yellow-500 to-orange-600 transition-colors duration-600"
            >
              Ubicaciones
              <GrMapLocation className="mr-2 group-hover:text-yellow-400" />
            </Link>
          </Button>
          {/* Botón "Explorar Tienda" */}
          <Button asChild className="flex items-center bg-blue-600 hover:bg-indigo-800 border-blue-600 border-2 hover:border-white text-white transition-colors duration-600">
            <Link to="/tienda" className="flex items-center">
              Tienda
              <FaStore className="mr-2" />
            </Link>
          </Button>

          {/* Botón "Iniciar Sesión" */}
          <Button asChild className="bg-transparent text-white hover:bg-white hover:text-black border-2 border-white  transition-all duration-600">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
