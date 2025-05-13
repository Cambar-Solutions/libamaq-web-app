import NavClient from "@/components/NavClient";
import React, { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
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
import { Link } from "react-router-dom";
import { getAllPublicProducts } from "@/services/public/productService";
import { toast } from "sonner";

export default function LoginUser() {
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar productos al montar
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const resp = await getAllPublicProducts();
                if (resp?.type === "SUCCESS") {
                    const active = resp.result.filter(p => p.status === "ACTIVE");
                    setProducts(active);
                } else {
                    toast.error("No se pudo cargar productos");
                }
            } catch (e) {
                toast.error("Error al cargar productos");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Filtrar según término
    const filtered = searchTerm
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : products;

    return (
        <>
            <NavClient />

            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-full mx-auto px-4">
                    {/* Buscador y filtros */}
                    <div className="max-w-6xl mx-auto px-4 mt-23 sticky top-16 z-10 bg-white shadow-md rounded-lg mb-6 p-3">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <div className="relative flex-grow">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                />
                                <Input
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2"
                            >
                                <Filter size={18} />
                                Filtros
                            </Button>
                        </div>
                        {showFilters && (
                            <div className="mt-3 p-3 border-t border-gray-200">
                                {/* Ejemplo de filtro por categoría */}
                                <Label className="block mb-1">Categoría</Label>
                                <Select>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Todas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Todas</SelectItem>
                                        {/* Mapear categorías si tuvieras */}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* Grid de cards con estilo original */}
                    <div className=" max-w-6xl mx-auto">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                            Productos destacados
                        </h1>
                        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 bg-white rounded-2xl">
                            {isLoading ? (
                                <p>Cargando productos...</p>
                            ) : filtered.length > 0 ? (
                                filtered.map(product => (
                                    <div key={product.id} className="bg-white w-full h-[25em] rounded-lg hover:shadow-md hover:scale-102 overflow-hidden">
                                        <div className="h-full p-2 flex flex-col">
                                            <Link to={`/producto/${product.id}`} className="flex-grow flex flex-col">
                                                <Card className="h-full border-0 shadow-none flex flex-col">
                                                    <CardHeader>
                                                        <img
                                                            src={product.images?.[0] || "/placeholder-product.png"}
                                                            alt={product.name}
                                                            className="w-full h-50 object-contain"
                                                        />
                                                    </CardHeader>
                                                    <CardContent className="flex flex-col flex-grow justify-between p-1 mb-5">
                                                        <CardTitle className="text-lg ">
                                                            {product.name}
                                                        </CardTitle>
                                                        <CardDescription className="truncate">
                                                            {product.shortDescription}
                                                        </CardDescription>

                                                        <p className="mt-2 font-bold text-2xl text-blue-700">
                                                            ${product.price?.toLocaleString()}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No se encontraron productos.</p>
                            )}
                        </div>

                        <div className="mt-10">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                Productos en Oferta
                            </h1>
                            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 bg-white rounded-2xl">
                                {isLoading ? (
                                    <p>Cargando productos...</p>
                                ) : filtered.length > 0 ? (
                                    filtered.map(product => (
                                        <div
                                            key={product.id}
                                            className="bg-white w-full h-[25em] rounded-lg hover:shadow-md hover:scale-102 overflow-hidden"
                                        >
                                            <div className="h-full p-2 flex flex-col">
                                                <Link to={`/producto/${product.id}`} className="flex-grow flex flex-col">
                                                    <Card className="h-full border-0 shadow-none flex flex-col">
                                                        {/* Header con badge */}
                                                        <CardHeader className="relative">
                                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                                15%
                                                            </span>
                                                            <img
                                                                src={product.images?.[0] || "/placeholder-product.png"}
                                                                alt={product.name}
                                                                className="w-full h-50 object-contain"
                                                            />
                                                        </CardHeader>
                                                        <CardContent className="flex flex-col flex-grow justify-between p-1 mb-5">
                                                            <CardTitle className="text-lg">
                                                                {product.name}
                                                            </CardTitle>
                                                            <CardDescription className="truncate">
                                                                {product.shortDescription}
                                                            </CardDescription>
                                                            <p className="mt-2 font-bold text-2xl text-blue-700">
                                                                ${product.price?.toLocaleString()}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No se encontraron productos.</p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}