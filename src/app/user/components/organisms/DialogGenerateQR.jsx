import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { MapPin, ChevronRight, QrCode } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnSave from "../atoms/BtnSave";
import { getWhatsappQR } from "@/services/public/QRService";

export default function DialogGenerateQR() {
  const [qrCode, setQrCode] = useState("");
  const [status, setStatus] = useState(null); // Nuevo estado para el status de conexión
  const [qrRequired, setQrRequired] = useState(false); // Nuevo estado para qrRequired
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchQrCode = async () => {
    setLoading(true);
    setError(null);
    setQrCode(""); // Limpiar QR previo
    setStatus(null); // Limpiar estados previos
    setQrRequired(false);

    try {
      const responseData = await getWhatsappQR(); // getWhatsappQR ahora devuelve el objeto data completo

      // **Importante**: getWhatsappQR debe devolver el objeto `data` completo del servidor, no solo el `qrCode`.
      // Si ya lo hace, ignora el comentario en getWhatsappQR y solo asegúrate de desestructurar aquí.
      // Si getWhatsappQR solo devuelve qrCode, deberás modificarlo para que devuelva todo el `response.data.data`
      // o hacer la llamada a la API directamente aquí para tener acceso a todos los campos.

      // Vamos a ajustar getWhatsappQR para que devuelva el objeto `data.data` del servidor
      // y así poder usar `qrCode`, `status`, `qrRequired`
      // Por favor, asegúrate de que tu `QRService.js` se ve así:
      /*
      // QRService.js
      import apiClient from "../apiClient";
      export const getWhatsappQR = async () => {
        try {
          const response = await apiClient.get("/l/whatsapp/qr");
          console.log('Respuesta completa getWhatsappQR:', response);
          console.log('Contenido de response.data.data:', response.data?.data); // Para debug
          return response.data?.data; // Devuelve todo el objeto data del servidor
        } catch (error) {
          console.error('Error en getWhatsappQR:', error);
          throw error.response?.data?.message || error.message || "Error al obtener el código QR.";
        }
      };
      */

      // Con el cambio anterior en QRService.js, aquí desestructuramos:
      const { qrCode: receivedQrCode, status: receivedStatus, qrRequired: receivedQrRequired } = responseData || {};

      setQrCode(receivedQrCode || "");
      setStatus(receivedStatus || null);
      setQrRequired(receivedQrRequired || false);

      if (!receivedQrCode && receivedQrRequired) {
        setError("El código QR no está disponible. Asegúrate de que el servidor lo está generando.");
      }

    } catch (err) {
      console.error("Error al obtener el código QR:", err);
      setError(err.message || "No se pudo cargar el código QR. Inténtalo de nuevo.");
      setQrCode("");
      setStatus(null);
      setQrRequired(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      console.log("Diálogo abierto, iniciando carga del QR...");
      fetchQrCode();
    } else {
      console.log("Diálogo cerrado, limpiando estados.");
      setQrCode("");
      setStatus(null);
      setQrRequired(false);
      setError(null);
      setLoading(false);
    }
  }, [isDialogOpen]);

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <button className="h-[50%] flex items-center justify-between bg-white hover:bg-gray-200 transition-colors duration-400 p-4 w-full">
            <div className="flex items-center space-x-4">
              <QrCode className="w-8 h-8 ml-5 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-800 text-lg text-start">Código QR</h3>
                <p className="text-sm text-gray-500 text-start">
                  Genera un código QR para conectarte a WhatsApp
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="flex text-2xl gap-1 items-center">
              <QrCode className="w-6 h-6 text-blue-500" />
              Código QR
            </DialogTitle>
            <DialogDescription>
              Escanea el código QR para conectar tu WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="flex flex-col space-y-4 items-center">
              {/* {loading && <p>Cargando código QR...</p>}

              {error && <p className="text-red-500">{error}</p>}

              {!loading && !error && qrCode && ( // Si no hay carga, no hay error, y sí hay QR
                <>
                  <img
                    src={qrCode}
                    alt="Código QR de WhatsApp"
                    className="w-64 h-64 border p-2 rounded-md"
                  />
                  <p className="text-sm text-gray-600">Escanea este código con tu teléfono para conectar WhatsApp.</p>
                </>
              )}

              {!loading && !error && !qrCode && status === 'connected' && (
                <p className="text-green-600">¡Ya estás conectado a WhatsApp!</p>
              )}

              {!loading && !error && !qrCode && status !== 'connected' && qrRequired === true && (
                <p className="text-orange-500">A la espera de generar el código QR. Recargando...</p>
                // Aquí podrías añadir una lógica para reintentar la obtención del QR
              )}

              {!loading && !error && !qrCode && status !== 'connected' && qrRequired === false && (
                <p className="text-gray-500">No se requiere código QR en este momento.</p>
              )}

              {!loading && !error && !qrCode && status === null && (
                <p className="text-gray-500">Iniciando conexión para generar el código QR.</p>
              )} */}

              <div className="flex flex-col sm:flex-row justify-center items-center sm:items-start p-4 gap-0">
                <div className="flex flex-col items-center w-full sm:w-1/2">
                  <img className="w-full max-w-[20em] h-auto flex justify-center items-center" src="/QR-LIBAMAQ.png" alt="QR Libamaq" />
                </div>
                <div className="flex flex-col items-center w-full sm:w-1/2 pt-0 sm:pt-20">
                  <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                    Para conectar WhatsApp Web:
                    <br />
                    1. Abre WhatsApp en tu teléfono
                    <br />
                    2. Toca los tres puntos (⋮) o Configuración
                    <br />
                    3. Selecciona "Dispositivos vinculados"
                    <br />
                    4. Toca "Vincular un dispositivo"
                    <br />
                    5. Escanea este código QR
                  </p>
                </div>
              </div>

            </div>
          </div>
          <DialogFooter>
            {/* <BtnSave /> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}