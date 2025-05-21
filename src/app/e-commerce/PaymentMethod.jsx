import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock, ArrowLeft, Share2, Shield, Home } from "lucide-react";
import { getProductById } from "@/services/public/productService";
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
                const response = await getProductById(id);
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
                                        Método de pago
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="">
                            <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm mt-6 w-full h-[70vh]">
                                {/* Galería de imágenes */}
                                <div className="w-full md:w-1/2 lg:w-3/5 p-4">
                                    <div className="flex flex-row gap-4">
                                        {/* Miniaturas verticales */}
                                        <div className="hidden sm:flex flex-col space-y-2 overflow-y-auto max-h-96">
                                            {product?.multimedia?.map((img, index) => (
                                                <img
                                                    key={index}
                                                    src={img.url}
                                                    alt={`${product.name} - ${index}`}
                                                    className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                                                        }`}
                                                    onClick={() => setMainImage(img.url)}
                                                />
                                            ))}
                                            {(!product?.multimedia || product.multimedia.length === 0) && (
                                                <img
                                                    src="/placeholder-product.png"
                                                    alt="Imagen no disponible"
                                                    className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                                                />
                                            )}
                                        </div>

                                        {/* Imagen principal */}
                                        <div className="relative group flex-1">
                                            {/* Componente para compartir en redes sociales */}
                                            <div className="absolute top-2 right-2 z-10">
                                                <ShareProduct product={product} />
                                            </div>
                                            <div className="w-full h-80 sm:h-96 flex justify-center items-center bg-white rounded-lg">
                                                <img
                                                    src={product?.multimedia && product.multimedia.length > 0
                                                        ? mainImage || product.multimedia[0].url
                                                        : "/placeholder-product.png"}
                                                    alt={product?.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Miniaturas horizontales (solo móvil) */}
                                    <div className="flex sm:hidden mt-4 space-x-2 overflow-x-auto pb-2">
                                        {product?.multimedia?.map((img, index) => (
                                            <img
                                                key={index}
                                                src={img.url}
                                                alt={`${product.name} - ${index}`}
                                                className={`w-16 h-16 object-contain border p-1 cursor-pointer rounded ${mainImage === img.url ? "border-blue-500" : "border-gray-200 hover:border-gray-400"
                                                    }`}
                                                onClick={() => setMainImage(img.url)}
                                            />
                                        ))}
                                        {(!product?.multimedia || product.multimedia.length === 0) && (
                                            <img
                                                src="/placeholder-product.png"
                                                alt="Imagen no disponible"
                                                className="w-16 h-16 object-contain border p-1 border-blue-500 rounded"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Información del producto */}
                                <div className="w-full md:w-1/2 lg:w-2/5 p-4">
                                    <div className="flex items-center mb-1">
                                        <span className="text-sm text-gray-500">Nuevo | ID:777 {product?.externalId}</span>
                                        {product?.stock > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">En stock</span>
                                        )}
                                    </div>

                                    <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3">{product?.name} Martillo</h1>

                                    <div className="mb-4">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-semibold text-gray-900">${product?.price?.toLocaleString()}77.777</span>
                                            {product?.discount > 0 && (
                                                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-md">{product.discount}% OFF</span>
                                            )}
                                        </div>
                                    </div>

                                    {product?.garanty && (
                                        <div className="mb-4">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Shield size={18} className="text-green-500 mr-2" />
                                                <div>
                                                    <p className="font-medium">Garantía: {product.garanty} {product.garanty === 1 ? 'año' : 'años'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Descripción del producto */}
                                    {product?.shortDescription && (
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Descripción</h3>
                                            <p className="text-gray-700 text-sm whitespace-pre-line mb-2">{product.shortDescription}</p>
                                            {product?.description?.details && (
                                                <p className="text-gray-700 text-sm whitespace-pre-line">{product.description.details}</p>
                                            )}
                                        </div>
                                    )}
                                </div>


                                {/* Inicio de sección que se va a mover */}
                                <div className="flex flex-col justify-center w-full rounded-2xl shadow-sm bg-amber-100 my-5 mx-5">
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
                                                <div className="flex flex-col gap-10">
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
                                            ) : shippingOption === "tienda" ? (
                                                // Vista de "Recoger en tienda"
                                                <div className="relative justify-items-center">
                                                    <Button onClick={goBack} className="absolute top-18 left-2 p-2 rounded-full shadow cursor-pointer">
                                                        ←
                                                    </Button>

                                                    <h3 className="text-xl font-medium mb-4">Selecciona una sucursal</h3>
                                                    <div className="w-[80%] flex flex-col gap-5">
                                                        <Button
                                                            onClick={() => { setSelectedLocation(location.loc1); goTo("metodoPago") }}
                                                            className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                            <MapPin />
                                                            {location.loc1}
                                                        </Button>
                                                        <Button
                                                            onClick={() => { setSelectedLocation(location.loc2); goTo("metodoPago") }}
                                                            className="cursor-pointer shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                            <MapPin />
                                                            {location.loc2}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : shippingOption === "casa" ? (
                                                // Vista de "Recoger en casa"
                                                <div className="relative justify-items-center">
                                                    <Button onClick={goBack} className="cursor-pointer absolute top-18 left-2 p-2 rounded-full shadow">
                                                        ←
                                                    </Button>

                                                    <h3 className="text-xl font-medium mb-4">¿Quieres cambiar de ubicación?</h3>
                                                    <div className="w-[80%] flex flex-col gap-5">
                                                        <Button
                                                            onClick={() => goTo("metodoPago")}
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
                                            ) : shippingOption === "metodoPago" ? (
                                                // Vista de "Metodo de pago"
                                                <div className="relative justify-items-center">
                                                    <Button onClick={goBack} className="cursor-pointer absolute top-18 left-2 p-2 rounded-full shadow">
                                                        ←
                                                    </Button>

                                                    <h3 className="text-xl font-medium">Selecciona el método de pago de tu preferencia</h3>
                                                    <p className="text-sm mb-4 text-gray-500">Sucursal seleccionada: <strong>{selectedLocation}</strong></p>
                                                    <div className="w-full justify-center flex gap-5 mt-10">
                                                        <Button
                                                            onClick={() => goTo("transferencia")}
                                                            className="cursor-pointer w-[30%] shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                            <Captions />
                                                            Transferencia
                                                        </Button>
                                                        <Button
                                                            onClick={() => goTo("efectivo")}
                                                            className="cursor-pointer w-[30%] shadow-md bg-blue-500 hover:bg-white text-white hover:text-blue-500 transition-colors duration-500 py-3">
                                                            <Banknote />
                                                            Efectivo
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : shippingOption === "transferencia" ? (
                                                <div className="relative justify-items-center">
                                                    <Button onClick={goBack} className="cursor-pointer absolute top-34 left-2 p-2 rounded-full shadow">
                                                        ←
                                                    </Button>

                                                    <h3 className="text-2xl font-medium">Transferencia</h3>
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
                                                <div className="relative justify-items-center">
                                                    <Button onClick={goBack} className="cursor-pointer absolute top-34 left-2 p-2 rounded-full shadow">
                                                        ←
                                                    </Button>
                                                    
                                                    <h3 className="text-2xl font-medium">Efectivo</h3>
                                                    <p className="text-gray-500">Acude a la sucursal más cercana</p>
                                                    <div className="w-[90%] mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                            <dt className="text-sm font-medium text-gray-600">Sucursal Jiutepec</dt>
                                                            <dd className="mt-1 text-gray-900">Blvd. Paseo Cuauhnáhuac 1742, Puente Blanco, 62577 Jiutepec, Mor.</dd>
                                                        </div>
                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                            <dt className="text-sm font-medium text-gray-600">Sucursal Cuautla</dt>
                                                            <dd className="mt-1 text-gray-900">Carr Federal México-Cuautla 1617, Empleado Postal, 62747 Cuautla, Mor.</dd>
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