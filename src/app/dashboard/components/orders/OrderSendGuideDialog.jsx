import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useUpdateOrder } from "@/services/admin/orderService";
import { SHIPPING_STATUS } from "@/services/admin/orderConstants";
import toast from "react-hot-toast";
import { ExternalLink, Package } from "lucide-react";

export function OrderSendGuideDialog({ open, onOpenChange, order, onSave, onCancel }) {
  const [url, setUrl] = useState("");
  const [shippingStatus, setShippingStatus] = useState("PENDING");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");

  const updateOrderMutation = useUpdateOrder();

  useEffect(() => {
    if (order) {
      const currentUrl = order.raw?.shippingGuide || "";
      
      // Si la URL es "PENDIENTE" o termina en "/PENDIENTE", mostrar el input vacío
      const isPendingUrl = currentUrl.toUpperCase() === "PENDIENTE" || 
                          currentUrl.endsWith('/PENDIENTE');
      
      setUrl(isPendingUrl ? "" : currentUrl);
      setShippingStatus(order.raw?.shippingStatus || "PENDING");
      setEstimatedDeliveryDate(
        order.raw?.estimatedDeliveryDate 
          ? new Date(order.raw.estimatedDeliveryDate).toISOString().split('T')[0]
          : ""
      );
    }
  }, [order]);

  const handleSave = async () => {
    if (!order?.raw?.id) {
      toast.error("Error: No se pudo identificar la orden");
      return;
    }

    try {
      // Preparar los datos para el backend
      const orderData = {
        id: order.raw.id,
        userId: order.raw.userId,
        type: order.raw.type || "PURCHASE",
        status: order.raw.status || "ACTIVE",
        paymentMethod: order.raw.paymentMethod,
        shippingGuide: (url.trim() && 
                       url.trim().toUpperCase() !== "PENDIENTE" && 
                       !url.trim().endsWith('/PENDIENTE')) ? url.trim() : null,
        shippingStatus: shippingStatus,
        estimatedDeliveryDate: estimatedDeliveryDate 
          ? `${estimatedDeliveryDate}T00:00:00.000Z` // Agregar tiempo para evitar problemas de zona horaria
          : undefined
      };

      await updateOrderMutation.mutateAsync(orderData);
      
      if (url.trim()) {
        toast.success("URL de seguimiento actualizada correctamente");
      } else {
        toast.success("Estado de envío actualizado correctamente");
      }
      
      if (onSave) {
        onSave({ ...order, guiaUrl: url, estado: shippingStatus });
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Error al actualizar la información de envío");
    }
  };

  const isLoading = updateOrderMutation.isPending;
  const hasExistingUrl = order?.raw?.shippingGuide && 
                        order.raw.shippingGuide.trim() !== "" &&
                        order.raw.shippingGuide.toUpperCase() !== "PENDIENTE" &&
                        !order.raw.shippingGuide.endsWith('/PENDIENTE');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información de Envío
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <span className="text-xs text-gray-500">ID de orden:</span>
            <div className="font-semibold">{order?.id}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Cliente:</span>
            <div className="font-semibold">{order?.cliente}</div>
          </div>
          
          {/* Estado actual de la URL */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">URL de seguimiento actual:</span>
            </div>
            {hasExistingUrl ? (
              <div className="flex items-center gap-2">
                <a 
                  href={order.raw.shippingGuide} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
                >
                  {order.raw.shippingGuide}
                </a>
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </div>
            ) : order?.raw?.shippingGuide && 
                  (order.raw.shippingGuide.toUpperCase() === "PENDIENTE" || 
                   order.raw.shippingGuide.endsWith('/PENDIENTE')) ? (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-amber-600 italic">
                  Pendiente - Sin URL de seguimiento asignada
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Por el momento no has asignado ninguna guía de envío
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva URL de seguimiento
            </label>
            <input
              type="url"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Ingresa la URL de seguimiento (ej: https://www.fedex.com/tracking?trknbr=123456789)"
              value={url}
              onChange={e => setUrl(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Deja vacío para mantener sin URL de seguimiento. Ingresa una URL válida de seguimiento.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado del envío</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={shippingStatus}
              onChange={e => setShippingStatus(e.target.value)}
            >
              {Object.entries(SHIPPING_STATUS).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha estimada de entrega</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={estimatedDeliveryDate}
              onChange={e => setEstimatedDeliveryDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          </DialogClose>
          <button
            type="button"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 