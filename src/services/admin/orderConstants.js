// Enums del backend para órdenes
export const ORDER_TYPES = {
  PURCHASE: "Compra",
  RENTAL: "Renta", 
  SERVICE: "Servicio"
};

export const ORDER_STATUS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo"
};

export const SHIPPING_STATUS = {
  PENDING: "Pendiente",
  SHIPPED: "Enviado", 
  DELIVERED: "Entregado",
  IN_TRANSIT: "En Tránsito"
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: "Tarjeta de Crédito",
  DEBIT_CARD: "Tarjeta de Débito", 
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia Bancaria"
};

// Mapeo para traducción de estados
export const STATUS_MAP = {
  // Shipping Status
  PENDING: "Pendiente",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  IN_TRANSIT: "En Tránsito",
  // Order Status
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

// Mapeo para traducción de tipos
export const TYPE_MAP = {
  PURCHASE: "Compra",
  RENTAL: "Renta",
  SERVICE: "Servicio"
};

// Mapeo para traducción de métodos de pago
export const PAYMENT_MAP = {
  CREDIT_CARD: "Tarjeta de Crédito",
  DEBIT_CARD: "Tarjeta de Débito", 
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia Bancaria"
};

// Función helper para traducir cualquier valor
export const translateValue = (value, map) => {
  if (!value) return '-';
  return map[value] || value;
};

// Función helper para traducir tipo de orden
export const translateOrderType = (type) => translateValue(type, TYPE_MAP);

// Función helper para traducir estado de envío
export const translateShippingStatus = (status) => translateValue(status, STATUS_MAP);

// Función helper para traducir estado de orden
export const translateOrderStatus = (status) => translateValue(status, STATUS_MAP);

// Función helper para traducir método de pago
export const translatePaymentMethod = (method) => translateValue(method, PAYMENT_MAP); 