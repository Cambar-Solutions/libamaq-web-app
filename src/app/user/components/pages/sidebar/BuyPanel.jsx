import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilterByDate from "../../molecules/FilterByDate";
import CardCarProducts from "../../organisms/buyPanel/CardCarProducts";
import CardsDetail from "../../organisms/buyPanel/CardsDetail";
import Breadcrumb_Buy from "../../atoms/Breadcrumb_Buy";

import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { deleteOrder } from "@/services/public/orderService";
import { useOrders } from "@/hooks/useOrders";
import toast, { Toaster } from "react-hot-toast";

// Importa los componentes de AlertDialog del padre
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel
} from "@/components/ui/alert-dialog";


const slideVariants = {
    initial: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
    animate: { x: "0%" },
    exit: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
};

export default function BuyPanel() {
    const [filterDate, setFilterDate] = useState("");
    const [selected, setSelected] = useState(null);
    const [userId, setUserId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const direction = selected ? 1 : -1;

    // Usar el hook de TanStack Query para las órdenes
    const { data: ordersResponse, isLoading, error, refetch } = useOrders(userId);
    const backendOrders = ordersResponse?.data || [];

    useEffect(() => {
        try {
            const userDataString = localStorage.getItem("user_data");
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                if (userData && userData.id) {
                    setUserId(userData.id);
                } else {
                    console.warn("user_data en localStorage no contiene una propiedad 'id'.");
                    setError("No se pudo obtener el ID de usuario. Por favor, inicia sesión.");
                }
            } else {
                console.warn("No se encontró user_data en localStorage.");
                setError("No se encontraron datos de usuario. Por favor, inicia sesión.");
            }
        } catch (e) {
            console.error("Error al parsear user_data desde localStorage:", e);
            setError("Error al procesar los datos de usuario.");
        }
    }, []);

    // El hook useOrders maneja automáticamente la carga y recarga de datos

    const handleTriggerDelete = (orderId) => {
        setOrderToDelete(orderId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        setDeleteDialogOpen(false);
        try {
            await deleteOrder(orderToDelete);
            // Refetch para actualizar los datos después de eliminar
            refetch();
            toast.success(`Pedido ${orderToDelete} eliminado exitosamente.`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || `Error al eliminar la orden ${orderToDelete}`;
            toast.error(errorMessage);
        } finally {
            setOrderToDelete(null);
        }
    };

    const ordersWithFilterDate = useMemo(() =>
        backendOrders.map(o => {
            let dateToFilterBy = "";
            if (o.createdAt && typeof o.createdAt === 'string') {
                const d = new Date(o.createdAt);
                if (!isNaN(d)) {
                    dateToFilterBy = d.toISOString().slice(0, 10);
                }
            } else if (o.estimatedDeliveryDate && typeof o.estimatedDeliveryDate === 'string') {
                dateToFilterBy = o.estimatedDeliveryDate;
            }
            const processedOrder = { ...o, filterableDate: dateToFilterBy };
            return processedOrder;
        }), [backendOrders]
    );

    const groupedAndFilteredOrders = useMemo(() => {
        let ordersToProcess = [];
        if (filterDate) {
            ordersToProcess = ordersWithFilterDate.filter(o => o.filterableDate === filterDate);
        } else {
            ordersToProcess = ordersWithFilterDate;
        }

        const groupedTemp = ordersToProcess.reduce((acc, order) => {
            const date = order.filterableDate;
            if (date) {
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(order);
            }
            return acc;
        }, {});

        const sortedGroupedArray = Object.keys(groupedTemp)
            .sort((a, b) => new Date(b) - new Date(a))
            .map(date => ({
                date: date,
                orders: groupedTemp[date]
            }));

        return sortedGroupedArray;
    }, [filterDate, ordersWithFilterDate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full bg-stone-100 min-h-screen lg:pb-0 pb-10 pt-24 px-4">
                <div className=" max-w-7xl mx-auto px-2 sm:px-4 sticky top-16 z-10 pb-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between mx-4 mb-5 border-b border-gray-400 pb-3 px-0">
                        <div>
                            <h1 className="text-3xl font-semibold text-indigo-950">Mis Pedidos</h1>
                            <p className="text-base text-gray-400 font-semibold">Aquí puedes ver tus pedidos realizados</p>
                        </div>
                        <FilterByDate
                            filterDate={filterDate}
                            setFilterDate={setFilterDate}
                        />
                    </div>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {selected === null ? (
                            <motion.div
                                key="list"
                                custom={direction}
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                        <p className="text-lg font-semibold">Cargando pedidos...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-red-600">
                                        <p className="text-lg font-semibold">{error}</p>
                                        {!userId && (
                                            <Link to="/login" className="mt-4 text-blue-600 hover:underline">
                                                Ir a iniciar sesión
                                            </Link>
                                        )}
                                    </div>
                                ) : groupedAndFilteredOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                        <ShoppingBag size={48} className="mb-4 text-gray-400" />
                                        <p className="text-lg font-semibold">No hay pedidos para mostrar.</p>
                                        <Link to="/user-home" className="mt-4 text-blue-600 hover:underline">
                                            Ir a la tienda
                                        </Link>
                                    </div>
                                ) : (
                                    <CardCarProducts
                                        groupedOrders={groupedAndFilteredOrders}
                                        setSelected={setSelected}
                                        handleTriggerDelete={handleTriggerDelete} // <-- Pasa la función de eliminación aquí
                                    />
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="detail"
                                custom={-direction}
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className=" inset-0 bg-stone-100 overflow-y-auto pt-0 pb-0 lg:pb-0"
                            >
                                <Breadcrumb_Buy
                                    setSelected={setSelected}
                                />
                                <CardsDetail
                                    selected={selected}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* AlertDialog y Toaster se renderizan en el componente padre */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar orden?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la orden {orderToDelete ? `con ID ${orderToDelete}` : ''} de forma permanente. ¿Estás seguro de que deseas continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setOrderToDelete(null);
                            setDeleteDialogOpen(false);
                        }}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteOrder} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
        </motion.div>
    );
}