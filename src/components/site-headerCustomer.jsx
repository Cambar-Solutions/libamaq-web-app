import { useRef, useState, useEffect } from "react";
import { SearchForm } from "@/components/search-form"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

import { RiShoppingCartFill } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { FaBars, FaStore, FaTimes } from "react-icons/fa";
import { Menu, MapPin, SidebarIcon } from 'lucide-react';
import DrawerCategories from "./drawerCategories";
import { getAllBrandsWithCategories } from "@/services/public/brandService";

export function SiteHeaderCustomer() {
  const { toggleSidebar } = useSidebar()
  const drawerRef = useRef(null);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState("");

  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const { result = [] } = await getAllBrandsWithCategories();
        // Filtra las activas si quieres
        setBrands(result.filter(b => b.status === "ACTIVE"));
      } catch (err) {
        console.error("Error cargando marcas:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBrands();
  }, []);

  // Función para manejar el cambio de marca en el selector móvil
  const handleBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    if (brandId && drawerRef.current) {
      const selectedBrand = brands.find(b => b.id.toString() === brandId);
      if (selectedBrand) {
        // Cerrar el menú móvil antes de abrir el drawer
        setMenuOpen(false);
        // Esperar a que se cierre el menú antes de abrir el drawer
        setTimeout(() => {
          drawerRef.current.handleBrandClick(selectedBrand);
        }, 300);
      }
    }
  };
  const [menuOpen, setMenuOpen] = useState(false); // Estado para controlar la visibilidad del menú lateral

  const toggleMenu = () => setMenuOpen(!menuOpen);


  return (
    <header
      className="bg-blue-950 top-0 z-50 flex w-full items-center border-b shadow-lg py-4 px-12 justify-between fixed">
      {/* Logo y Toggle Sidebar */}
      <div className="flex items-center gap-5">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-white/10"
          onClick={toggleSidebar}
        >
          <SidebarIcon className="h-5 w-5 text-[#FFB547]" />
        </Button>
        <Link to="/user-home">
          <img src="/Tipografia_LIBAMAQ_legulab_color_hor.png" alt="logo" className="max-h-12" />
        </Link>
        {/* Botón "Ubicación" */}
        <button className="h-8 bg-transparent text-white">
          <Link to="/user-profile" className="flex items-center gap-1 text-white hover:text-yellow-500 transition-colors duration-600 t max-h-1">
            <MapPin size={28} />
            <div className="justify-items-start">
              <p className="text-sm">San Antón</p>
              <p className="text-base">Actualizar ubicación</p>
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

        {/* Btn Ver Marcas */}
        <DrawerCategories ref={drawerRef} />

        {/* Botón "Perfil" */}
        <Link
          to="/user-profile"
          className="group inline-flex items-center"
        >
          <div className="relative">
            {/* Texto */}
            <span className="px-2.5 py-1 bg-white text-black group-hover:text-white text-sm rounded-l-full group-hover:bg-gradient-to-l from-yellow-600 to-yellow-500/80 transition-colors duration-600 inline-block mr-8 max-w-[10em]">
              Hola Jonathan
            </span>

            {/* Círculo del icono */}
            <div className="absolute top-1/2 right-0 w-10 h-10 bg-yellow-600 rounded-full -translate-y-1/2 flex items-center justify-center">
              <GrUserWorker size={20} className="text-white" />
            </div>
          </div>
        </Link>

        {/* Botón "Carrito" */}
        <Link to="/user-profile" state={{ openSection: "carrito" }} className="flex h-12 w-12 justify-center items-center rounded-2x text-white hover:text-yellow-500 transition-colors duration-600">
          <RiShoppingCartFill size={24} className="justify-items-center" />
        </Link>
      </div>
    </header>
  );
}
