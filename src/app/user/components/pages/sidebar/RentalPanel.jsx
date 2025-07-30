import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { getOrdersByUser } from "@/services/public/orderService";
import { getOrderDetailsByOrderId } from '@/services/admin/orderDetailService';
import LoadingScreen from '@/components/LoadingScreen';
import { Button } from "@/components/ui/button";

export default function RentalPanel() {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rentalOrders, setRentalOrders] = useState([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [dialogLoading, setDialogLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const token = localStorage.getItem("token");
            if (token) {
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                if (decodedToken && decodedToken.sub) {
                    setUserId(parseInt(decodedToken.sub, 10));
                } else {
                    console.warn("Token JWT no contiene una propiedad 'sub' (userId).");
                    setError("No se pudo obtener el ID de usuario del token. Por favor, inicia sesión.");
                    setLoading(false); // Detener la carga si no se encuentra el userId
                }
            } else {
                console.warn("No se encontró token en localStorage.");
                setError("No se encontraron datos de usuario. Por favor, inicia sesión.");
                setLoading(false); // Detener la carga si no hay token
            }
        } catch (e) {
            console.error("Error al procesar el token JWT desde localStorage:", e);
            setError("Error al procesar los datos de usuario.");
            setLoading(false); // Detener la carga en caso de error
        }
    }, []); // Este efecto se ejecuta solo una vez al montar el componente

    useEffect(() => {
        const fetchRentalOrdersAndProductDetails = async () => {
            // IMPORTANTE: Solo procede si userId NO es null
            if (userId === null) {
                // Si userId sigue siendo null aquí, significa que la extracción del token falló.
                // Ya se habrá establecido un error y loading en false en el primer useEffect.
                return;
            }

            try {
                setLoading(false); // Iniciar la carga para las órdenes
                setError(null);
                const response = await getOrdersByUser(userId);

                if (response && Array.isArray(response.data)) {
                    const filteredOrders = response.data.filter(order => order.type === 'RENTAL');

                    // Este bloque hace llamadas adicionales para obtener los detalles del producto para CADA ORDEN
                    // Si tu backend 'getOrdersByUser' ya devuelve 'orderDetails.product', puedes simplificar esto.
                    const ordersWithProductDetailsPromises = filteredOrders.map(async (order) => {
                        try {
                            // Obtener los detalles completos de la orden, incluyendo el producto, para cada orden
                            const detailRes = await getOrderDetailsByOrderId(order.id);
                            const orderDetails = Array.isArray(detailRes?.data) ? detailRes.data : [];

                            // Adjuntar los detalles obtenidos. Asumimos que el primer producto es para la tarjeta.
                            return {
                                ...order,
                                orderDetails: orderDetails,
                            };
                        } catch (detailErr) {
                            console.error(`Error al obtener detalles para la orden ${order.id}:`, detailErr);
                            return { ...order, orderDetails: [] }; // Retornar la orden sin detalles si hay un error
                        }
                    });

                    const resolvedOrders = await Promise.all(ordersWithProductDetailsPromises);
                    setRentalOrders(resolvedOrders.filter(Boolean)); // Filtrar cualquier entrada nula/indefinida
                    console.log("Órdenes de renta cargadas con detalles de producto:", resolvedOrders);

                } else {
                    console.warn("La respuesta de getOrdersByUser no es un array en .data:", response);
                    setRentalOrders([]);
                }
            } catch (err) {
                console.error("Error al cargar pedidos principales:", err);
                setError("No se pudieron cargar tus rentas. Intenta de nuevo más tarde.");
                setRentalOrders([]);
            } finally {
                setLoading(false); // Detener la carga después de obtener las órdenes o si hay un error
            }
        };

        fetchRentalOrdersAndProductDetails();
    }, [userId]); // Este efecto depende de userId, por lo que se ejecutará de nuevo cuando userId cambie de null a un ID válido.

    // Nueva función para cargar los detalles COMPLETOS cuando se abre el diálogo
    const handleOpenDialog = async (orderId) => {
        setDialogLoading(false);
        setSelectedOrderDetails(null); // Limpiar detalles anteriores
        try {
            const res = await getOrderDetailsByOrderId(orderId);
            const details = Array.isArray(res?.data) ? res.data : [];
            setSelectedOrderDetails(details);
            console.log("Detalles para el diálogo:", details);
        } catch (err) {
            console.error("Error al cargar los detalles para el diálogo:", err);
            setError(err.message || 'Error al cargar los detalles del pedido.');
        } finally {
            setDialogLoading(false);
        }
    };

    const formatISODateToReadable = (isoString) => {
        if (!isoString) return "N/A";
        try {
            const date = new Date(isoString);
            const options = { year: 'numeric', month: 'long', day: '2-digit' };
            return date.toLocaleDateString('es-ES', options);
        } catch (e) {
            console.error("Error formateando fecha:", isoString, e);
            return "Fecha inválida";
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    if (error && rentalOrders.length === 0) {
        return (
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-22 p-4 flex flex-col items-center justify-center">
                <p className="text-red-600 text-xl font-semibold">{error}</p>
                <Link to="/user-home" className="mt-4 text-blue-600 hover:underline">
                    Ir a la tienda
                </Link>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-22 p-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 sticky top-16 z-10 mb-6 p-2 sm:p-3">
                    <div className="m-2 border-b border-gray-400 mb-5">
                        <h1 className="text-3xl font-semibold text-indigo-950">Mis Rentas</h1>
                        <p className="text-base text-gray-400 font-semibold mb-3">Aquí podrás ver las rentas que has realizado y las que están en curso</p>
                    </div>

                    {rentalOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-600">
                            <DollarSign size={48} className="mb-4 text-gray-400" />
                            <p className="text-lg font-semibold">No hay rentas para mostrar.</p>
                            <Link to="/user-home" className="mt-4 text-blue-600 hover:underline">
                                Ir a la tienda
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 max-w-4xl lg:ml-32 ml-0">
                            {rentalOrders.map((order) => {
                                // Aquí, order.orderDetails debería estar poblado gracias al Promise.all en useEffect
                                const productDetail = order.orderDetails && order.orderDetails.length > 0
                                    ? order.orderDetails[0].product
                                    : null;

                                if (!productDetail) {
                                    console.warn(`La orden ${order.id} no tiene detalles de producto para mostrar.`);
                                    return null;
                                }

                                return (
                                    <Dialog key={order.id} onOpenChange={(open) => {
                                        if (open) handleOpenDialog(order.id);
                                        else setSelectedOrderDetails(null);
                                    }}>
                                        <DialogTrigger asChild>
                                            <div
                                                className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 cursor-pointer"
                                            >
                                                <div className="px-10 py-0 flex mb-5 flex-col sm:flex-row items-center sm:items-center">
                                                    <img
                                                        src={productDetail.media && productDetail.media.length > 0
                                                            ? productDetail.media[0].url
                                                            : "/placeholder-product.png"}
                                                        alt={productDetail.name}
                                                        className="w-40 h-40 sm:h-48 object-contain rounded"
                                                    />
                                                    <div className="flex-1 ml-4 sm:mt-0 sm:ml-4">
                                                        <h2 className="text-2xl font-semibold">{productDetail.name}</h2>
                                                        <p className="text-lg text-gray-600">{productDetail.brand?.name || 'Marca desconocida'}</p>
                                                        <p className="mt-1 text-gray-700 line-clamp-2 w-[80%] text-justify">
                                                            {productDetail.shortDescription || productDetail.description || 'Sin descripción.'}
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-center lg:mt-0 mt-5">
                                                        <span className="text-2xl font-semibold text-blue-700">
                                                            {productDetail.price?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) || 'N/A'}
                                                        </span>
                                                        <span
                                                            className={`mt-2 px-2 py-1 rounded-full lg:text-sm text-lg font-medium ${order.shippingStatus === "DELIVERED"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            {order.shippingStatus === "DELIVERED" ? "Rentado" : "En renta"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                                            <DialogHeader className="gap-0">
                                                <DialogTitle className="text-2xl font-semibold">{productDetail.name}</DialogTitle>
                                                <DialogDescription className="mt-0 text-gray-500 text-md line-clamp-1">
                                                    {productDetail.brand?.name || 'Sin descripción.'} | {productDetail.description || 'Sin descripción.'}
                                                </DialogDescription>
                                            </DialogHeader>
                                            {dialogLoading ? (
                                                <LoadingScreen />
                                            ) : selectedOrderDetails && selectedOrderDetails.length > 0 ? (
                                                <>
                                                    <div className="flex mr-13 justify-end sm:justify-center ">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-sm font-medium ${order.shippingStatus === "DELIVERED"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                                }`}
                                                        >
                                                            Estado: {order.shippingStatus === "DELIVERED" ? "Rentado" : "En renta"}
                                                        </span>
                                                    </div>
                                                    <div className="w-[90%] mx-auto mt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                            <dt className="text-sm font-medium text-gray-600 mt-2">Inicio de renta</dt>
                                                            <dd className="mt-1 text-gray-900">{formatISODateToReadable(order.createdAt)}</dd>
                                                        </div>

                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                            <dt className="text-sm font-medium text-gray-600 mt-2">Fin de renta</dt>
                                                            <dd className="mt-0 text-gray-900">{formatISODateToReadable(order.estimatedDeliveryDate)}</dd>
                                                        </div>

                                                        {/* <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                            <dt className="text-sm font-medium text-gray-600 mt-2">Se realizó en</dt>
                                                            <dd className="mt-0 text-gray-900">{selectedOrderDetails[0]?.order?.branch?.address || 'N/A'}</dd>
                                                        </div>

                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                            <dt className="text-sm font-medium text-gray-600 mt-2">Se entregó en</dt>
                                                            <dd className="mt-0 text-gray-900">{selectedOrderDetails[0]?.order?.shippingAddress || 'Pendiente'}</dd>
                                                        </div>

                                                        <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                            <dt className="text-sm font-medium text-gray-600">Detalles del Pago</dt>
                                                            <dd className="mt-0 text-gray-900">Método de pago: {selectedOrderDetails[0]?.order?.paymentMethod || 'N/A'}</dd>
                                                            <dd className="mt-0 text-gray-900">Total: {selectedOrderDetails[0]?.order?.total?.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) || 'N/A'}</dd>
                                                        </div> */}


                                                        <div className="sm:col-span-2 flex justify-center items-center w-full mt-5">
                                                            <Button
                                                                onClick={() => navigate(`/e-commerce/rentar/${order.id}`)}
                                                                className="w-auto px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-white hover:text-indigo-600 hover:border-indigo-600 border-2 border-indigo-600 transition-colors duration-600 cursor-pointer"
                                                            >
                                                                Realizar renta
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center text-gray-500">No se pudieron cargar los detalles del pedido.</p>
                                            )}
                                            <DialogFooter className="">
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}