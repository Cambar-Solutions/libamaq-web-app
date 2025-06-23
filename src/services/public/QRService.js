import apiClient from "../apiClient";

/**
 * Servicio para obtener el código QR de WhatsApp.
 * @returns {Promise<string>} El código QR como una cadena de texto (Data URI o URL), o una cadena vacía si no se encuentra.
 * @throws {Error} Si ocurre un error durante la solicitud.
 */
export const getWhatsappQR = async () => {
    try {
        const response = await apiClient.get("/l/whatsapp/qr");
        console.log('Respuesta completa getWhatsappQR:', response); // Esto ya lo ves

        // Añade esta línea para ver el contenido del objeto 'data' anidado
        console.log('Contenido de response.data.data:', response.data?.data);

        const qrCodeValue = response.data?.data?.qrCode; // Sigo asumiendo esta estructura por tu Swagger inicial

        if (!qrCodeValue) {
            console.warn("La respuesta del servidor no contiene un qrCode válido.", { fullResponseData: response.data });
            throw new Error("Formato de respuesta de QR inesperado: qrCode no encontrado.");
        }

        return qrCodeValue;
    } catch (error) {
        console.error('Error en getWhatsappQR:', error);
        throw error.response?.data?.message || error.message || "Error al obtener el código QR.";
    }
};