import apiClient from "../apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers } from "./userService";
import { getAllProducts } from "./productService";
import { 
  translateOrderType, 
  translateShippingStatus, 
  translateOrderStatus, 
  translatePaymentMethod 
} from "./orderConstants";

// Helper para convertir BigInt a Number de manera segura
const safeBigIntToNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  if (typeof value === 'bigint') return Number(value);
  return Number(value);
};

// Helper para formatear fechas de manera segura
const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  try {
    // Si es una fecha ISO, crear la fecha correctamente
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return '-';
    
    // Para fechas ISO, usar UTC para evitar problemas de zona horaria
    if (dateString.includes('T')) {
      // Extraer solo la parte de la fecha si es ISO
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para fechas simples (como "2025-08-08"), formatear directamente
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Para fechas simples, formatear normalmente
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

// Adaptador de orden para la tabla (recibe catálogos de users y products)
function adaptOrder(order, usersById, productsById) {
  const user = usersById[order.userId];
  const product = productsById[order.orderHistoryId];
  
  // Determinar si hay URL de seguimiento
  const hasShippingGuide = order.shippingGuide && order.shippingGuide.trim() !== "";
  
  return {
    id: `${order.id}`,
    cliente: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : order.userId || '-',
    referencia: order.orderHistoryId || '-',
    tipo: translateOrderType(order.type),
    estado: translateShippingStatus(order.shippingStatus),
    guia: hasShippingGuide ? order.shippingGuide : 'Pendiente',
    fecha: formatDate(order.createdAt),
    fechaEntrega: formatDate(order.estimatedDeliveryDate),
    estatus: translateOrderStatus(order.status),
    metodoPago: translatePaymentMethod(order.paymentMethod),
    raw: order,
  };
}

// Servicio para obtener órdenes (sin adaptar)
export const fetchOrders = async () => {
  const { data } = await apiClient.get("/l/orders");
  console.log("Array de órdenes (data):", data.data);
  return data.data || [];
};

// Servicio para actualizar una orden
export const updateOrder = async (orderData) => {
  // Convertir BigInt a Number antes de enviar
  const processedData = {
    ...orderData,
    id: safeBigIntToNumber(orderData.id),
    userId: safeBigIntToNumber(orderData.userId),
  };
  
  const { data } = await apiClient.put("/l/orders", processedData);
  return data;
};

// Hook para actualizar orden
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrder,
    onSuccess: () => {
      // Invalidar y refetch las órdenes después de actualizar
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      console.error("Error updating order:", error);
    },
  });
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
