# OrderSendGuideDialog

Componente para actualizar la URL de seguimiento y estado de una orden usando el endpoint PUT `/l/orders`.

## Funcionalidades

- ✅ **URL de seguimiento**: Para que el usuario pueda rastrear su pedido
- ✅ **Estado por defecto**: Si no hay URL, muestra "Pendiente" en la tabla
- ✅ **Mensaje informativo**: En el modal muestra "Por el momento no has asignado ninguna guía de envío"
- ✅ **Actualiza estado de envío** (`shippingStatus`)
- ✅ **Actualiza fecha estimada de entrega** (`estimatedDeliveryDate`)
- ✅ **Usa los enums correctos del backend**
- ✅ **Manejo de errores con toast notifications**
- ✅ **Loading states durante la actualización**
- ✅ **Auto-refresh de datos después de actualizar**

## Flujo de Trabajo

### 1. **Estado Inicial (Sin URL)**
- En la tabla: Muestra "Pendiente" en la columna de guía
- En el modal: Muestra mensaje "Por el momento no has asignado ninguna guía de envío"
- Botón: "Asignar guía"

### 2. **Con URL Asignada**
- En la tabla: Muestra la URL como enlace clickeable
- En el modal: Muestra la URL actual con enlace para abrir
- Botón: "Actualizar guía"

## Props

```jsx
<OrderSendGuideDialog
  open={boolean}                    // Controla si el diálogo está abierto
  onOpenChange={(open) => void}     // Callback cuando cambia el estado del diálogo
  order={OrderObject}               // Objeto de la orden a actualizar
  onSave={(updatedOrder) => void}   // Callback cuando se guarda exitosamente
  onCancel={() => void}             // Callback cuando se cancela
/>
```

## Ejemplo de uso

```jsx
import { OrderSendGuideDialog } from "./OrderSendGuideDialog";

function OrdersView() {
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [orderForGuide, setOrderForGuide] = useState(null);

  const handleSendGuide = (order) => {
    setOrderForGuide(order);
    setIsGuideDialogOpen(true);
  };

  const handleSaveGuide = (updatedOrder) => {
    // El componente maneja la actualización automáticamente
    setIsGuideDialogOpen(false);
    setOrderForGuide(null);
  };

  return (
    <div>
      {/* Tu tabla de órdenes */}
      <OrdersTable onSendGuide={handleSendGuide} />
      
      {/* Diálogo de guía */}
      <OrderSendGuideDialog
        open={isGuideDialogOpen}
        onOpenChange={setIsGuideDialogOpen}
        order={orderForGuide}
        onSave={handleSaveGuide}
        onCancel={() => setIsGuideDialogOpen(false)}
      />
    </div>
  );
}
```

## Estructura de datos enviada al backend

```javascript
{
  id: BigInt,                    // ID de la orden
  userId: BigInt,                // ID del usuario
  type: "PURCHASE" | "RENTAL" | "SERVICE",
  status: "ACTIVE" | "INACTIVE",
  paymentMethod: string,
  shippingGuide: string | null,  // URL de seguimiento o null si está vacío
  shippingStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "IN_TRANSIT",
  estimatedDeliveryDate: string  // ISO string (ej: "2024-06-20T00:00:00.000Z")
}
```

## Estados de envío disponibles

- `PENDING` → "Pendiente"
- `SHIPPED` → "Enviado"
- `DELIVERED` → "Entregado"
- `IN_TRANSIT` → "En Tránsito"

## Características del Modal

### **Sin URL asignada:**
- Muestra mensaje informativo
- Campo de URL vacío
- Permite asignar nueva URL

### **Con URL asignada:**
- Muestra la URL actual como enlace
- Permite actualizar la URL existente
- Enlace abre en nueva pestaña

### **Validaciones:**
- Campo URL es opcional (puede dejarse vacío)
- URL debe ser válida si se ingresa
- Estado de envío es requerido

## Dependencias

- `react-hot-toast` para notificaciones
- `@tanstack/react-query` para manejo de estado
- `orderService.js` para la API
- `orderConstants.js` para los enums 