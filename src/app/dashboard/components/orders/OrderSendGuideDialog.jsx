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

const ESTADOS = [
  'Pendiente',
  'En Revisión',
  'En Proceso',
  'Listo para Entrega',
  'Entregado'
];

export function OrderSendGuideDialog({ open, onOpenChange, order, onSave, onCancel, isLoading }) {
  const [url, setUrl] = useState("");
  const [estado, setEstado] = useState(order?.estado || ESTADOS[0]);

  useEffect(() => {
    setUrl(order?.guiaUrl || "");
    setEstado(order?.estado || ESTADOS[0]);
  }, [order]);

  const handleSave = () => {
    if (onSave) onSave({ ...order, guiaUrl: url, estado });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mandar guía de seguimiento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500">ID de orden:</span>
            <div className="font-semibold">{order?.id}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Cliente:</span>
            <div className="font-semibold">{order?.cliente}</div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">URL de seguimiento</label>
            <input
              type="url"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado del pedido</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={estado}
              onChange={e => setEstado(e.target.value)}
            >
              {ESTADOS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
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
            disabled={isLoading || !url}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 