import { useState } from "react";
import { FaStore, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Suponiendo que el botón es de tu librería
import { RiShoppingCartFill } from "react-icons/ri";
import { TfiShoppingCartFull } from "react-icons/tfi";
import { GrUserWorker } from "react-icons/gr";
import { SlLocationPin } from "react-icons/sl";
import { MapPin } from 'lucide-react';

const NavClient = () => {
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú lateral

  // Función para abrir/cerrar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-blue-950  dark:bg-gray-800 shadow-lg py-4 px-12 flex justify-between items-center fixed top-0 w-full z-20">
      {/* Logo */}
      <div className="flex items-center gap-5">
        <img src="/Tipografia_LIBAMAQ_legulab_color_hor.png" alt="logo" className="max-h-12" />

        {/* Botón "Ubicación" */}
        <button className="h-12 bg-transparent text-white hover:bg-black hover:text-white transition-colors duration-600">
          <Link to="/location" className="flex items-center gap-2">
            <MapPin size={28} />
            <div className="justify-items-start">
              <p className="text-sm">San Antón</p>
              <p className="text-lg">Actualizar ubicación</p>
            </div>
          </Link>
        </button>
      </div>



      {/* Menú hamburguesa (solo en pantallas pequeñas) */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-blue-600">
          <FaBars size={24} />
        </button>
      </div>

      {/* Menú lateral en pantallas pequeñas */}
      <div
        className={`fixed top-0 right-0 bg-white dark:bg-gray-500 shadow-lg p-4 h-full w-64 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
      >
        <button onClick={toggleMenu} className="absolute top-4 right-4 text-2xl text-blue-600">
          <FaTimes />
        </button>

        <div className="flex flex-col items-center space-y-4 mt-12">
          {/* Botón "Tienda" (igual que en desktop) */}
          <Button
            asChild
            className="flex items-center justify-center bg-blue-100 border-2 border-yellow-500 text-blue-700 hover:bg-gray-100 w-full"
          >
            <Link to="/tienda">
              <FaStore className="mr-2" />
              Tienda
            </Link>
          </Button>

          {/* Botón "Iniciar sesión" (igual que en desktop) */}
          <Button asChild className="w-full">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>


      {/* Menú principal (solo en pantallas grandes) */}
      <div className="flex items-center space-x-4 md:flex">
        {/* Botón "Perfil" */}
        <button asChild className="h-10 w-35 justify-center rounded-2xl flex items-center bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-600">
          <Link to="/perfil" className="flex items-center">
            Hola usuario
            <GrUserWorker size={28} />

          </Link>
        </button>

        {/* Botón "Carrito" */}
        <button asChild className="h-10 w-10 justify-center items-center rounded-2xl bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 hover:border-gray-900 transition-colors duration-600">
          <Link to="/carrito">
            <RiShoppingCartFill size={24} className="justify-items-center"/>

          </Link>
        </button>

        <button asChild className="h-10 w-10 justify-center items-center rounded-2xl bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 hover:border-gray-900 transition-colors duration-600">
          <Link to="/carrito">
            <TfiShoppingCartFull size={24} />


          </Link>
        </button>

      </div>
    </nav>
  );
};

export default NavClient;
