import { useState } from "react";
import { FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú lateral

  // Función para abrir/cerrar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <nav className="bg-white border-gray-400 border-b-2 py-4 px-6 flex justify-between items-center fixed top-0 w-full z-20">
      {/* Logo */}
      <div className="flex items-center">
        <img src="/Tipografia_LIBAMAQ.png" alt="logo" className="max-h-12" />
      </div>

      {/* Menú hamburguesa (solo en pantallas pequeñas) */}
      <div className="md:hidden flex items-center">
        <button onClick={toggleMenu} className="text-blue-600">
          {menuOpen ? (
            <FaTimes size={24} />
          ) : (
            <FaShoppingCart size={24} />
          )}
        </button>
      </div>

      {/* Menú lateral en pantallas pequeñas (desplegándose desde la derecha) */}
      <div
        className={`fixed top-0 right-0 bg-white  p-4 h-full w-64 transform transition-all duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        {/* Botón de cerrar */}
        <button onClick={toggleMenu} className="absolute top-4 right-4 text-2xl text-blue-600">
          <FaTimes />
        </button>

        <div className="flex flex-col items-center space-y-4 mt-12">
          {/* Aquí pueden ir otros enlaces o información adicional */}
        </div>
      </div>

      {/* Menú principal (solo en pantallas grandes) */}
      <div className="flex items-center space-x-6 hidden md:flex">
        {/* Ícono de carrito */}
        <Link to="/cart" className="text-blue-600">
          <FaShoppingCart size={24} />
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
