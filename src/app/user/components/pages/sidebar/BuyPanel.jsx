import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilterByDate from "../../molecules/FilterByDate";
import CardCarProducts from "../../organisms/buyPanel/CardCarProducts";
import CardsDetail from "../../organisms/buyPanel/CardsDetail";
import Breadcrumb_Buy from "../../atoms/Breadcrumb_Buy";

import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

// Importa tu método getOrdersByUser
import { getOrdersByUser } from "@/services/public/orderService"; // Asegúrate de que la ruta sea correcta

// La función parseDDMMYYYY ya no es necesaria si solo usas ISO o YYYY-MM-DD
// function parseDDMMYYYY(str) { /* ... */ }

const slideVariants = {
    initial: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
    animate: { x: "0%" },
    exit: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
};

export default function BuyPanel() {
    const [filterDate, setFilterDate] = useState("");
    const [selected, setSelected] = useState(null);
    const [backendOrders, setBackendOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const direction = selected ? 1 : -1;

    const userId = "53"; // Reemplaza esto con el ID real de tu usuario

    useEffect(() => {
        const fetchUserOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getOrdersByUser(userId);

                if (response && Array.isArray(response.data)) {
                    setBackendOrders(response.data);
                    console.log("LOG 1: Pedidos cargados del backend:", response.data);
                } else {
                    console.warn("La respuesta de getOrdersByUser no tiene el formato esperado (array en .data):", response);
                    setBackendOrders([]);
                }
            } catch (err) {
                console.error("Error al cargar pedidos:", err);
                setError("No se pudieron cargar tus pedidos. Intenta de nuevo más tarde.");
                setBackendOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserOrders();
    }, [userId]);

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
            console.log("LOG 2: Pedido procesado (fecha para filtrar/agrupar):", processedOrder.id, processedOrder.filterableDate);
            return processedOrder;
        }), [backendOrders]
    );

    // MODIFICACIÓN CLAVE: Ahora agrupamos los pedidos por fecha
    const groupedAndFilteredOrders = useMemo(() => {
        console.log("LOG 3: Valor actual de filterDate (desde el input):", filterDate);

        let ordersToProcess = [];

        // Primero, aplica el filtro de fecha si filterDate no está vacío
        if (filterDate) {
            ordersToProcess = ordersWithFilterDate.filter(o => {
                const match = o.filterableDate === filterDate;
                console.log(`LOG 4: Comparando ${o.filterableDate} con ${filterDate}: ${match}`);
                return match;
            });
        } else {
            // Si no hay filtro, considera todos los pedidos
            ordersToProcess = ordersWithFilterDate;
        }

        // Ahora, agrupa los pedidos restantes por su 'filterableDate'
        const groupedTemp = ordersToProcess.reduce((acc, order) => {
            const date = order.filterableDate;
            if (date) { // Asegúrate de que la fecha sea válida para agrupar
                if (!acc[date]) {
                    acc[date] = []; // Crea un array para esta fecha si no existe
                }
                acc[date].push(order); // Añade el pedido al array de su fecha
            }
            return acc;
        }, {}); // groupedTemp será un objeto como { 'YYYY-MM-DD': [orden1, orden2], 'YYYY-MM-DD': [orden3] }

        // Convierte el objeto agrupado en un array de objetos para facilitar la iteración en el render
        // Y los ordena por fecha de forma descendente (más reciente primero)
        const sortedGroupedArray = Object.keys(groupedTemp)
            .sort((a, b) => new Date(b) - new Date(a)) // Ordena las fechas de la más nueva a la más antigua
            .map(date => ({
                date: date,
                orders: groupedTemp[date]
            }));

        console.log("LOG 5: Pedidos agrupados y filtrados:", sortedGroupedArray);
        return sortedGroupedArray; // Esto ahora es un array de { date: 'YYYY-MM-DD', orders: [] }
    }, [filterDate, ordersWithFilterDate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-22 p-4">
                <div className=" max-w-7xl mx-auto px-2 sm:px-4 sticky top-16 z-10 p-2 sm:p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between mx-4 mb-6 border-b border-gray-400 pb-3 px-0">
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
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                        <p className="text-lg font-semibold">Cargando pedidos...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-red-600">
                                        <p className="text-lg font-semibold">{error}</p>
                                    </div>
                                ) : groupedAndFilteredOrders.length === 0 ? ( // Usamos groupedAndFilteredOrders aquí
                                    <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                                        <ShoppingBag size={48} className="mb-4 text-gray-400" />
                                        <p className="text-lg font-semibold">No hay pedidos para mostrar.</p>
                                        <Link to="/user-home" className="mt-4 text-blue-600 hover:underline">
                                            Ir a la tienda
                                        </Link>
                                    </div>
                                ) : (
                                    <CardCarProducts
                                        // ¡IMPORTANTE! Pasamos los pedidos agrupados
                                        groupedOrders={groupedAndFilteredOrders}
                                        setSelected={setSelected}
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
                                className="absolute inset-0 min-h-screen bg-stone-100 overflow-y-auto pt-6 pb-0 lg:pb-0"
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
        </motion.div>
    );
}