import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, X, Check, ArrowLeft, Calendar, Clock } from "lucide-react";

// Importa tu servicio real aquí. Asegúrate de que la ruta sea correcta.
import { getOrderDetailsByOrderId } from '@/services/admin/orderDetailService';

// Componente de carga simulado
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    <p className="mt-4 text-gray-600">Cargando...</p>
  </div>
);

const RentPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams(); // Obtenemos el orderId de la URL

  // Estados para la orden y su carga
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derivamos el producto de los detalles de la orden
  const product = order?.orderDetails?.[0]?.product || null;

  // Efecto para cargar los detalles de la orden usando el servicio real
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("ID de orden no proporcionado.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getOrderDetailsByOrderId(orderId);

        // Asume que getOrderDetailsByOrderId devuelve un array de objetos OrderDetail
        // Donde cada OrderDetail tiene una propiedad 'order' y una propiedad 'product'
        if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
          // Si la API devuelve un array de orderDetails, tomamos la información de la orden del primer detalle
          const orderData = response.data[0].order;
          setOrder({
            ...orderData,
            orderDetails: response.data, // Guardamos todos los detalles asociados
          });
        } else {
          setError("La orden no se encontró o no tiene detalles asociados.");
        }
      } catch (err) {
        console.error("Error al cargar los detalles de la orden:", err);
        setError("Error de red al cargar la orden. Por favor, intente de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
    window.scrollTo(0, 0);
  }, [orderId]); // Dependencia solo en orderId

  // Estados para el formulario (pre-llenados cuando la orden se carga)
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", address: "", startDate: "", endDate: "", comments: ""
  });

  // Actualizar formData cuando la orden se carga o cambia
  useEffect(() => {
    if (order) {
      setFormData({
        name: order.user?.name || "",
        phone: order.user?.phoneNumber || "",
        email: order.user?.email || "",
        address: order.shippingAddress || "",
        startDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : "",
        endDate: order.estimatedDeliveryDate || "",
        comments: order.comments || ""
      });
    }
  }, [order]);

  // Otros estados para cámara y archivos (sin cambios, puedes mantenerlos si los necesitas)
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Manejador para cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para regresar (siempre al panel de Mis Rentas)
  const handleBack = () => {
    navigate('/user-profile', { state: { view: 'rentas' }, replace: true });
  };

  // Funciones de cámara y archivo (mantengo las que ya tenías)
  const handleOpenCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        setShowCamera(true);
        setCameraPermission(true);
      } catch (err) {
        console.error("Error al acceder a la cámara:", err);
        alert("No se pudo acceder a la cámara. Asegúrate de otorgar permisos.");
        setCameraPermission(false);
      }
    } else {
      alert("Tu navegador no soporta la API de la cámara.");
    }
  };

  const handleCloseCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
    setCameraPermission(false);
  };

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      setIdCardImage(imageDataUrl);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "id_card_photo.png", { type: "image/png" });
          setIdCardFile(file);
        }
      }, 'image/png');
      handleCloseCamera();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdCardImage(reader.result);
          setIdCardFile(file);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Por favor, sube un archivo de imagen (JPG, PNG) o PDF.");
        setIdCardImage(null);
        setIdCardFile(null);
      }
    }
  };

  const handleRemoveImage = () => {
    setIdCardImage(null);
    setIdCardFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpiar el input de tipo file
    }
  };


  // Función para enviar el formulario (actualizar la orden)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Actualizando orden ${orderId}:`, formData);
    // Aquí iría la llamada a tu API para ACTUALIZAR la orden con orderId
    // Por ejemplo: updateOrder(orderId, formData, idCardFile);

    // Después de una actualización exitosa, navega de regreso
    navigate(`/user-profile`, { state: { view: 'rentas', message: "¡Renta actualizada con éxito!" }, replace: true });
  };

  // Función para calcular el costo total
  const calculateTotalCost = () => {
    if (!formData.startDate || !formData.endDate || !product?.price) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio y fin
    const dailyRate = product.price / 20; // Asumiendo que el precio base es por 20 días
    return dailyRate * diffDays;
  };

  // Mostrar estado de carga o error
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex justify-center items-center h-64">
        <LoadingScreen />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-red-600">
        <p>{error}</p>
        <Button onClick={() => navigate('/user-profile', { state: { view: 'rentas' }, replace: true })} className="mt-4">
          Volver a Mis Rentas
        </Button>
      </div>
    );
  }

  // Si la orden se cargó pero no se encontró un producto válido dentro de ella
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-gray-600">
        <p>No se encontró información del producto asociada a esta renta ({orderId}).</p>
        <Button onClick={() => navigate('/user-profile', { state: { view: 'rentas' }, replace: true })} className="mt-4">
          Volver a Mis Rentas
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Botón de regreso */}
      <div className="mb-6">
        <Button
          className="bg-blue-500 rounded-b-2xl hover:bg-white hover:text-blue-500 border-2 border-blue-500 mb-3 cursor-pointer transition-colors duration-500 flex items-center gap-2"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Regresar
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-950">
            Detalles de Renta #{order.id}
          </h1>
          <p className="text-gray-600">
            Revisa y actualiza los detalles de tu renta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Información del producto */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-bold text-gray-700 mb-2">Producto rentado</h3>
            <div className="flex items-center gap-4">
              <img
                src={product.media?.[0]?.url || "/placeholder-product.png"}
                alt={product.name || "Producto"}
                className="w-16 h-16 object-contain"
              />
              <div>
                <p className="font-semibold text-blue-950">{product.name || "Producto seleccionado"}</p>
                <p className="text-sm text-gray-600">{product.brand?.name || "Marca no disponible"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-600">
                    {(product.price / 20).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} / día
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-950">Datos personales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ingrese su nombre completo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required placeholder="Ej. 555-123-4567" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="ejemplo@correo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección de entrega *</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required placeholder="Ingrese su dirección completa" />
              </div>
            </div>
          </div>

          {/* Fechas de renta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-950">Período de renta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de inicio *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required className="pl-10" min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de devolución *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required className="pl-10" min={formData.startDate || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>
            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Costo estimado:</span> {calculateTotalCost().toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  <span className="text-xs ml-1">
                    (por {Math.ceil(Math.abs(new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1} días)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Identificación oficial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-950">Identificación oficial</h3>
            <p className="text-sm text-gray-600">
              Para verificar tu identidad, necesitamos una foto de tu identificación oficial (INE, pasaporte, etc.)
            </p>
            {!idCardImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Subir archivo</p>
                  <p className="text-xs text-gray-500">JPG, PNG o PDF</p>
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleOpenCamera}>
                  <Camera className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Tomar foto</p>
                  <p className="text-xs text-gray-500">Usar cámara del dispositivo</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img src={idCardImage} alt="Identificación" className="w-full max-h-48 object-contain border rounded-md" />
                <button type="button" className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors" onClick={handleRemoveImage}>
                  <X className="h-4 w-4" />
                </button>
                <p className="text-xs text-gray-500 mt-1">{idCardFile?.name || "Imagen capturada"}</p>
              </div>
            )}
            {showCamera && (
              <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <div className="flex justify-between items-center p-4 bg-black text-white">
                  <h3 className="text-lg font-semibold">Tomar foto de identificación</h3>
                  <button type="button" className="text-white p-1 rounded-full hover:bg-gray-800" onClick={handleCloseCamera}>
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="p-4 bg-black flex justify-center">
                  <button type="button" className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center" onClick={handleTakePhoto}>
                    <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center">
                      <div className="bg-white rounded-full w-12 h-12"></div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Comentarios adicionales */}
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios adicionales</Label>
            <Textarea id="comments" name="comments" value={formData.comments} onChange={handleInputChange} placeholder="Información adicional o requerimientos especiales" className="min-h-[100px]" />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleBack}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 gap-2"
            >
              <Check className="h-4 w-4" />
              Guardar cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RentPage;