import React, { useEffect, useState } from 'react';
// Cambia la importación de 'getOrderDetails' a 'getOrderDetailsByOrderId'
import { getOrdersByUser, deleteOrder, getOrderDetailsByOrderId } from '@/services/public/orderService'; // Asegúrate que esta ruta es correcta
import { jwtDecode } from 'jwt-decode';
import { X, Eye } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Table2, Smartphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CardCarProducts({ setSelected }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('card');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setViewMode('card');
            }
        };
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    async function fetchOrders() {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No autenticado');
            const decoded = jwtDecode(token);
            const userId = decoded.sub ? parseInt(decoded.sub, 10) : null;
            if (!userId) throw new Error('No se pudo obtener el ID de usuario');

            // 1. Obtener las órdenes generales del usuario
            const ordersRes = await getOrdersByUser(userId);
            const userOrders = Array.isArray(ordersRes?.data) ? ordersRes.data : [];

            // 2. Para cada orden, obtener sus detalles
            const ordersWithDetailsPromises = userOrders.map(async (order) => {
                // Llama a tu función existente: getOrderDetailsByOrderId
                const detailsRes = await getOrderDetailsByOrderId(order.id);
                // Asegúrate de que detailsRes.data es un array, si no, usa un array vacío
                // El JSON que me proporcionaste antes tiene los detalles directamente en 'data' del servicio
                // Por lo tanto, `detailsRes` ya es el array de detalles.
                const orderDetailsData = Array.isArray(detailsRes.data) ? detailsRes.data : [];

                return {
                    ...order,
                    orderDetails: orderDetailsData // Adjunta los detalles a la orden
                };
            });

            // Esperar a que todas las llamadas de detalles se completen
            const completedOrders = await Promise.all(ordersWithDetailsPromises);

            // Lógica para marcar compra rápida desde localStorage
            let lastCompraRapida = null;
            try {
                lastCompraRapida = JSON.parse(localStorage.getItem('lastCompraRapida'));
            } catch {}
            const completedOrdersWithCompra = completedOrders.map(order => {
                if (lastCompraRapida && String(order.id) === String(lastCompraRapida.orderId) && lastCompraRapida.compra) {
                    return { ...order, compra:true };
                }
                return order;
            });

            setOrders(completedOrdersWithCompra); // Actualiza el estado con la marca de compra rápida
            console.log("Órdenes cargadas (con detalles):", completedOrdersWithCompra);

        } catch (err) {
            setError(err.message || 'Error al cargar las órdenes');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleTriggerDelete = (orderId) => {
        setOrderToDelete(orderId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        setDeleteDialogOpen(false);
        try {
            await deleteOrder(orderToDelete);
            setOrders(prevOrders => prevOrders.filter(order => order.id !== orderToDelete));
            toast.success(`Pedido ${orderToDelete} eliminada exitosamente.`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || `Error al eliminar la orden ${orderToDelete}`;
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setOrderToDelete(null);
        }
    };

    const handleViewDetails = (order) => {
        setSelected(order);
    };

    const renderViewControls = () => !isMobile && (
        <div className="flex items-center gap-2 mb-4">
            <div className="flex border rounded-md overflow-hidden">
                <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-r-none h-9 px-3"
                    onClick={() => setViewMode('table')}
                >
                    <Table2 className="h-4 w-4 mr-2" />
                    <span>Tabla</span>
                </Button>
                <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-l-none h-9 px-3"
                    onClick={() => setViewMode('card')}
                >
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span>Cards</span>
                </Button>
            </div>
        </div>
    );

    if (loading) {
        return <p className="text-center text-gray-500">Cargando órdenes...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }
    if (!orders.length) {
        return <p className="text-center text-gray-500">No hay compras registradas.</p>;
    }

    const renderTable = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative overflow-x-auto">
                <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="px-6 py-3 text-center">ID del Pedido</TableHead>
                            <TableHead className="px-6 py-3 text-center">Fecha</TableHead>
                            <TableHead className="px-6 py-3 text-center">Cantidad</TableHead>
                            <TableHead className="px-6 py-3 text-center">Tipo</TableHead>
                            <TableHead className="px-6 py-3 text-center">Estado</TableHead>
                            <TableHead className="px-6 py-3 text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200 text-center">
                        {orders.map(order => (
                            <TableRow key={order.id} className="hover:bg-gray-50" >
                                <TableCell className="px-6 py-4 font-medium text-gray-900">{order.id}</TableCell>
                                <TableCell className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</TableCell>
                                <TableCell className="px-6 py-4">{order.totalProducts || "..."}</TableCell>
                                <TableCell className="px-6 py-4">{order.type || "..."}</TableCell>
                                <TableCell className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Pendiente
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-center">
                                    <TooltipProvider>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleViewDetails(order);
                                                        }}
                                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                    <p>Ver detalles</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleTriggerDelete(order.id);
                                                        }}
                                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                    <p>Eliminar</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    const renderCards = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {orders.map(order => (
                <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 select-none overflow-hidden"
                    onClick={() => setSelected(order)}
                >
                    <div className="mt-2 flex items-center text-xl text-gray-600 pl-5 py-3 border-b-2 justify-between relative">
                        <span className="font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleViewDetails(order);
                                            }}
                                        >
                                            <Eye className="w-6 h-6 text-blue-500 cursor-pointer" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                        <p>Ver detalles</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="p-2 rounded-full hover:bg-red-100 transition-colors"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleTriggerDelete(order.id);
                                            }}
                                        >
                                            <X className="w-6 h-6 text-red-500 cursor-pointer" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                        <p>Eliminar</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                    <div className="px-10 sm:px-10 py-4 flex flex-col sm:flex-row items-center sm:items-center">
                        <div className="flex-1 ml-4 sm:mt-0 sm:ml-4">
                            <h2 className="text-2xl font-semibold">Pedido: {order.id}</h2>
                            <p className="mt-1 text-gray-700 line-clamp-3 w-[80%] text-justify">
                                Cantidad: {order.totalProducts || "..."} | {order.type || "..."}
                            </p>
                        </div>
                        <div className="flex flex-col items-center sm:mt-0">
                            <span className="mt-2 px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                Pendiente
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4">
            {renderViewControls()}
            {viewMode === 'table' ? renderTable() : renderCards()}
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
        </div>
    );
}