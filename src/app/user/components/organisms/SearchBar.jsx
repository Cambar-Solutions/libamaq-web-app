import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";

export default function SearchBar({ selectedCategory, setSelectedCategory, brand, category, searchTerm, setSearchTerm }) {
    const [showFilters, setShowFilters] = useState(false);
    const [allCategories, setAllCategories] = useState([]);
    const handleBack = () => navigate("/tienda");

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
                // toast.error("Error al cargar categorías");
            }
        };
        loadCats();
    }, []);

    // Actualiza categoría seleccionada si cambia el param
    useEffect(() => {
        if (category) setSelectedCategory(category);
    }, [category]);

    // Navegación y filtros
    const handleCategoryChange = (newCategory) => {
        setSelectedCategory(newCategory);
        if (brand) {
            navigate(`/productos/${brand}/${encodeURIComponent(newCategory)}`);
        } else {
            navigate(`/productos/categoria/${encodeURIComponent(newCategory)}`);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 mt-23 sticky top-16 z-10 bg-white shadow-md rounded-lg mb-6 p-3">
            <div className="flex flex-row items-center gap-2">
                <div className="relative w-4/5">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18} />
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
    )
}