import React, { useState, useRef, useEffect } from 'react';
import { getWhatsappQR, forceLogout } from '@/services/public/QRService';
import QRCodeDisplay from './QRCodeDisplay';

const Whatsapp = () => {
  const [status, setStatus] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pollingRef = useRef(null);

  const handleStatusChange = (newStatus, message) => {
    setStatus(newStatus);
    setConnectionMessage(message || 'WhatsApp está conectado correctamente');
    
    // Si está conectado, detenemos el polling
    if (newStatus === 'connected' && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleForceLogout = async () => {
    try {
      setIsLoggingOut(true);
      await forceLogout();
      // Reiniciamos el estado
      setStatus('qr_required');
      setConnectionMessage('Preparando nuevo código QR...');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    // Cargar el estado inicial
    const fetchQRCode = async () => {
      try {
        const response = await getWhatsappQR();
        
        console.log('Respuesta de getWhatsappQR:', response);

        if (response.status === 'connected') {
          handleStatusChange('connected', response.message);
        } else if (response.status === 'qr_required' || response.status === 'connecting') {
          handleStatusChange(response.status, response.message);
        } else {
          console.warn('No se pudo determinar el estado de conexión:', response);
          // Si no podemos determinar el estado, asumimos que necesitamos un QR
          handleStatusChange('qr_required', 'Preparando código QR...');
        }
        
      } catch (err) {
        console.error('Error al obtener el estado de WhatsApp:', err);
        // En caso de error, asumimos que necesitamos un QR
        handleStatusChange('qr_required', 'Preparando código QR...');
      }
    };

    fetchQRCode();

    // Configurar actualización automática cada 5 segundos solo si no está conectado
    if (status !== 'connected' && !pollingRef.current) {
      pollingRef.current = setInterval(fetchQRCode, 5000);
    }

    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [status]); // Dependencia de status para reiniciar el polling si cambia

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Conexión de WhatsApp</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full max-w-md mx-auto">
        {status === 'connected' ? (
          <div className="text-center p-4 sm:p-6">
            <div className="mx-auto flex items-center justify-center h-14 sm:h-16 w-14 sm:w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 sm:h-10 w-8 sm:w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">¡Conexión exitosa!</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{connectionMessage}</p>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 mb-4 sm:mb-6 text-left text-xs sm:text-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="h-4 sm:h-5 w-4 sm:w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-blue-700">
                    Si cierras la sesión, deberás escanear el código QR nuevamente para volver a conectar.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleForceLogout}
              disabled={isLoggingOut}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 rounded-md text-sm sm:text-base text-white font-medium ${
                isLoggingOut 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
            >
              {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión de WhatsApp'}
            </button>
          </div>
        ) : (
          <QRCodeDisplay onStatusChange={handleStatusChange} />
        )}
      </div>
    </div>
  );
};

export default Whatsapp;