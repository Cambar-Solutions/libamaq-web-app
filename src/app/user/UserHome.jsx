import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getActiveProductPreviews } from "@/services/public/productService";
import toast, { Toaster } from "react-hot-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavCustomer } from "@/app/user/components/molecules/NavCustomer";
import SearchBar from "./components/organisms/SearchBar";
import CardProducts from "./components/organisms/CardProducts";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "@/services/admin/userService";

export default function UserHome() {
    const [userInfo, setUserInfo] = useState({ name: "null", email: "null@gmail.com" });
    const [activeItems, setActiveItems] = useState([]);

    const navigate = useNavigate();
    const { brand, category } = useParams();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const sectionRef = useRef(null);
    const [selectedCategory, setSelectedCategory] = useState(category || "");
    const [loading, setLoading] = useState(true);

    // Obtener todos los productos activos


    // Filtrado por búsqueda y categoría
    const filteredProducts = featuredProducts.filter(item => {
        const matchSearch = !searchTerm ||
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = !selectedCategory ||
            item.category?.toLowerCase() === selectedCategory.toLowerCase();
        return matchSearch && matchCat;
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return;

                const decoded = jwtDecode(token);
                const userId = decoded.sub;

                const user = await getUserById(userId);
                setUserInfo({ name: user.name, email: user.email });
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getActiveProductPreviews();
                const products = Array.isArray(data.data) ? data.data : [];
                console.log("Productos activos recibidos:", data);
                setActiveItems(products);
                // setShowRightArrow(products.length > 1);
            } catch (error) {
                console.error("Error cargando productos activos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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
                                activeItems={activeItems}
                            />
                        </div>
                    </motion.div>
                </div>
            </SidebarProvider>

            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </>
    );
}