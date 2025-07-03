import { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { getWhatsappQR } from '@/services/public/QRService';

const QRCodeDisplay = ({ onStatusChange }) => {
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('Preparando código QR...');
  const [showError, setShowError] = useState(false);
  const pollingRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await getWhatsappQR();
      
      console.log('Respuesta de getWhatsappQR (QRCodeDisplay):', response);
      retryCountRef.current = 0; // Reiniciamos el contador de reintentos en caso de éxito
      setShowError(false);

      if (response.qrCode) {
        setQrData(response.qrCode);
        setMessage(response.message || 'Escanee el código QR para conectar WhatsApp');
      } else if (response.status === 'connected') {
        onStatusChange('connected', response.message);
      } else if (response.status === 'connecting') {
        setMessage('Conectando con WhatsApp...');
      } else {
        setMessage(response.message || 'Preparando código QR...');
      }
      
    } catch (err) {
      console.error('Error al obtener el código QR:', err);
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        setShowError(true);
        setMessage('No se pudo conectar con el servicio de WhatsApp');
      } else {
        // Mostramos mensaje de reconexión
        setMessage('Realizando conexión...');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar el código QR inmediatamente
    fetchQRCode();

    // Configurar actualización automática cada 5 segundos
    pollingRef.current = setInterval(fetchQRCode, 5000);

    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  if (showError) {
    return (
      <div className="text-center p-3 sm:p-4">
        <p className="text-sm sm:text-base text-red-500">{message}</p>
        <button 
          onClick={() => {
            retryCountRef.current = 0;
            setShowError(false);
            fetchQRCode();
          }}
          className="mt-2 px-4 py-1.5 sm:py-2 bg-blue-500 text-white text-xs sm:text-sm rounded hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2 sm:p-4">
      <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600 text-center">{message}</p>
      {isLoading || !qrData ? (
        <div className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-white w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="p-2 sm:p-4 border border-gray-200 rounded-lg bg-white w-full max-w-xs">
          <div className="w-full" style={{ paddingBottom: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <QRCode 
                value={qrData} 
                size={256}
                style={{ height: '100%', width: '100%' }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 text-center">
        <p className="leading-tight">1. Abre WhatsApp en tu teléfono</p>
        <p className="leading-tight">2. Toca los tres puntos (⋮) o Configuración</p>
        <p className="leading-tight">3. Selecciona "Dispositivos vinculados"</p>
        <p className="leading-tight">4. Toca "Vincular un dispositivo"</p>
        <p className="leading-tight">5. Escanea este código QR</p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
