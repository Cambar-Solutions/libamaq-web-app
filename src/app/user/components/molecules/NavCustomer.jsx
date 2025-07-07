import { useRef, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getCustomerUsers } from "@/services/admin/userService";
import { Link } from "react-router-dom";
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
import { jwtDecode } from "jwt-decode";
import { getUserById } from "@/services/admin/userService";
import useLocationStore from "@/stores/useLocationStore";

export function NavCustomer({ onViewChange }) {
    const navigate = useNavigate();
    // Initialize userInfo with sensible defaults, or null if you want to explicitly check for loaded data
    const [userInfo, setUserInfo] = useState({ name: "Invitado", email: "" });
    const [editing, setEditing] = useState(false);
    const { toggleSidebar } = useSidebar();
    const drawerRef = useRef(null);

    const [brands, setBrands] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [loading, setLoading] = useState(true); // This loading state is for brands data
    const [userLoading, setUserLoading] = useState(true); // New loading state for user info
    const [menuOpen, setMenuOpen] = useState(false);

    // Location states from Zustand store
    const {
        currentLocation,
        locationLoading,
        locationError,
        getCurrentLocation,
        loadSavedLocation
    } = useLocationStore();

    const toggleMenu = () => setMenuOpen(o => !o);

    // Load saved location when component mounts
    useEffect(() => {
        loadSavedLocation();
    }, [loadSavedLocation]);

    // Effect for fetching brands data (this is the same as in SiteHeaderCustomer)
    useEffect(() => {
        (async () => {
            try {
                const { result = [] } = await getAllBrandsWithCategories();
                setBrands(result.filter(b => b.status === "ACTIVE"));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false); // Brands loading is complete
            }
        })();
    }, []);

    const handleBrandChange = (brandId) => {
        setSelectedBrandId(brandId);
        if (brandId && drawerRef.current) {
            const selectedBrand = brands.find(b => b.id.toString() === brandId);
            if (selectedBrand) {
                setMenuOpen(false);
                setTimeout(() => {
                    drawerRef.current.handleBrandClick(selectedBrand);
                }, 300);
            }
        }
    };

    // Effect for fetching user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No se encontró token de autenticación para el navbar.");
                    // No redirection needed here, just show "Hola Invitado"
                    setUserInfo({ name: "Invitado", email: "" });
                    setUserLoading(false); // User loading is complete, no user found
                    return;
                }

                const decoded = jwtDecode(token);
                const userId = decoded.sub;

                const user = await getUserById(userId);
                setUserInfo({ name: user.name, email: user.email });
                setUserLoading(false); // User data loaded
            } catch (error) {
                console.error("Error al obtener el usuario para el navbar:", error);
                setUserInfo({ name: "Invitado", email: "" }); // Fallback to "Invitado" on error
                setUserLoading(false); // User loading is complete, but with an error
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this runs once on mount

    // If both brands and user info are loading, show a general loading state.
    // However, for the navbar, it's usually better to render with default values
    // and let the user info load asynchronously.
    // This `if (loading)` block seems to be tied to brands, let's refine it.
    // if (loading) {
    //   return (
    //     <div className="flex justify-center items-center h-64">
    //       {/* Cargando… */}
    //     </div>
    //   );
    // }

    return (
        <header className="fixed top-0 inset-x-0 z-50 bg-blue-950 border-b shadow-lg">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-4 py-3 sm:hidden">
                <div className="flex-1 flex justify-center">
                    <Link to="/user-home">
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



                        <button onClick={() =>
                            navigate('/user-profile', {
                                state: { view: 'perfil', openLocation: true }
                            })}
                            className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
                        >
                            <MapPin size={20} />
                            Actualizar ubicación
                        </button>

                        <Link to="/user-profile"
                            onClick={() => { onViewChange("perfil"); setMenuOpen(false); }}
                            className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
                        >
                            <GrUserWorker size={20} />
                            Mi perfil
                        </Link>

                        <button
                            onClick={() => navigate('/user-profile', { state: { view: 'carrito' } })}
                            className="flex items-center gap-2 text-gray-800 hover:text-blue-600"
                        >
                            <RiShoppingCartFill size={20} />
                            Mi Carrito
                        </button>
                    </nav>
                </div>
            )}

            {/* Desktop header */}
            <div className="hidden sm:flex items-center justify-between px-12 py-4">
                <div className="flex items-center gap-5">
                    <Link to="/user-home">
                        <img
                            src="/Tipografia_LIBAMAQ_legulab_color_hor.png"
                            alt="logo"
                            className="max-h-12"
                        />
                    </Link>

                    <div className="flex flex-col">
                        <button
                            className="cursor-pointer flex items-center gap-1 text-white hover:text-yellow-500 transition-colors duration-600"
                            onClick={() => navigate('/user-profile', { state: { view: 'perfil', openLocation: true } })}
                        >
                            <MapPin size={28} />
                            <div className="text-left">
                                <p className="text-sm">{currentLocation}</p>
                                <p className="text-base">Actualizar ubicación</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-4 md:flex">
                    {/* Btn Ver Marcas */}
                    <DrawerCategories ref={drawerRef} />

                    {/* Botón "Perfil" */}
                    <Link to="/user-profile">
                        <button
                            className="group inline-flex items-center cursor-pointer"
                        >
                            <div className="relative">
                                {/* Texto */}
                                <span className="px-2.5 pr-4 py-1 bg-white text-black group-hover:text-white text-sm rounded-l-full group-hover:bg-gradient-to-l from-yellow-600 to-yellow-500/80 transition-colors duration-600 inline-block mr-8 max-w-[10em]">
                                    Hola {userLoading ? "Cargando..." : userInfo.name}
                                </span>

                                {/* Círculo del icono */}
                                <div className="absolute top-1/2 right-0 w-10 h-10 bg-yellow-600 rounded-full -translate-y-1/2 flex items-center justify-center">
                                    <GrUserWorker size={20} className="text-white" />
                                </div>
                            </div>
                        </button>
                    </Link>

                    {/* Botón "Carrito" */}
                    <button
                        onClick={() => navigate('/user-profile', { state: { view: 'carrito' } })}
                        className="cursor-pointer flex h-12 w-12 justify-center items-center rounded-2x text-white hover:text-yellow-500 transition-colors duration-600">

                        <RiShoppingCartFill size={24} className="justify-items-center" />
                    </button>
                </div>
            </div>
        </header>
    );
}