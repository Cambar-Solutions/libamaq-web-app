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

export default function PaymentMethod() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [highlightActive, setHighlightActive] = useState(false);

    const [shippingOption, setShippingOption] = useState(null);
    const [history, setHistory] = useState([]);

    const [selectedLocation, setSelectedLocation] = useState(null);


    // Función genérica para cambiar de pantalla
    const goTo = (next) => {
        setHistory((h) => [...h, shippingOption]); // apilar
        setShippingOption(next);
    };
    // Función de “volver”
    const goBack = () => {
        setHistory((h) => {
            const prev = h[h.length - 1] ?? null;       // última opción
            const newStack = h.slice(0, -1);            // desapilar
            setShippingOption(prev);
            return newStack;
        });
    };

    // Función para regresar a la página de categorías
    const handleBack = () => {
        navigate("/tienda", { replace: true });
    };

    const handleProfile = () => {
        navigate("/user-profile", { replace: true });
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

    return (
        <>
            <div className="w-full bg-gray-100 min-h-screen pt-20 pb-0">
                <Nav2 />
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
                                            key={shippingOption ?? "choose"}        // 🍃 cambia al hacer goTo o goBack
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

                                                    <h3 className="text-2xl font-medium  pt-[2em]">Selecciona sucursal</h3>
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
                                                // Vista de "Recoger en casa"
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
                                                                onClick={() => goTo("transferencia")}
                                                                className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                                <MapPinHouse />
                                                                Mantener ubicación
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleProfile()}
                                                                className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                                <MapPinPlus />
                                                                Cambiar ubicación
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="flex">
                                                        <img
                                                            src="location.png"
                                                            alt="Sucursal Cuautla"
                                                            className="w-[40em] h-[30em] rounded-lg shadow-sm object-contain"
                                                        />
                                                    </div>



                                                </div>
                                            ) : shippingOption === "efectivo2" ? (
                                                // Vista de "Metodo de pago"
                                                <div className="flex flex-col gap-10">
                                                    <button
                                                        onClick={goBack}
                                                        className="absolute top-0 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                        aria-label="Volver"
                                                    >
                                                        <ChevronLeft size={20} className="text-gray-600" />
                                                    </button>
                                                    <div className="justify-items-center">
                                                        <h2 className="text-xl font-semibold w-[70%] text-center">¿Prefieres recoger en tienda o recibir tu compra en casa?</h2>
                                                    </div>
                                                    <div className="flex gap-5 justify-center">
                                                        <Button
                                                            onClick={() => goTo("tienda")}
                                                            className="cursor-pointer shadow-md bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-500 py-3">
                                                            Recoger en tienda
                                                        </Button>
                                                        <Button
                                                            onClick={() => goTo("casa")}
                                                            className="cursor-pointer shadow-md border-2 border-blue-500 bg-white hover:bg-blue-100 text-blue-500 transition-colors duration-500 py-3">
                                                            Recibir en casa
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : shippingOption === "transferencia" ? (
                                                <div className="relative w-full h-[70vh] justify-items-center">
                                                    <button
                                                        onClick={goBack}
                                                        className="cursor-pointer absolute top-2 left-2 p-2 rounded-full bg-white shadow hover:bg-gray-100 transition"
                                                        aria-label="Volver"
                                                    >
                                                        <ChevronLeft size={20} className="text-gray-600" />
                                                    </button>

                                                    <h3 className="text-2xl font-medium pt-[3em]">Transferencia</h3>
                                                    <div className="w-[90%] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
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
                                                        </div>
                                                    </div>
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

                                                    <h3 className="text-2xl font-medium pt-[3em]">Historial de la compra</h3>
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

                                                        {/* Última card ocupa todo el ancho en sm+ */}
                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                            <dt className="text-sm font-medium text-gray-600">Detalles del Cliente</dt>
                                                            <dd className="mt-1 text-gray-900">Angel Murga</dd>
                                                            <dd className="mt-1 text-gray-900">7771948899</dd>
                                                            <dd className="mt-1 text-gray-900">angel.murga@gmail.com</dd>
                                                        </div>
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
            </div>
        </>
    )

};