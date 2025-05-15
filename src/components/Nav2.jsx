import { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DrawerCategories from "./drawerCategories";
import { getAllBrandsWithCategories } from "@/services/public/brandService";

const Nav2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef(null);
  
  // Estado para controlar la visibilidad del menú lateral
  const [menuOpen, setMenuOpen] = useState(false);
  // Estado para almacenar las marcas obtenidas de la API
  const [brands, setBrands] = useState([]);
  // Estado para controlar si se está cargando la información
  const [loading, setLoading] = useState(true);
  // Estado para almacenar la marca seleccionada en móvil
  const [selectedBrandId, setSelectedBrandId] = useState("");

  // Función para abrir/cerrar el menú
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Cargar las marcas desde la API
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const response = await getAllBrandsWithCategories();
        const brandsData = response?.result || [];
        // Filtrar solo marcas activas
        const activeBrands = brandsData.filter(brand => brand.status === 'ACTIVE');
        setBrands(activeBrands);
      } catch (error) {
        console.error('Error al cargar las marcas:', error);
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
  
  // Determinar si estamos en la página de la tienda
  const isInStore = location.pathname === '/tienda' || location.pathname.includes('/productos/');

  return (
    <nav className="bg-blue-950 dark:bg-gray-800 shadow-lg py-4 px-12 flex justify-between items-center fixed top-0 w-full z-50">
      {/* Logo */}
      <div className="flex items-center">
        <div 
          onClick={() => {
            // Forzar una recarga completa para asegurar que se muestre el LoadingScreen
            navigate('/', { replace: true, state: { forceLoading: true } });
          }}
        >
          <img
            src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
            alt="logo"
            className="max-h-12 cursor-pointer"
          />
        </div>
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
          {/* Botón de Tienda (solo se muestra si no estamos ya en la tienda) */}
       
          {/* Selector de marcas para móvil */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Explorar por marca</label>
            <Select
              value={selectedBrandId}
              onValueChange={handleBrandChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()} className="cursor-pointer">
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button asChild className="w-full">
            <Link to="/login">Iniciar sesión</Link>
          </Button>

          <Button
  asChild
  className="w-full bg-transparent border border-blue-700 text-blue-700 hover:bg-blue-50"
>
  <Link to="/register">Crear tu cuenta</Link>
</Button>
        </div>
      </div>

      {/* Menú desktop */}
      <div className="items-center space-x-4 hidden md:flex">
        <DrawerCategories ref={drawerRef} />

        <Button
          asChild
          className="bg-white text-black hover:bg-black hover:text-white border-2 border-gray-900 transition-colors duration-600 rounded-full"
        >
          <Link to="/login">Iniciar sesión</Link>
        </Button>

        
<Button
  asChild
  className="bg-transparent text-white border border-white hover:bg-blue-800  hover:text-white rounded-full transition-all"
>
  <Link to="/register">Crea tu cuenta</Link>
</Button>

      </div>
    </nav>
  );
};

export default Nav2;
