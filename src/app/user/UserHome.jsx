import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllPublicProducts } from "@/services/public/productService";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavCustomer } from "@/app/user/components/molecules/NavCustomer";
import SearchBar from "./components/organisms/SearchBar";
import CardProducts from "./components/organisms/CardProducts";

export default function UserHome() {
    const navigate = useNavigate();
    const { brand, category } = useParams();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const sectionRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(category || "");

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

    return (
        <>
            <SidebarProvider>
                <NavCustomer />

                <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="max-w-full mx-auto px-4">
                            {/* Buscador y filtros */}
                            <SearchBar
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                brand={brand}
                                category={category}
                            />

                            {/* CARDS */}
                            <CardProducts
                                sectionRef={sectionRef}
                                brand={brand}
                                selectedCategory={selectedCategory}
                                isLoading={isLoading}
                                filteredProducts={filteredProducts}
                            />
                        </div>
                    </motion.div>
                </div>
            </SidebarProvider>
        </>
    );
}