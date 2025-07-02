import React, { useState, useEffect, useRef } from 'react';
import { getWhatsappQR } from '@/services/public/QRService';
import QRCode from 'react-qr-code';

const Whatsapp = () => {
  const [qrData, setQrData] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Referencia para poder limpiar el intervalo desde cualquier parte
  const pollingRef = useRef(null);

  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getWhatsappQR();

      // Verificamos si la respuesta es un string (JSON) o ya es un objeto
      let responseData;
      try {
        responseData = typeof response === 'string' ? JSON.parse(response) : response;
      } catch (e) {
        // Si no se puede parsear, asumimos que es el código QR directo
        setQrData(response);
        setStatus('qr_required');
        return;
      }

      // Intentamos obtener los datos del QR de diferentes formas posibles
      const qrData = responseData?.data?.qrCode || responseData?.qrCode || responseData;
      const qrStatusRaw = responseData?.data?.status || responseData?.status;
      // Normalizamos el estado para tener solo 3 posibles valores
      const qrStatus = ['connected', 'authenticated'].includes(qrStatusRaw)
        ? 'connected'
        : 'qr_required';

      console.log('Datos del QR:', { qrData, qrStatus });

      if (!qrData) {
        throw new Error('No se pudo obtener el código QR');
      }

      setQrData(qrData);
      setStatus(qrStatus);

      // Si ya está conectado dejamos de hacer polling
      if (qrStatus === 'connected' && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch (err) {
      console.error('Error fetching WhatsApp QR code:', err);
      setError(err.message || 'Error al obtener el código QR de WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar el código QR inmediatamente
    fetchQRCode();

    // Configurar actualización automática cada 5 segundos
    pollingRef.current = setInterval(() => {
      console.log('Actualizando código QR...');
      fetchQRCode();
    }, 5000);

    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Conexión de WhatsApp</h1>
      </div>

      <div class="bg-white rounded-lg shadow p-6 w-full h-auto">
      
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Cargando código QR...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-500">
            <p className="mb-4">{error}</p>
            <p className="text-sm text-gray-500">Intentando de nuevo en 5 segundos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {status === 'qr_required' && (
              <>
                <p className="mb-4 text-gray-600">Escanea el código QR con WhatsApp para conectar</p>
                <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-white">
                  {qrData && (
                    <div className="p-4 bg-white">
                      <QRCode
                        value={qrData}
                        size={256}
                        level="H"
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                </div>
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
                <p className="text-xs text-gray-400 mt-2">Actualizando automáticamente...</p>
              </>
            )}
            {status === 'connected' && (
              <div className="text-center p-6 text-green-600">
                <div className="text-5xl mb-4">✓</div>
                <p className="text-xl font-semibold mb-2">¡Código escaneado!</p>
                <p className="text-gray-600">WhatsApp está conectado y listo para recibir mensajes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Whatsapp;