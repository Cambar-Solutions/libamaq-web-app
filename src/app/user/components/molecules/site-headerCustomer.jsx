import { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getCustomerUsers } from "@/services/admin/userService";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { RiShoppingCartFill } from "react-icons/ri";
import { GrUserWorker } from "react-icons/gr";
import { FaBars, FaTimes, FaStore } from "react-icons/fa";
import { MapPin, SidebarIcon } from 'lucide-react';
import DrawerCategories from "../../../../components/drawerCategories";
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useLocationStore from "@/stores/useLocationStore";
import { useCartStore } from "@/stores/useCartStore";
import { jwtDecode } from "jwt-decode";

export function SiteHeaderCustomer({ onViewChange, userInfo }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const { toggleSidebar } = useSidebar();
  const drawerRef = useRef(null);

  const [brands, setBrands] = useState([]);
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.cartCount);
  const refreshCart = useCartStore((state) => state.refreshCart);

  // States for location
  const {
    currentLocation,
    locationLoading,
    locationError,
    getCurrentLocation,
    loadSavedLocation
  } = useLocationStore();

  const toggleMenu = () => setMenuOpen(o => !o);

  useEffect(() => {
    (async () => {
      try {
        const response = await getAllBrandsWithCategories();
        console.log("Respuesta de marcas SiteHeader:", response);
        // Soporta array directo o { data: [...] }
        const brandsData = Array.isArray(response) ? response : (response?.data || []);
        setBrands(brandsData.filter(b => b.status === "ACTIVE"));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load saved location when component mounts
  useEffect(() => {
    loadSavedLocation();
  }, [loadSavedLocation]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleBrandChange = (brandId) => {
    setSelectedBrandId(brandId);
    if (brandId && drawerRef.current) {
      const selectedBrand = brands.find(b => b.id.toString() === brandId);
      if (selectedBrand) {
        // Close mobile menu before opening drawer
        setMenuOpen(false);
        // Wait for menu to close before opening drawer
        setTimeout(() => {
          drawerRef.current.handleBrandClick(selectedBrand);
        }, 300);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Loading profile… */}
      </div>
    );
  }

  // Función para determinar si la tienda está abierta
  function getStoreStatus() {
    const now = new Date();
    const day = now.getDay(); // 0=domingo, 1=lunes, ...
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Horarios según la imagen
    // 0: domingo, 1: lunes, ..., 6: sábado
    if (day === 0) return "Cerrado"; // Domingo
    if (day === 6) {
      // Sábado: 8:30 a 13:30
      if (
        (hour > 8 || (hour === 8 && minute >= 30)) &&
        (hour < 13 || (hour === 13 && minute <= 30))
      ) {
        return "Abierto";
      } else {
        return "Cerrado";
      }
    }
    // Lunes a viernes: 8:00 a 18:00
    if (hour >= 8 && hour < 18) {
      return "Abierto";
    }
    if (hour === 18 && minute === 0) {
      return "Abierto"; // justo a las 18:00
    }
    return "Cerrado";
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-blue-950 border-b shadow-lg">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-3 sm:hidden">
        {/* Left: toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="text-white p-1"
          aria-label="Abrir menú lateral"
        >
          <SidebarIcon className="h-6 w-6 text-[#FFB547]" />
        </button>
        {/* Logo centered */}
        <div className="flex-1 flex justify-center">
          <Link to="/user-home">
            <img
              src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
              alt="logo"
              className="h-8"
            />
          </Link>
        </div>
        {/* Hamburger */}
        <button onClick={toggleMenu} className="text-white">
          {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden fixed top-0 right-0 w-64 h-full bg-white shadow-lg p-6 z-40">
          <button
            onClick={toggleMenu}
            className="absolute top-4 right-4 text-gray-600"
          >
            <FaTimes size={20} />
          </button>
          <nav className="mt-12 flex flex-col space-y-8">
            {/* Info de usuario */}
            <div className="w-full mb-5 p-2 border-b-2 border-yellow-600">
              <p className="text-base font-semibold text-gray-800">{userInfo.name} {userInfo.lastName}</p>
              {userInfo.email && (
                <p className="text-sm text-gray-600">{userInfo.email}</p>
              )}
            </div>
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
                <SelectContent className="bg-blue-100">
                  {brands.map((brand) => (
                    <SelectItem
                      key={brand.id}
                      value={brand.id.toString()}
                      className="cursor-pointer">
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">


              <button
                onClick={() =>
                  navigate('/user-profile', {
                    state: { view: 'perfil', openLocation: true }
                  })}
                className="flex items-center gap-2 text-gray-800 hover:text-blue-600"

              >
                <MapPin size={20} />
                {getStoreStatus()}
              </button>
            </div>

            <button
              onClick={() => { onViewChange("perfil"); setMenuOpen(false); }}
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
            >
              <GrUserWorker size={20} />
              Mi perfil
            </button>

            <button
              onClick={() => { onViewChange("carrito"); setMenuOpen(false); }}
              className="flex items-center gap-2 text-gray-800 hover:text-blue-600 relative"
            >
              <RiShoppingCartFill size={20} />
              Mi Carrito
              {cartCount > 0 && (
                <span className="absolute -top-2 left-3 bg-yellow-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors duration-600">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}

      {/* Desktop header */}
      <div className="hidden sm:flex items-center justify-between px-12 py-4">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/10 cursor-pointer"
            onClick={toggleSidebar}
          >
            <SidebarIcon className="h-5 w-5 text-[#FFB547]" />
          </Button>
          <Link to="/user-home">
            <img
              src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
              alt="logo"
              className="max-h-12"
            />
          </Link>

          <button
            className="cursor-pointer flex items-center gap-1 text-white hover:text-yellow-500 transition-colors duration-600"
            onClick={() => navigate('/user-profile', { state: { view: 'perfil', openLocation: true } })}
          >
            <MapPin size={28} />
            <div className="text-left">
              <p className="text-sm line-clamp-1 max-w-[26em]">{currentLocation}</p>
              <p className="text-base">{getStoreStatus()}</p>
            </div>
          </button>
        </div>

        <div className="flex items-center space-x-4 md:flex">

          {/* Btn Ver Marcas */}
          <DrawerCategories ref={drawerRef} />

          {/* Botón "Perfil" */}
          <button
            onClick={() => onViewChange("perfil")}
            className="group inline-flex items-center cursor-pointer"
          >
            <div className="relative">
              {/* Texto */}
              <span className="px-2.5 pr-4 py-1 bg-white text-black group-hover:text-white text-sm rounded-l-full group-hover:bg-gradient-to-l from-yellow-600 to-yellow-500/80 transition-colors duration-600 inline-block mr-8 max-w-[10em]">
                Hola {userInfo.name}
              </span>

              {/* Círculo del icono */}
              <div className="absolute top-1/2 right-0 w-10 h-10 bg-yellow-600 rounded-full -translate-y-1/2 flex items-center justify-center">
                <GrUserWorker size={20} className="text-white" />
              </div>
            </div>
          </button>

          {/* Botón "Carrito" */}
          <button
            onClick={() => onViewChange("carrito")}
            className="cursor-pointer flex h-12 w-12 justify-center items-center rounded-2x text-white hover:text-yellow-500 transition-colors duration-600 relative group">

            <RiShoppingCartFill size={24} className="justify-items-center" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-1 bg-yellow-600 text-white text-[13px] font-semibold rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-yellow-400 group-hover:text-black transition-colors duration-600">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
