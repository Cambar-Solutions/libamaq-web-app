import NavClient from "@/components/NavClient";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllPublicProducts } from "@/services/public/productService";
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import { toast } from "sonner";

export default function UserHome() {
    const navigate = useNavigate();
    const { brand, category } = useParams();

    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(category || "");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const sectionRef = useRef(null);

    // Actualiza categoría seleccionada si cambia el param
    useEffect(() => {
        if (category) setSelectedCategory(category);
    }, [category]);

    // Carga marcas con categorías
    useEffect(() => {
        const loadCats = async () => {
            try {
                const resp = await getAllBrandsWithCategories();
                if (resp?.type === "SUCCESS" && Array.isArray(resp.result)) {
                    const activeBrands = resp.result.filter(b => b.status === "ACTIVE");
                    const cats = activeBrands
                        .flatMap(b => b.categories)
                        .filter(c => c.status === "ACTIVE")
                        .map(c => c.name);
                    setAllCategories(cats);
                }
            } catch {
                toast.error("Error al cargar categorías");
            }
        };
        loadCats();
    }, []);

    // Carga productos destacados
    useEffect(() => {
        const loadProds = async () => {
            setIsLoading(true);
            try {
                const resp = await getAllPublicProducts();
                if (resp?.type === "SUCCESS" && Array.isArray(resp.result)) {
                    const active = resp.result.filter(p => p.status === "ACTIVE");
                    setFeaturedProducts(active);
                } else {
                    toast.error("No se pudo cargar productos");
                }
            } catch {
                toast.error("Error al cargar productos");
            } finally {
                setIsLoading(false);
            }
        };
        loadProds();
    }, []);

    // Filtrado por búsqueda y categoría
    const filteredProducts = featuredProducts.filter(item => {
        const matchSearch = !searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !selectedCategory ||
            item.category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchSearch && matchCat;
    });

    // Navegación y filtros
    const handleBack = () => navigate("/tienda");
    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        if (brand) {
            navigate(`/productos/${brand}/${encodeURIComponent(newCategory)}`);
        } else {
            navigate(`/productos/categoria/${encodeURIComponent(newCategory)}`);
        }
    };

    // Scroll suave
    const scrollToSection = () => {
        if (!sectionRef.current) return;
        const targetY = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - 16;
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        const duration = 800;
        let startTime = null;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const time = timestamp - startTime;
            const t = Math.min(time / duration, 1);
            window.scrollTo(0, startY + diff * t);
            if (time < duration) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    return (
        <>
            <NavClient />

            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-full mx-auto px-4">
                    {/* Buscador y filtros */}
                    <div className="max-w-6xl mx-auto px-4 mt-23 sticky top-16 z-10 bg-white shadow-md rounded-lg mb-6 p-3">
                        <div className="flex flex-row items-center gap-2">
                            <div className="relative w-4/5">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center justify-center w-1/5 gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-full transition-colors"
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filtros</span>
                            </button>
                            {brand && (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center justify-center md:justify-start gap-2 text-blue-600 py-2 px-4 rounded-full hover:bg-blue-50 transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                    <span>Regresar</span>
                                </button>
                            )}
                        </div>
                        {showFilters && (
                            <div className="mt-3 p-3 border-t border-gray-200">
                                <h3 className="font-medium mb-2">Categorías</h3>
                                <div className="flex flex-wrap gap-2">
                                    {allCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategoryChange(cat)}
                                            className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {cat.replace(/-/g, ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CARDS */}
                    <div className="max-w-full mx-auto">
                        <div ref={sectionRef} className="max-w-8xl w-full mx-auto px-4">
                            <div className="mb-6 mt-8 w-full">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                                    {brand
                                        ? selectedCategory
                                            ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`
                                            : `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
                                        : selectedCategory
                                            ? selectedCategory.replace(/-/g, ' ')
                                            : 'Productos destacados'}
                                </h1>
                            </div>
                            <div className="bg-gray-100 min-h-[90vh] rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full mx-auto flex-grow">
                                <div className="w-full mx-auto">
                                    {isLoading ? (
                                        <p className="text-center">Cargando productos...</p>
                                    ) : filteredProducts.length > 0 ? (
                                        <div className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 mb-8">
                                            {filteredProducts.map((item, index) => (
                                                <Link to={`/producto/${item.id}`} key={index} className="w-full">
                                                    <Card className="h-[25em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden mx-auto w-full cursor-pointer">
                                                        <CardHeader>
                                                            <img
                                                                src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder-product.png"}
                                                                alt={item.name}
                                                                className="w-full h-50 object-contain"
                                                            />
                                                        </CardHeader>
                                                        <CardContent className="flex flex-col flex-grow justify-between p-3 mb-5">
                                                            <CardTitle className="text-lg "> {item.name} </CardTitle>
                                                            <CardDescription className="truncate">{item.shortDescription}</CardDescription>
                                                            <p className="mt-2 font-bold text-2xl text-blue-700">${item.price?.toLocaleString()}</p>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                                            <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
                                            <button onClick={() => setSearchTerm('')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Ver todos los productos</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}