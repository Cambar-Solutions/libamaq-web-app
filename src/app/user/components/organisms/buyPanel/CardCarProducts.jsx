import React, { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Table2, Smartphone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BsFillCreditCardFill, BsCash } from "react-icons/bs";
import { TbShoppingBagEdit } from "react-icons/tb";
import ShippingStatusBadge from '@/components/ui/ShippingStatusBadge';


export default function CardCarProducts({ groupedOrders, setSelected, handleTriggerDelete }) {
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

    const handleViewDetails = (order) => {
        setSelected(order);
    };

    const getOrderTypeIcon = (order) => {
        let iconComponent;
        let bgColorClass;
        let iconColor = "#364153";

        const paymentMethod = order.paymentMethod;

        if (paymentMethod === 'CASH') {
            iconComponent = <BsCash size={22} color={iconColor} />;
            bgColorClass = "bg-green-100";
        } else if (paymentMethod === 'BANK_TRANSFER') {
            iconComponent = <BsFillCreditCardFill size={22} color={iconColor} />;
            bgColorClass = "bg-blue-100";
        } else {
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
        const paymentMethod = order.paymentMethod;

        if (paymentMethod === 'CASH') {
            return 'Efectivo';
        } else if (paymentMethod === 'BANK_TRANSFER') {
            return 'Transferencia';
        } else {
            return 'Compra';
        }
    };

    const formatUTCDate = (dateString, options = {}) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();

        if (options.long) {
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            return `${day} de ${months[month]} de ${year}`;
        } else {
            return `${day}/${month + 1}/${year}`;
        }
    };

    const renderViewControls = () => !isMobile && (
        <div className="flex items-center gap-2 mb-0 mx-30">
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

    if (!groupedOrders || groupedOrders.length === 0) {
        return <p className="text-center text-gray-500">No hay pedidos disponibles para las fechas seleccionadas.</p>;
    }

    const renderTable = () => (
        <div className="max-w-4xl ml-30 mt-10 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mx-10">
            <div className="relative overflow-x-auto">
                <Table className="divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                        <TableRow className="border-b border-gray-200">
                            <TableHead className="px-6 py-3 text-center">ID del Pedido</TableHead>
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
                                        Pedidos del {formatUTCDate(group.date, { long: true })}
                                    </TableCell>
                                </TableRow>
                                {group.orders.map(order => (
                                    <TableRow key={order.id} className="hover:bg-gray-50" >
                                        <TableCell className="px-6 py-4 font-medium text-gray-900">{order.id}</TableCell>
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
                                            <ShippingStatusBadge shippingStatus={order.shippingStatus} size="xs" />
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
                                                                    handleTriggerDelete(order.id); // Llama a la función del padre
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
        <div className="space-y-8 max-w-4xl justify-items-center lg:ml-30">
            {groupedOrders.map(group => (
                <React.Fragment key={group.date}>
                    <h2 className="text-xl md:text-2xl font-semibold text-indigo-950 mb-4 ml-10 mt-8">
                        Pedidos del {formatUTCDate(group.date, { long: true })}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-3 w-full">
                        {group.orders.map(order => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 select-none overflow-hidden lg:mx-10"
                                onClick={() => setSelected(order)}
                            >
                                <div className=" flex items-center text-gray-600 justify-between relative mt-0">
                                    <div className="absolute right-0 top-5 -translate-y-1/2 flex space-x-2 mt-2 mr-4">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleViewDetails(order);
                                                        }}
                                                        className="sm:hidden p-2 rounded-full hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                                                    >
                                                        <Eye className="h-6 w-6 text-blue-600 cursor-pointer" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                    <p>Ver detalles</p>
                                                </TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        className="p-2 rounded-full hover:bg-red-100 transition-colors"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            handleTriggerDelete(order.id); // Llama a la función del padre
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
                                <div className="px-0 lg:px-10 py-6 flex flex-col sm:flex-row items-center">
                                    <div className="flex lg:ml-4 ml-0 w-[80%] items-center justify-items-center lg:justify-items-start lg:gap-3 gap-11">
                                        <div className='items-center h-full'>
                                            <span className="">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className=" justify-items-center" >
                                                                <div>
                                                                    {getOrderTypeIcon(order)}
                                                                </div>

                                                                <div className='sm:hidden text-sm text-gray-500'>
                                                                    {getTranslatedOrderTypeText(order)}
                                                                </div>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top" className="text-xs px-2 py-1 rounded-sm shadow-md duration-500">
                                                            <p>{getTranslatedOrderTypeText(order)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </span>
                                        </div>
                                        <div className='lg:justify-items-start justify-items-center'>
                                            <h2 className="text-2xl font-semibold">Pedido: {order.id}</h2>
                                            <p className="mt-1 text-gray-700 line-clamp-3 text-justify flex items-center">
                                                Cantidad: {order.totalProducts || "..."}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center sm:mt-0 lg:ml-0 ml-9">
                                        <ShippingStatusBadge shippingStatus={order.shippingStatus} size="sm" className="mt-2" />
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
        </div>
    );
}