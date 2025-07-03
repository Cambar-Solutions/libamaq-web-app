import apiClient from "../apiClient";

/**
 * Servicio para obtener el estado de conexión de WhatsApp y el código QR si es necesario.
 * @returns {Promise<{qrCode?: string, status: 'connected'|'qr_required'|'connecting'|'error', message?: string}>} 
 * @throws {Error} Si ocurre un error durante la solicitud.
 */
export const getWhatsappQR = async () => {
    try {
        const response = await apiClient.get("/l/whatsapp/qr");
        console.log('Respuesta completa getWhatsappQR:', response);

        // Extraer datos de la respuesta
        const responseData = response?.data?.data || response?.data || response;
        console.log('Datos de la respuesta:', responseData);

        // Verificar si hay un código QR en la respuesta
        if (responseData?.qrCode && (responseData?.status === 'qr_required' || responseData?.status === 'connecting')) {
            return {
                qrCode: responseData.qrCode,
                status: 'qr_required',
                message: 'Escanee el código QR para conectar WhatsApp'
            };
        }
        // Verificar si ya está conectado
        else if (responseData?.status === 'connected' || responseData?.status === 'authenticated') {
            return {
                status: 'connected',
                message: 'WhatsApp está conectado correctamente.'
            };
        }
        // Si el estado es 'connecting' pero no hay QR, mostramos un mensaje de espera
        else if (responseData?.status === 'connecting') {
            return {
                status: 'connecting',
                message: 'Esperando conexión con WhatsApp...'
            };
        }
        // Si hay un código QR pero no está en el formato esperado
        else if (responseData?.qrCode) {
            return {
                qrCode: responseData.qrCode,
                status: 'qr_required',
                message: 'Escanee el código QR para conectar WhatsApp'
            };
        }
        
        // Si no se pudo determinar el estado
        throw new Error(responseData?.message || 'No se pudo determinar el estado de conexión');
        
    } catch (error) {
        console.error('Error en getWhatsappQR:', error);
        throw new Error(
            error.response?.data?.message || 
            error.message || 
            'Error al conectar con el servicio de WhatsApp'
        );
    }
};

/**
 * Servicio para forzar el cierre de sesión de WhatsApp.
 * @returns {Promise<{success: boolean, message: string}>} Objeto con el resultado de la operación.
 * @throws {Error} Si ocurre un error durante la solicitud.
 */
export const forceLogout = async () => {
    try {
        const response = await apiClient.post("/l/whatsapp/force-logout");
        console.log('Respuesta de forceLogout:', response);
        
        if (response.data?.data?.success) {
            return {
                success: true,
                message: response.data.data.message || "Sesión cerrada exitosamente. Se generará un nuevo QR."
            };
        }
        
        throw new Error("No se pudo completar el cierre de sesión forzado.");
    } catch (error) {
        console.error('Error en forceLogout:', error);
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           "Error al forzar el cierre de sesión de WhatsApp.";
        throw new Error(errorMessage);
    }
};