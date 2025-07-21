import React, { useEffect, useState } from 'react';
import { getOrdersByUser } from '@/services/public/orderService';
import { jwtDecode } from 'jwt-decode';
import { X } from 'lucide-react';

export default function CardCarProducts({ setSelected }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchOrders() {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No autenticado');
                const decoded = jwtDecode(token);
                const userId = decoded.sub ? parseInt(decoded.sub, 10) : null;
                if (!userId) throw new Error('No se pudo obtener el ID de usuario');
                const res = await getOrdersByUser(userId);
                setOrders(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                setError(err.message || 'Error al cargar las órdenes');
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    if (loading) {
        return <p className="text-center text-gray-500">Cargando órdenes...</p>;
    }
    if (error) {
        return <p className="text-center text-red-500">{error}</p>;
    }
    if (!orders.length) {
        return <p className="text-center text-gray-500">No hay compras registradas.</p>;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
            {orders.map(order => (
                <div
                    key={order.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 cursor-pointer overflow-hidden"
                    onClick={() => setSelected(order)}
                >
                    <div className="mt-2 flex items-center text-xl text-gray-600 pl-5 py-3 border-b-2 justify-between relative">
                        <span className="font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Sin fecha'}</span>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-red-100 transition-colors"
                            onClick={e => e.stopPropagation() /* prevent card click */}
                        >
                            <X className="w-6 h-6 text-red-500" />
                        </button>
                    </div>
                    <div className="px-10 sm:px-10 py-4 flex flex-col sm:flex-row items-center sm:items-center">
                        <div className="flex-1 ml-4 sm:mt-0 sm:ml-4">
                            <h2 className="text-2xl font-semibold">Pedido: {order.id}</h2>
                            <p className="mt-1 text-gray-700 line-clamp-3 w-[80%] text-justify">
                                Cantidad: {order.orderDetails ? order.orderDetails.reduce((sum, d) => sum + (d.quantity || 1), 0) : 1}
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
}