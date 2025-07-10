import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Shield, Home, ChevronLeft } from "lucide-react";
import { getActiveProductById } from "@/services/public/productService";
import ShareProduct from "@/components/ShareProduct";
import { toast } from "sonner";
import Nav2 from "@/components/Nav2";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { MapPin, MapPinHouse, MapPinPlus, Captions, Banknote } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion"
import { NavCustomer } from "../user/components/molecules/NavCustomer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { FiNavigation } from "react-icons/fi";
import useLocationStore from "@/stores/useLocationStore";

export default function PaymentMethod() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [highlightActive, setHighlightActive] = useState(false);
    const { currentLocation, setLocation } = useLocationStore();
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    const [shippingOption, setShippingOption] = useState(null);
    const [history, setHistory] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userAddress, setUserAddress] = useState({
        street: "Calle Del Salto 123",
        colony: "Colonia San Antón",
        zipCode: "62000",
        state: "Morelos",
        city: "Cuernavaca",
    }); // Estado para simular la ubicación actual del usuario
    const [showLocationForm, setShowLocationForm] = useState(false); // Nuevo estado para controlar la visibilidad del formulario

    // Estado para el formulario de dirección de envío
    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México',
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    // Handler para campos controlados
    const handleShippingInputChange = (field, value) => {
        setShippingAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Función para obtener la ubicación actual y autocompletar
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
          toast.error('La geolocalización no está disponible en este navegador');
          return;
        }
    
        setIsGettingLocation(true);
    
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              
              // Usar un servicio de geocodificación inversa para obtener la dirección
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es`
              );
              
              if (!response.ok) {
                throw new Error('Error al obtener la dirección');
              }
    
              const data = await response.json();
              
              if (data.address) {
                const address = data.address;
                
                // Construir dirección: calle, número y colonia
                let direccion = '';
                if (address.road || address.house_number || address.neighbourhood || address.suburb) {
                  direccion = [
                    address.road || '',
                    address.house_number || '',
                    address.neighbourhood || address.suburb || address.colony || ''
                  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
                } else if (address.city) {
                  direccion = address.city;
                  toast.warning('No se pudo obtener la calle y número, por favor complétalos manualmente.');
                } else {
                  direccion = '';
                  toast.warning('No se pudo obtener la calle y número, por favor complétalos manualmente.');
                }
                setShippingAddress(prev => ({
                  ...prev,
                  address: direccion,
                  city: address.city || address.town || address.village || '',
                  state: address.state || '',
                  zipCode: address.postcode || '',
                  country: address.country || 'México'
                }));
    
                toast.success('Ubicación obtenida exitosamente');
              } else {
                toast.error('No se pudo obtener la dirección completa');
              }
            } catch (error) {
              console.error('Error al obtener la dirección:', error);
              toast.error('Error al obtener la dirección. Intenta llenar manualmente.');
            } finally {
              setIsGettingLocation(false);
            }
          },
          (error) => {
            setIsGettingLocation(false);
            switch (error.code) {
              case error.PERMISSION_DENIED:
                toast.error('Permiso denegado para acceder a la ubicación');
                break;
              case error.POSITION_UNAVAILABLE:
                toast.error('Información de ubicación no disponible');
                break;
              case error.TIMEOUT:
                toast.error('Tiempo de espera agotado para obtener la ubicación');
                break;
              default:
                toast.error('Error al obtener la ubicación');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      };

    // Función genérica para cambiar de pantalla
    const goTo = (next) => {
        setHistory((h) => [...h, shippingOption]); // apilar
        setShippingOption(next);
    };
    // Función de “volver”
    const goBack = () => {
        setHistory((h) => {
            const prev = h[h.length - 1] ?? null;       // última opción
            const newStack = h.slice(0, -1);           // desapilar
            setShippingOption(prev);
            return newStack;
        });
    };

    // Función para simular obtener la ubicación actual del usuario
    const useCurrentLocation = () => {
        // Aquí iría la lógica real para obtener la ubicación (e.g., geolocalización del navegador)
        // Por ahora, usamos la ubicación simulada
        setSelectedLocation(
            `${userAddress.street}, ${userAddress.colony}, ${userAddress.city}, ${userAddress.state} C.P. ${userAddress.zipCode}`
        );
        setShowLocationForm(false); // Ocultar el formulario después de usar la ubicación
        goTo("confirmarEnvio"); // Ir a una pantalla de confirmación o resumen
        toast.success("Ubicación actual utilizada.");
    };

    // Función para manejar el envío del formulario de nueva ubicación
    const handleSubmitNewLocation = (e) => {
        e.preventDefault();
        // Validación básica
        const { firstName, lastName, email, phone, address, city, state, zipCode } = shippingAddress;
        if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
            toast.error('Por favor completa todos los campos');
            return;
        }
        setSelectedLocation(
            `${address}, ${city}, ${state}, ${zipCode}, ${shippingAddress.country}`
        );
        // Actualizar la dirección global
        setLocation(`${address}, ${city}, ${state}, ${zipCode}, ${shippingAddress.country}`);
        setShowLocationForm(false);
        goTo("efectivo");
        toast.success("Nueva ubicación guardada.");
    };

    // --- EFECTO PARA VERIFICAR LA SESIÓN ---
    useEffect(() => {
        const token = localStorage.getItem("token"); // O el nombre de tu token
        setIsUserLoggedIn(!!token); // Si hay token, está loggeado (true), si no, false
    }, []);

    // Función para regresar a la página de categorías
    const handleBack = () => {
        navigate("/tienda", { replace: true });
    };

    // Efecto para activar el resaltado del nombre del producto
    useEffect(() => {
        if (product) {
            // Activar el resaltado después de cargar el producto
            setHighlightActive(true);
        }
    }, [product]);

    // Cargar datos del producto
    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                const response = await getActiveProductById(id);
                if (response && response.type === "SUCCESS") {
                    console.log('Producto obtenido:', response.result);
                    setProduct(response.result);
                    if (response.result?.multimedia?.length > 0) {
                        setMainImage(response.result.multimedia[0].url);
                    }
                } else {
                    toast.error("No se pudo cargar el producto");
                    console.error("Respuesta inválida al cargar el producto:", response);
                }
            } catch (error) {
                toast.error("Error al cargar el producto");
                console.error("Error al cargar el producto:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProductDetails();
        }

        // Al montar el componente, hacer scroll al inicio de la página
        window.scrollTo(0, 0);
    }, [id]);

    const location = {
        loc1: "Blvd. Paseo Cuauhnáhuac Jiutepec, Mor.",
        loc2: "Carr Federal México-Cuautla Cuautla, Mor."
    };

    // Variants para reusar
    const slideVariants = {
        initial: { x: 300, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -300, opacity: 0 },
    };

    const NavbarComponent = isUserLoggedIn ? NavCustomer : Nav2;

    return (
        <>
            <div className="w-full bg-gray-100 min-h-screen pt-20 pb-0">
                <SidebarProvider>
                    <NavbarComponent />
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="py-4 mt-4 text-sm lg:text-base">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href="/" className="flex items-center text-gray-700 hover:text-blue-700">
                                            <Home size={18} className="mr-1" />
                                            Inicio
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbLink
                                            href="/tienda"
                                            onClick={(e) => { e.preventDefault(); handleBack(); }}
                                            className="text-gray-700 hover:text-blue-700"
                                        >
                                            Tienda
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className={`truncate transition-colors duration-300 font-semibold ${highlightActive ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {product?.name} Martillo
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage className="text-gray-700 hover:text-blue-700 select-none">
                                            Compra
                                        </BreadcrumbPage>
                                    </BreadcrumbItem>
                                </BreadcrumbList>
                            </Breadcrumb>

                            <div className="">
                                <div className="flex flex-col md:flex-row gap-4 bg-white shadow-md rounded-2xl mt-6 w-full h-[70vh]">
                                    {/* Inicio de sección que se va a mover */}
                                    <div className="flex flex-col justify-center w-full rounded-2xl shadow-sm">
                                        <AnimatePresence initial={false} mode="wait">
                                            <motion.div
                                                key={shippingOption ?? "choose"}
                                                variants={slideVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className=""
                                            >
                                                {!shippingOption ? (
                                                    // Primera vista: elegir método
                                                    <div className="relative w-full h-[70vh] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center p-6">
                                                        {/* Columna 1: Imagen */}
                                                        <div className="flex">
                                                            <img
                                                                src="payment.png"
                                                                alt="Sucursal Cuautla"
                                                                className="w-[40em] h-[30em] rounded-lg shadow-sm object-cover"
                                                            />
                                                        </div>

                                                        {/* Columna 2: Texto y botones */}
                                                        <div className="flex flex-col items-center">
                                                            <h3 className="text-2xl font-medium mb-6 text-center">
                                                                Selecciona el método de pago de tu preferencia
                                                            </h3>

                                                            <div className="w-full flex flex-col sm:flex-row justify-center gap-5">
                                                                <Button
                                                                    onClick={() => goTo("casa")}
                                                                    className="flex-1 cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-500 py-3"
                                                                >
                                                                    <Captions className="mr-2" />
                                                                    Transferencia
                                                                </Button>
                                                                <Button
                                                                    onClick={() => goTo("tienda")}
                                                                    className="flex-1 cursor-pointer shadow-md border-2 border-blue-500 bg-white hover:bg-blue-100 text-blue-500 transition-colors duration-500 py-3"
                                                                >
                                                                    <Banknote className="mr-2" />
                                                                    Efectivo
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                ) : shippingOption === "tienda" ? (
                                                    // Vista de "Recoger en tienda"
                                                    <div className="relative w-full h-[70vh] justify-items-center">
                                                        <button
                                                            onClick={goBack}
                                                            className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>

                                                        <h3 className="text-2xl font-medium pt-[2em]">Selecciona sucursal</h3>
                                                        <p className="text-gray-500 mb-8">Escoge la sucursal más cercana</p>
                                                        <div className="w-[90%] h-[65%] grid grid-cols-1 sm:grid-cols-2 gap-8">
                                                            {/* Card Jiutepec */}
                                                            <button
                                                                onClick={() => { setSelectedLocation(location.loc1); goTo("efectivo"); }}
                                                                className="group relative w-full h-full cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                                                            >
                                                                {/* Imagen de fondo */}
                                                                <img
                                                                    src="libamaqJiute.png"
                                                                    alt="Sucursal Jiutepec"
                                                                    className="w-full h-full object-cover"
                                                                />

                                                                {/* Degradado para mejorar legibilidad */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/50 via-transparent to-transparent" />

                                                                {/* Texto sobre la imagen */}
                                                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                                                    <span className="flex items-center text-lg font-semibold">
                                                                        <MapPin className="mr-2" /> {location.loc1}
                                                                    </span>
                                                                </div>
                                                            </button>


                                                            {/* Card Cuautla */}
                                                            <button
                                                                onClick={() => { setSelectedLocation(location.loc2); goTo("efectivo"); }}
                                                                className="group relative w-full h-full cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                                                            >
                                                                {/* Imagen de fondo */}
                                                                <img
                                                                    src="libamaqCuautla.png"
                                                                    alt="Sucursal Cuautla"
                                                                    className="w-full h-full object-cover"
                                                                />

                                                                {/* Degradado para mejorar legibilidad */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/50 via-transparent to-transparent" />

                                                                {/* Texto sobre la imagen */}
                                                                <div className="absolute bottom-4 left-4 right-4 text-white transition-colors duration-500">
                                                                    <span className="flex items-center text-lg font-semibold">
                                                                        <MapPin className="mr-2 " /> {location.loc2}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>

                                                ) : shippingOption === "casa" ? (
                                                    // Vista de "Recoger en casa" - Ahora dividida en dos vistas
                                                    <div className="relative w-full h-[70vh] mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center p-6">
                                                        <button
                                                            onClick={goBack}
                                                            className="group absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>
                                                        <div className="flex flex-col items-center">
                                                            <h3 className="text-2xl font-medium mb-4">¿Quieres cambiar de ubicación?</h3>

                                                            <div className="w-full flex flex-col sm:flex-row justify-center gap-5">
                                                                <Button
                                                                    onClick={() => { useCurrentLocation(); }}
                                                                    className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                                    <MapPinHouse className="mr-2" />
                                                                    Usar ubicación actual
                                                                </Button>
                                                                <Button
                                                                    onClick={() => goTo("cambiarUbicacion")} // Nuevo shippingOption para el formulario
                                                                    className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                                    <MapPinPlus className="mr-2" />
                                                                    Cambiar ubicación
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex">
                                                            <img
                                                                src="location.png"
                                                                alt="Ubicación de entrega"
                                                                className="w-[40em] h-[30em] rounded-lg shadow-sm object-contain"
                                                            />
                                                        </div>
                                                    </div>

                                                ) : shippingOption === "cambiarUbicacion" ? (
                                                    // Nueva vista: Formulario para cambiar ubicación
                                                    <div className="relative w-full h-[70vh] justify-items-center p-6">
                                                        <button
                                                            onClick={goBack}
                                                            className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>
                                                        <h3 className="text-2xl font-medium pt-[0em] text-center">Ingresa tu nueva ubicación</h3>
                                                        <p className="text-gray-500 mb-8 text-center">Completa los campos para actualizar la dirección de envío</p>
                                                        {selectedLocation && (
                                                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-2">
                                                                <FiNavigation className="text-blue-600" />
                                                                <span className="text-blue-800 font-medium">Ubicación actual seleccionada:</span>
                                                                <span className="text-blue-700">{selectedLocation}</span>
                                                            </div>
                                                        )}
                                                        <form onSubmit={handleSubmitNewLocation} className="w-[90%] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">

                                                            <div className="flex flex-col md:col-span-2">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <label htmlFor="address" className="text-sm font-medium text-gray-700">
                                                                        Dirección
                                                                    </label>
                                                                    <button type="button" onClick={getCurrentLocation} disabled={isGettingLocation} className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
                                                                        <span className="mr-1 flex items-center"><FiNavigation className="w-4 h-4 mr-1" />Usar ubicación actual</span>
                                                                        {isGettingLocation && <span className="ml-1 animate-spin">⏳</span>}
                                                                    </button>
                                                                </div>
                                                                <input type="text" id="address" name="address" value={shippingAddress.address} onChange={e => handleShippingInputChange('address', e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="Calle, número, colonia" required />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label htmlFor="city" className="text-sm font-medium text-gray-700">Ciudad</label>
                                                                <input type="text" id="city" name="city" value={shippingAddress.city} onChange={e => handleShippingInputChange('city', e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label htmlFor="state" className="text-sm font-medium text-gray-700">Estado</label>
                                                                <input type="text" id="state" name="state" value={shippingAddress.state} onChange={e => handleShippingInputChange('state', e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label htmlFor="zipCode" className="text-sm font-medium text-gray-700">Código Postal</label>
                                                                <input type="text" id="zipCode" name="zipCode" value={shippingAddress.zipCode} onChange={e => handleShippingInputChange('zipCode', e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <label htmlFor="country" className="text-sm font-medium text-gray-700">País</label>
                                                                <select id="country" name="country" value={shippingAddress.country} onChange={e => handleShippingInputChange('country', e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                                                                    <option value="México">México</option>
                                                                    <option value="Estados Unidos">Estados Unidos</option>
                                                                    <option value="Canadá">Canadá</option>
                                                                </select>
                                                            </div>
                                                            <div className="md:col-span-2 flex justify-center mt-6">
                                                                <Button type="submit"
                                                                    onClick={() => goTo("transferencia")}
                                                                    className="w-1/2 cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-500 py-3">
                                                                    Guardar nueva ubicación
                                                                </Button>
                                                            </div>
                                                        </form>
                                                    </div>

                                                ) : shippingOption === "efectivo" ? (
                                                    <div className="relative w-full h-[70vh] justify-items-center">
                                                        <button
                                                            onClick={goBack}
                                                            className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>

                                                        <h3 className="text-2xl font-medium pt-[0.5em]">Historial de la compra</h3>
                                                        <p className="text-gray-500">Acude a la sucursal para realizar el pago de los productos</p>
                                                        <div className="w-[90%] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-600">Número de pedido</dt>
                                                                <dd className="mt-1 text-gray-900">#456</dd>
                                                                <dt className="text-sm font-medium text-gray-600">Fecha de compra</dt>
                                                                <dd className="mt-1 text-gray-900">22 de Mayo de 2025</dd>
                                                            </div>

                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                                <dt className="text-sm font-medium text-gray-600">Nombre del Producto</dt>
                                                                <dd className="mt-1 text-gray-900">GSH 16-28 Professional</dd>
                                                                <dt className="text-sm font-medium text-gray-600">Precio del Producto</dt>
                                                                <dd className="mt-1 text-gray-900">$14,500</dd>
                                                            </div>

                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                                <dt className="text-sm font-medium text-gray-600">Detalles del Cliente</dt>
                                                                <dd className="mt-1 text-gray-900">Angel Murga</dd>
                                                                <dd className="mt-1 text-gray-900">7771948899</dd>
                                                                <dd className="mt-1 text-gray-900">angel.murga@gmail.com</dd>
                                                                {selectedLocation && (
                                                                    <>
                                                                        <dt className="text-sm font-medium text-gray-600 mt-2">Ubicación Seleccionada</dt>
                                                                        <dd className="mt-1 text-gray-900">{selectedLocation}</dd>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex justify-center">
                                                            <Button
                                                                onClick={() => navigate('/user-profile')}
                                                                className="cursor-pointer shadow-md bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-md font-semibold"
                                                            >
                                                                Volver al inicio
                                                            </Button>
                                                        </div>
                                                        {/* <div className="mt-4 flex justify-center gap-4">
                                                            <Button
                                                                onClick={() => goTo("transferencia")}
                                                                className="cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-500 py-3"
                                                            >
                                                                Proceder al pago
                                                            </Button>
                                                            <Button
                                                                onClick={() => goTo("cambiarUbicacion")}
                                                                className="cursor-pointer shadow-md border-2 border-blue-500 bg-white hover:bg-blue-100 text-blue-500 transition-colors duration-500 py-3"
                                                            >
                                                                Cambiar Dirección
                                                            </Button> 
                                                        </div> */}
                                                    </div>
                                                ) : shippingOption === "transferencia" ? (
                                                    // Vista de "Transferencia"
                                                    <div className="relative w-full h-[70vh] justify-items-center">
                                                        <button
                                                            onClick={goBack}
                                                            className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>

                                                        <h3 className="text-2xl font-medium pt-[1em]">Transferencia</h3>
                                                        <div className="w-[90%] mx-auto mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                                                            {/* Card 1 */}
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                                                <dt className="text-sm font-medium text-gray-600">Nombre del beneficiario</dt>
                                                                <dd className="mt-1 text-gray-900">Juan Pérez García</dd>
                                                            </div>

                                                            {/* Card 2 */}
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                                                <dt className="text-sm font-medium text-gray-600">Número de cuenta</dt>
                                                                <dd className="mt-1 text-gray-900">1234 5678 9012 3456</dd>
                                                            </div>

                                                            {/* Card 3 */}
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                                                <dt className="text-sm font-medium text-gray-600">Banco</dt>
                                                                <dd className="mt-1 text-gray-900">Banco Nacional de México</dd>
                                                            </div>

                                                            {/* Card 4 */}
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm">
                                                                <dt className="text-sm font-medium text-gray-600">CLABE</dt>
                                                                <dd className="mt-1 text-gray-900">002180012345678901</dd>
                                                            </div>

                                                            {/* Última card ocupa todo el ancho en sm+ */}
                                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                                <dt className="text-sm font-medium text-gray-600">Concepto / Referencia</dt>
                                                                <dd className="mt-1 text-gray-900">Pago de servicios profesionales</dd>
                                                                {/* Mostrar dirección detallada si existe shippingAddress */}
                                                                {(shippingAddress && shippingAddress.address && shippingAddress.city && shippingAddress.state && shippingAddress.zipCode) ? (
                                                                    <>
                                                                        <dt className="text-sm font-medium text-gray-600 mt-2">Dirección de Envío</dt>
                                                                        <dd className="mt-1 text-gray-900">{shippingAddress.firstName} {shippingAddress.lastName}</dd>
                                                                        <dd className="mt-1 text-gray-900">{shippingAddress.email}</dd>
                                                                        <dd className="mt-1 text-gray-900">{shippingAddress.phone}</dd>
                                                                        <dd className="mt-1 text-gray-900">{shippingAddress.address}</dd>
                                                                        <dd className="mt-1 text-gray-900">{shippingAddress.city}, {shippingAddress.state}, {shippingAddress.zipCode}, {shippingAddress.country}</dd>
                                                                    </>
                                                                ) : selectedLocation ? (
                                                                    <>
                                                                        <dt className="text-sm font-medium text-gray-600 mt-2">Ubicación Seleccionada</dt>
                                                                        <dd className="mt-1 text-gray-900">{selectedLocation}</dd>
                                                                    </>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 flex justify-center">
                                                            <Button
                                                                onClick={() => navigate('/user-profile')}
                                                                className="cursor-pointer shadow-md bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-md font-semibold"
                                                            >
                                                                Volver al inicio
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : shippingOption === "confirmarEnvio" ? (
                                                    // Nueva vista: Confirmación del envío con la ubicación
                                                    <div className="relative w-full h-[70vh] justify-items-center p-6 text-center">
                                                        <button
                                                            onClick={goBack}
                                                            className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                            aria-label="Volver"
                                                        >
                                                            <ChevronLeft size={20} className="text-gray-600" />
                                                        </button>
                                                        <h3 className="text-2xl font-medium pt-[3em] mb-4">Confirmar Ubicación de Envío</h3>
                                                        <p className="text-lg text-gray-700 mb-8">Tu pedido será enviado a la siguiente dirección:</p>
                                                        <div className="bg-blue-50 p-6 rounded-lg shadow-md mx-auto max-w-md">
                                                            <MapPin className="mx-auto text-blue-600 mb-4" size={40} />
                                                            <p className="text-xl font-semibold text-blue-800">{selectedLocation}</p>
                                                        </div>
                                                        <div className="mt-8 flex justify-center gap-4">
                                                            <Button
                                                                onClick={() => goTo("transferencia")}
                                                                className="cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-500 py-3"
                                                            >
                                                                Proceder al pago
                                                            </Button>
                                                            {/* <Button
                                                                onClick={() => goTo("cambiarUbicacion")} // Permitir cambiar de nuevo la ubicación si es necesario
                                                                className="cursor-pointer shadow-md border-2 border-blue-500 bg-white hover:bg-blue-100 text-blue-500 transition-colors duration-500 py-3"
                                                            >
                                                                Cambiar Dirección
                                                            </Button> */}
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SidebarProvider>
            </div>
        </>
    )

};