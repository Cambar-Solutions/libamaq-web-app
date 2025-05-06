import { useState } from "react";
import { FaStore, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";


import DrawerCategories from "./drawerCategories";

const Nav2 = () => {
  // Estado para controlar la visibilidad del menú lateral
  const [menuOpen, setMenuOpen] = useState(false);

  // Función para abrir/cerrar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Marcas (idéntico arreglo al de BrandCards, pero solo aquí)
  const brands = [
    { name: "Bosch", slogan: "Innovación para tu vida.", logo: "/logo_bosch.png" },
    { name: "Makita", slogan: "Herramientas electricas.", logo: "/makita.png" },
    { name: "Husqvarna", slogan: "Productos de construcción.", logo: "/husq.png" },
    { name: "Honda", slogan: "Productos de fuerza.", logo: "/honda-fuerza.png" },
    { name: "Marshalltown", slogan: "Herramientas para concreto", logo: "/marshalltown.png" },
    { name: "Mpower", slogan: "Productos de máxima calidad.", logo: "/m-power.webp" },
    { name: "Cipsa", slogan: "Construimos más que obras...", logo: "/cipsa.avif" },
  ];

  return (
    <nav className="bg-blue-950 dark:bg-gray-800 shadow-lg py-4 px-12 flex justify-between items-center fixed top-0 w-full z-20">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
          alt="logo"
          className="max-h-12"
        />
      </div>

      {/* Menú hamburguesa (pantallas pequeñas) */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-blue-600">
          <FaBars size={24} />
        </button>
      </div>

      {/* Sidebar móvil */}
      <div
        className={`fixed top-0 right-0 bg-white dark:bg-gray-500 shadow-lg p-4 h-full w-64 transform transition-all duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"
          } md:hidden`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-2xl text-blue-600"
        >
          <FaTimes />
        </button>

        <div className="flex flex-col items-center space-y-4 mt-12">
          <Button
            asChild
            className="flex items-center justify-center bg-blue-100 border-2 border-yellow-500 text-blue-700 hover:bg-gray-100 w-full"
          >
            <Link to="/tienda">
              <FaStore className="mr-2" />
              Tienda
            </Link>
          </Button>

          <Button asChild className="w-full">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </div>

      {/* Menú desktop */}
      <div className="flex items-center space-x-4 hidden md:flex">
      <DrawerCategories/>

        
        <Button
          asChild
          className="bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 transition-colors duration-600 rounded-full"
        >
          <Link to="/login">Iniciar sesión</Link>
        </Button>

      </div>
    </nav>
  );
};

export default Nav2;
