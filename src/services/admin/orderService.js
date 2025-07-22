import apiClient from "../apiClient";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "./userService";
import { getAllProducts } from "./productService";

// Utilidad para traducir shippingStatus
const statusMap = {
  PENDING: "Pendiente",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  // Agrega más si tu backend los usa
};

// Utilidad para traducir type
const typeMap = {
  PURCHASE: "Compra",
  RENTAL: "Renta",
};

// Adaptador de orden para la tabla (recibe catálogos de users y products)
function adaptOrder(order, usersById, productsById) {
  const user = usersById[order.userId];
  const product = productsById[order.orderHistoryId];
  return {
    id: `ORD-2025-00${order.id}`,
    cliente: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : order.userId || '-',
    referencia: order.orderHistoryId || '-', // Cambia el nombre de la columna a 'Referencia'
    tipo: typeMap[order.type] || order.type || '-',
    estado: statusMap[order.shippingStatus] || order.shippingStatus || '-',
    guia: order.shippingGuide || '-',
    fecha: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
    fechaEntrega: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : '-',
    estatus: order.status || '-',
    raw: order,
  };
}

// Servicio para obtener órdenes (sin adaptar)
export const fetchOrders = async () => {
  const { data } = await apiClient.get("/l/orders");
  console.log("Array de órdenes (data):", data.data);
  return data.data || [];
};

// Hook para obtener órdenes adaptadas con nombres
export const useOrdersWithNames = (options = {}) => {
  // Trae órdenes, usuarios y productos en paralelo
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    refetchInterval: 10000,
    ...options,
  });
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await getAllProducts();
      // Soporta ambos formatos de respuesta
      return Array.isArray(res) ? res : res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mapeo rápido por ID
  const usersById = (usersQuery.data || []).reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
  const productsById = (productsQuery.data || []).reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  // Adaptar órdenes solo si todo está cargado
  const adaptedOrders =
    ordersQuery.data && usersQuery.data && productsQuery.data
      ? ordersQuery.data.map(order => adaptOrder(order, usersById, productsById))
      : [];

  return {
    orders: adaptedOrders,
    isLoading: ordersQuery.isLoading || usersQuery.isLoading || productsQuery.isLoading,
    error: ordersQuery.error || usersQuery.error || productsQuery.error,
    refetch: () => {
      ordersQuery.refetch();
      usersQuery.refetch();
      productsQuery.refetch();
    },
  };
};
