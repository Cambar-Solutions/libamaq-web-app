import React, { useEffect, useState } from 'react';
// Elimina imports de servicios de datos y jwtDecode, ya que se manejan en BuyPanel
// import { getOrdersByUser, deleteOrder, getOrderDetailsByOrderId } from '@/services/public/orderService';
// import { jwtDecode } from 'jwt-decode';
import { X, Eye } from 'lucide-react';
// Elimina imports de toast y AlertDialog, ya que se manejan en BuyPanel
// import toast, { Toaster } from "react-hot-toast";
// import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Table2, Smartphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Importa los iconos
import { BsFillCreditCardFill } from "react-icons/bs"; // Para Transferencia
import { BsCash } from "react-icons/bs"; // Para Efectivo
import { TbShoppingBagEdit } from "react-icons/tb"; // Para Compra

export default function CardCarProducts({ groupedOrders, setSelected, onDeleteOrder }) {
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

    // La lógica de carga, error y eliminación de órdenes se maneja en BuyPanel.
    // Este componente solo las renderiza y notifica al padre sobre acciones.

    const handleTriggerDelete = (orderId) => {
        if (onDeleteOrder) {
            onDeleteOrder(orderId); // Llama al callback proporcionado por el padre
        }
    };

    const handleViewDetails = (order) => {
        setSelected(order);
    };

    const getOrderTypeIcon = (order) => {
        let iconComponent;
        let bgColorClass;
        let iconColor = "#364153";

        // Usar paymentMethod para determinar el tipo de pago
        const paymentMethod = order.paymentMethod;
        
        if (paymentMethod === 'CASH') {
            iconComponent = <BsCash size={22} color={iconColor} />;
            bgColorClass = "bg-green-100";
        } else if (paymentMethod === 'BANK_TRANSFER') {
            iconComponent = <BsFillCreditCardFill size={22} color={iconColor} />;
            bgColorClass = "bg-blue-100";
        } else {
            // Para otros tipos o por defecto
            iconComponent = <TbShoppingBagEdit size={22} color={iconColor} />;
            bgColorClass = "bg-orange-100";
        }

        return (
            <span className={`inline-flex items-center justify-center p-1.5 rounded-full ${bgColorClass}`}>
                {iconComponent}
            </span>
        );
    };

    const getTranslatedOrderTypeText = (order) => {
        // Usar paymentMethod para determinar el tipo de pago
        const paymentMethod = order.paymentMethod;
        
        if (paymentMethod === 'CASH') {
            return 'Efectivo';
        } else if (paymentMethod === 'BANK_TRANSFER') {
            return 'Transferencia';
        } else {
            return 'Compra';
        }
    };

    const renderViewControls = () => !isMobile && (
        <div className="flex items-center gap-2 mb-4 mx-10">
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

    // Mensajes de carga/error/no hay pedidos si ya se filtraron todos
    if (!groupedOrders || groupedOrders.length === 0) {
        return <p className="text-center text-gray-500">No hay pedidos disponibles para las fechas seleccionadas.</p>;
    }

    const renderTable = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mx-10">
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
                        {groupedOrders.map(group => (
                            <React.Fragment key={group.date}>
                                <TableRow className="bg-gray-100 hover:bg-gray-100">
                                    <TableCell colSpan="6" className="px-6 py-3 text-left font-semibold text-gray-700">
                                        Pedidos del {new Date(group.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </TableCell>
                                </TableRow>
                                {group.orders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-gray-50" >
                                        <TableCell className="px-6 py-4 font-medium text-gray-900">{order.id}</TableCell>
                                        <TableCell className="px-6 py-4">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</TableCell>
                                        <TableCell className="px-6 py-4">{order.totalProducts || "..."}</TableCell>
                                        <TableCell className="px-6 py-4 flex justify-center items-center h-full">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="">
                                                            {getOrderTypeIcon(order)}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                        <p>{getTranslatedOrderTypeText(order)}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
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
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    const renderCards = () => (
        <div className="space-y-8"> {/* Contenedor principal para todos los grupos de fecha */}
            {groupedOrders.map(group => (
                <React.Fragment key={group.date}>
                    {/* Encabezado de la fecha del grupo, fuera de los contenedores de las tarjetas */}
                    <h2 className="text-xl md:text-2xl font-semibold text-indigo-950 mb-4 ml-10 mt-8">
                        Pedidos del {new Date(group.date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h2>

                    {/* Contenedor de la cuadrícula para las tarjetas de pedidos de esta fecha */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
                        {group.orders.map(order => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 select-none overflow-hidden lg:mx-10" // Estilos de la tarjeta original
                                onClick={() => setSelected(order)} // Al hacer clic en la tarjeta, selecciona el pedido
                            >
                                <div className="mt-2 flex items-center text-xl text-gray-600 pl-15 py-3 border-b-2 justify-between relative">
                                    <span className="font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                                                        onClick={e => {
                                                            e.stopPropagation(); // Evita que se propague el clic a la tarjeta
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
                                                            e.stopPropagation(); // Evita que se propague el clic a la tarjeta
                                                            handleTriggerDelete(order.id); // Llama al callback del padre
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
                                <div className="px-0 lg:px-10 py-4 flex flex-col sm:flex-row items-center">
                                    <div className="flex-1 lg:ml-4 ml-0 w-[80%] items-center justify-items-center lg:justify-items-start">
                                        <h2 className="text-2xl font-semibold">Pedido: {order.id}</h2>
                                        <p className="mt-1 text-gray-700 line-clamp-3 text-justify flex items-center">
                                            Cantidad: {order.totalProducts || "..."}
                                            <span className="ml-4"> {/* Agregado ml-2 para el espacio del icono */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="">
                                                                {getOrderTypeIcon(order)}
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                            <p>{getTranslatedOrderTypeText(order)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center sm:mt-0">
                                        <span className="mt-2 px-2 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            Pendiente {/* Considera hacer esto dinámico basado en order.shippingStatus */}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4">
            {renderViewControls()}
            {viewMode === 'table' ? renderTable() : renderCards()}
            {/* AlertDialog y Toaster se renderizan en el componente BuyPanel */}
        </div>
    );
}