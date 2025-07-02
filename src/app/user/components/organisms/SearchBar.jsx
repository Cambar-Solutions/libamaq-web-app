import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import { getAllBrandsWithCategories } from "@/services/public/brandService"; // Necesario para la navegación y las categorías

export default function SearchBar({
  selectedCategory,
  setSelectedCategory,
  brand,
  category,
  searchTerm,
  setSearchTerm,
  allCategories, // Ahora recibe todas las categorías como prop
}) {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate(); // Inicializar useNavigate

  const handleBack = () => {
    // Si hay una categoría seleccionada y no es "todos", regresa a la página de marca o a /tienda
    if (selectedCategory && selectedCategory !== "todos-los-productos") {
      if (brand) {
        navigate(`/productos/${brand}`);
      } else {
        navigate("/tienda");
      }
    } else if (brand) {
      // Si solo hay marca, regresa a /tienda
      navigate("/tienda");
    } else {
      // Si no hay marca ni categoría, o es "todos-los-productos", simplemente cierra los filtros
      setShowFilters(false);
    }
  };

  // La lógica de carga de categorías se mueve al componente padre (UserHome)
  // Este useEffect para 'category' ya no es necesario aquí si lo maneja el padre
  // useEffect(() => {
  //     if (category) setSelectedCategory(decodeURIComponent(category));
  // }, [category, setSelectedCategory]); // decodeURIComponent para manejar espacios en la URL

  // Navegación y filtros
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    // Navega a la URL correcta, dependiendo de si hay una marca en la URL o no.
    if (brand) {
      navigate(`/productos/${brand}/${encodeURIComponent(newCategory)}`);
    } else {
      navigate(`/productos/categoria/${encodeURIComponent(newCategory)}`);
    }
    setShowFilters(false); // Cierra los filtros después de seleccionar una categoría
  };

  // Se añade "Todos los productos" como una opción de categoría
  const categoriesToShow = ["todos-los-productos", ...allCategories];

  return (
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
        {(brand || selectedCategory) && ( // Mostrar el botón de regresar si hay marca o categoría seleccionada
          <button
            onClick={handleBack}
            className="flex items-center justify-center md:justify-start gap-2 text-blue-600 py-2 px-4 rounded-full hover:bg-blue-50 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Regresar</span>
          </button>
        )}
      </div>
      {showFilters && (
        <div className="mt-3 p-3 border-t border-gray-200">
          <h3 className="font-medium mb-2">Categorías</h3>
          <div className="flex flex-wrap gap-2">
            {categoriesToShow.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat === "todos-los-productos" ? null : cat)} // Si es "todos", pasa null
                className={`px-3 py-1 rounded-full text-sm ${
                  (selectedCategory === cat || (selectedCategory === null && cat === "todos-los-productos"))
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}