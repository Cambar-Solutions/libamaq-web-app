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


export default function PaymentMethod() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState("");
    const [favorite, setFavorite] = useState(false);
    const [highlightActive, setHighlightActive] = useState(false);

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

    return (
        <>
            <div className="w-full bg-gray-100 min-h-screen pt-20 pb-8">
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
                                        {product?.name}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-gray-700 hover:text-blue-700 select-none">
                                        Método de pago
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="">
                            <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-sm mt-6 w-full h-[75vh]">
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
                                        <span className="text-sm text-gray-500">Nuevo | ID: {product?.externalId}</span>
                                        {product?.stock > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md">En stock</span>
                                        )}
                                    </div>

                                    <h1 className="text-xl sm:text-2xl font-medium text-gray-900 mb-3">{product?.name}</h1>

                                    <div className="mb-4">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl font-semibold text-gray-900">${product?.price?.toLocaleString()}</span>
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
                                <div className="flex justify-around w-full">
                                    <div className="">
                                        <h1>Compras en efectivo acurdir a sucursal</h1>
                                        <p>ubicacion</p>
                                    </div>
                                    <div className="">
                                        <h1>Tarjeta / transferencia bancaria</h1>
                                        <p>datos de cuenta bancaria</p>
                                        <p>card estática de los datos</p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </>
    )

};
