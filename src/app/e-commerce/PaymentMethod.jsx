import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FiTruck, FiCreditCard, FiCheck, FiArrowLeft, FiMapPin, FiPhone, FiMail, FiUser, FiNavigation } from 'react-icons/fi';
import useLocationStore from "@/stores/useLocationStore";
import { NavCustomer } from "../user/components/molecules/NavCustomer";
import { getCartByUser } from "@/services/customer/shoppingCar";
import { jwtDecode } from "jwt-decode";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import { getUserById } from "@/services/admin/userService";
import { FaWhatsappSquare } from "react-icons/fa";
import { ArrowLeft } from 'lucide-react'
import { createOrder } from "@/services/public/orderService";
import { createOrderDetail } from "@/services/admin/orderDetailService";
import { removeProductFromCart } from "@/services/customer/shoppingCar";
import { useCartStore } from "@/stores/useCartStore";


const steps = [
    { id: 1, title: 'Información de Envío', icon: FiTruck },
    { id: 2, title: 'Método de Pago', icon: FiCreditCard },
    { id: 3, title: 'Confirmación', icon: FiCheck },
];

export default function PaymentMethod() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setLocation } = useLocationStore();

    // Estados principales
    const [step, setStep] = useState(0); // 0: envío, 1: pago, 2: confirmación
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'México',
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [paymentMethod, setPaymentMethod] = useState('transferencia');
    const [selectedBranch, setSelectedBranch] = useState("jiutepec");
    const branches = {
        jiutepec: {
            label: "Jiutepec",
            address: "Blvd. Paseo Cuauhnáhuac Jiutepec, Mor."
        },
        cuautla: {
            label: "Cuautla",
            address: "Carr Federal México-Cuautla Cuautla, Mor."
        }
    };

    // Carrito y usuario
    const [cartProducts, setCartProducts] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [cartError, setCartError] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [currentCartOrderId, setCurrentCartOrderId] = useState(null); // Si tu backend lo provee

    // Handler para campos controlados
    const handleShippingInputChange = (field, value) => {
        setShippingAddress((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Geolocalización
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error('La geolocalización no está disponible en este navegador');
            return;
        }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es`
                    );
                    if (!response.ok) throw new Error('Error al obtener la dirección');
                    const data = await response.json();
                    if (data.address) {
                        const address = data.address;
                        let direccion = '';
                        if (address.road || address.house_number || address.neighbourhood || address.suburb) {
                            direccion = [
                                address.road || '',
                                address.house_number || '',
                                address.neighbourhood || address.suburb || address.colony || ''
                            ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
                        } else if (address.city) {
                            direccion = address.city;
                            toast.warning('No se pudo obtener la calle y número, por favor complétalos manualmente.');
                        } else {
                            direccion = '';
                            toast.warning('No se pudo obtener la calle y número, por favor complétalos manualmente.');
                        }
                        setShippingAddress(prev => ({
                            ...prev,
                            address: direccion,
                            city: address.city || address.town || address.village || '',
                            state: address.state || '',
                            zipCode: address.postcode || '',
                            country: address.country || 'México'
                        }));
                        toast.success('Ubicación obtenida exitosamente');
                    } else {
                        toast.error('No se pudo obtener la dirección completa');
                    }
                } catch (error) {
                    console.error('Error al obtener la dirección:', error);
                    toast.error('Error al obtener la dirección. Intenta llenar manualmente.');
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Permiso denegado para acceder a la ubicación');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Información de ubicación no disponible');
                        break;
                    case error.TIMEOUT:
                        toast.error('Tiempo de espera agotado para obtener la ubicación');
                        break;
                    default:
                        toast.error('Error al obtener la ubicación');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // Validación básica
    const validateShipping = () => {
        const { name, lastName, email, phoneNumber, address, city, state, zipCode } = shippingAddress;
        if (!name || !lastName || !email || !phoneNumber || !address || !city || !state || !zipCode) {
            toast.error('Por favor completa todos los campos');
            return false;
        }
        return true;
    };

    // Navegación entre pasos
    const nextStep = () => {
        if (step === 0 && !validateShipping()) return;
        setStep((s) => Math.min(s + 1, steps.length - 1));
    };
    const prevStep = () => setStep((s) => Math.max(s - 1, 0));

    // Guardar dirección global al avanzar
    useEffect(() => {
        if (step === 1) {
            setLocation(`${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.zipCode}, ${shippingAddress.country}`);
        }
    }, [step]);

    // Obtener currentUserId y currentCartOrderId
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = jwtDecode(token);
            setCurrentUserId(decoded.sub);
            // Si tu backend te da el orderId, puedes setearlo aquí
            // setCurrentCartOrderId(decoded.cartOrderId) o similar
        }
    }, []);

    // Obtener productos del carrito
    useEffect(() => {
        if (!currentUserId) return;
        setCartLoading(true);
        setCartError(null);
        getCartByUser(currentUserId)
            .then(data => {
                setCartProducts(Array.isArray(data?.data) ? data.data : []);
                // Si la respuesta trae el orderId, setCurrentCartOrderId(data.orderId)
            })
            .catch(err => {
                setCartProducts([]);
                setCartError(err.message || "Error al cargar el carrito");
            })
            .finally(() => setCartLoading(false));
    }, [currentUserId]);

    // Prefill shipping form with user data
    useEffect(() => {
        if (!currentUserId) return;
        getUserById(currentUserId)
            .then(user => {
                if (!user) return;
                setShippingAddress(prev => ({
                    ...prev,
                    name: prev.name || user.name || '',
                    lastName: prev.lastName || user.lastName || '',
                    email: prev.email || user.email || '',
                    phoneNumber: prev.phoneNumber || user.phoneNumber || '',
                    address: prev.address || user.address || '',
                    city: prev.city || user.city || '',
                    state: prev.state || user.state || '',
                    zipCode: prev.zipCode || user.zipCode || '',
                    country: prev.country || user.country || '',
                }));
            })
            .catch(() => { });
    }, [currentUserId]);

    // Render
    const [orderCompleted, setOrderCompleted] = useState(false); // Nuevo estado
    const [orderCompletedBranch, setOrderCompletedBranch] = useState(null); // Para mostrar sucursal
    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 py-0 pt-20 w-full">
                {/* Navbar personalizado con currentUserId y currentCartOrderId */}
                <NavCustomer currentUserId={currentUserId} currentCartOrderId={currentCartOrderId} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
                    {/* Progress Steps */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between relative">
                        {/* Botón volver */}
                        <button
                            onClick={() => navigate('/user-profile', { state: { view: 'carrito' } })}
                            className="mt-4 sm:mt-0 sm:ml-6 px-2 py-1 hover:bg-stone-200 rounded-full flex items-center justify-center absolute top-1 left-0 cursor-pointer shadow-md"
                            aria-label="Volver al perfil"
                        >
                            <ArrowLeft size={18} className="text-gray-600" />
                        </button>
                        {/* Stepper: solo el paso actual en móvil, todos en desktop */}
                        <div className="flex items-center justify-center flex-1">
                            <div className="block sm:hidden w-full">
                                <div className="flex items-center justify-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 bg-blue-600 border-blue-600 text-white`}>
                                        {steps[step].icon && React.createElement(steps[step].icon, { className: 'w-5 h-5' })}
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-blue-600">{steps[step].title}</span>
                                </div>
                            </div>
                            <div className="hidden sm:flex items-center justify-center flex-1">
                                {steps.map((stepObj, index) => (
                                    <React.Fragment key={stepObj.id}>
                                        <div className="flex items-center">
                                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${index <= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                                                {index < step ? <FiCheck className="w-5 h-5" /> : <stepObj.icon className="w-5 h-5" />}
                                            </div>
                                            <span className={`ml-2 text-sm font-medium ${index <= step ? 'text-blue-600' : 'text-gray-400'}`}>{stepObj.title}</span>
                                        </div>
                                        {index < steps.length - 1 && <div className={`w-16 h-0.5 mx-4 ${index < step ? 'bg-blue-600' : 'bg-gray-300'}`} />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Summary Sidebar */}
                        <div className="order-2 lg:order-2 lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
                                <div className="space-y-3 mb-4 overflow-y-scroll h-[200px]">
                                    {cartLoading ? (
                                        <div className="text-gray-500">Cargando productos del carrito...</div>
                                    ) : cartError ? (
                                        <div className="text-red-500">{cartError}</div>
                                    ) : !cartProducts.length ? (
                                        <div className="text-gray-500">No hay productos en el carrito.</div>
                                    ) : (
                                        cartProducts.map((item, idx) => {
                                            const product = item.product || item;
                                            const qty = item.quantity;
                                            const price = product.price || 0;
                                            const total = price * qty;
                                            const key = item.id || product.id || idx;
                                            return (
                                                <div key={key} className="flex items-center space-x-3">
                                                    <img src={product?.media?.[0]?.url || "/placeholder-product.png"} alt={product?.name} className="w-12 h-12 object-contain rounded" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="lg:text-sm text-md font-medium truncate w-[80%]">{product.name}</div>
                                                        <div className="lg:text-xs text-sm text-gray-500">Cantidad: {qty}</div>
                                                    </div>
                                                    <div className="lg:text-sm text-md font-bold">${total.toLocaleString()}</div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                                {/* Totales */}
                                {cartProducts.length > 0 && (
                                    (() => {
                                        let subtotal = cartProducts.reduce((sum, item) => {
                                            const product = item.product || item;
                                            const qty = item.quantity;
                                            const price = product.price || 0;
                                            return sum + price * qty;
                                        }, 0);
                                        let shipping = 50;
                                        let iva = Math.round(subtotal * 0.16);
                                        let total = subtotal + shipping + iva;
                                        return (
                                            <div className="border-t pt-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Subtotal</span>
                                                    <span>${subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Envío</span>
                                                    <span>${shipping.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>IVA (16%)</span>
                                                    <span>${iva.toLocaleString()}</span>
                                                </div>
                                                <div className="border-t pt-5 flex justify-between font-bold text-xl">
                                                    <span>Total</span>
                                                    <span>${total.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </div>
                        {/* Main Content */}
                        <div className="order-2 lg:order-none lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {/* Step 1: Shipping Information */}
                                {step === 0 && (
                                    <form onSubmit={e => { e.preventDefault(); nextStep(); }}>
                                        <h2 className="text-2xl font-semibold mb-0 pb-4">Información de Envío</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FiUser className="inline mr-1" />
                                                    Nombre
                                                </label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.name} onChange={e => handleShippingInputChange('name', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.lastName} onChange={e => handleShippingInputChange('lastName', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FiMail className="inline mr-1" />
                                                    Correo
                                                </label>
                                                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.email} onChange={e => handleShippingInputChange('email', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    <FiPhone className="inline mr-1" />
                                                    Teléfono
                                                </label>
                                                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.phoneNumber} onChange={e => handleShippingInputChange('phoneNumber', e.target.value)} required />
                                            </div>
                                            <div className="md:col-span-2 mt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        <FiMapPin className="inline mr-1" />
                                                        Dirección
                                                    </label>
                                                    <button type="button" onClick={getCurrentLocation} disabled={isGettingLocation} className="flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed">
                                                        <FiNavigation className="w-4 h-4 mr-1" />Usar ubicación actual
                                                        {isGettingLocation && <span className="ml-1 animate-spin">⏳</span>}
                                                    </button>
                                                </div>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" placeholder="Calle, número, colonia" value={shippingAddress.address} onChange={e => handleShippingInputChange('address', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.city} onChange={e => handleShippingInputChange('city', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.state} onChange={e => handleShippingInputChange('state', e.target.value)} required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
                                                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.zipCode} onChange={e => handleShippingInputChange('zipCode', e.target.value)} required />
                                            </div>
                                            {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent" value={shippingAddress.country} onChange={e => handleShippingInputChange('country', e.target.value)}>
                        <option value="México">México</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
                      </select>
                    </div> */}
                                        </div>
                                        {/* <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Método de Envío</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="shippingMethod" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="mr-3" />
                        <div className="flex-1">
                          <div className="font-medium">Envío Estándar</div>
                          <div className="text-sm text-gray-600">5-7 días hábiles</div>
                        </div>
                        <div className="font-medium">$50.00</div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="shippingMethod" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="mr-3" />
                        <div className="flex-1">
                          <div className="font-medium">Envío Express</div>
                          <div className="text-sm text-gray-600">2-3 días hábiles</div>
                        </div>
                        <div className="font-medium">$150.00</div>
                      </label>
                    </div>
                  </div> */}
                                        <div className="flex justify-between mt-8">
                                            <button
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={() => navigate('/user-profile', { state: { view: 'carrito' } })}>
                                                Salir
                                            </button>
                                            <button type="submit"
                                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-white hover:text-blue-600 hover:border-blue-600 border-2 border-blue-600 transition-colors duration-600 ml-auto cursor-pointer">
                                                Siguiente
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {/* Step 2: Payment Method */}
                                {step === 1 && (
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-6">Método de Pago</h2>
                                        <div className="space-y-3">
                                            {/* Opción Transferencia Bancaria */}
                                            <label
                                                className={`flex items-center p-3 border rounded-md cursor-pointer transition-all duration-200 ${paymentMethod === 'transferencia'
                                                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' // Estilos cuando está seleccionado
                                                    : 'border-gray-300 hover:bg-gray-50' // Estilos por defecto/hover
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="transferencia"
                                                    checked={paymentMethod === 'transferencia'}
                                                    onChange={() => setPaymentMethod('transferencia')}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">Transferencia Bancaria</div>
                                                    <div className="text-sm text-gray-600">
                                                        Paga mediante transferencia bancaria
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Opción Pago en Efectivo */}
                                            <label
                                                className={`flex items-center p-3 border rounded-md cursor-pointer transition-all duration-200 ${paymentMethod === 'efectivo'
                                                    ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' // Estilos cuando está seleccionado
                                                    : 'border-gray-300 hover:bg-gray-50' // Estilos por defecto/hover
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value="efectivo"
                                                    checked={paymentMethod === 'efectivo'}
                                                    onChange={() => setPaymentMethod('efectivo')}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">Pago en Efectivo</div>
                                                    <div className="text-sm text-gray-600">
                                                        Paga en sucursal al recoger tu pedido
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        {step === 1 && paymentMethod === 'efectivo' && (
                                            <div className="mt-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Selecciona sucursal para recoger:
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    value={selectedBranch}
                                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                                >
                                                    {Object.entries(branches).map(([key, branch]) => (
                                                        <option key={key} value={key}>
                                                            {branch.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex justify-between mt-8">
                                            <button
                                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                                                onClick={prevStep}
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-white hover:text-blue-600 hover:border-blue-600 border-2 border-blue-600 transition-colors duration-600 ml-auto cursor-pointer"
                                                onClick={nextStep}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {/* Step 3: Confirmación */}
                                {step === 2 && !orderCompleted && (
                                    <div>
                                        <h2 className="text-2xl font-semibold mb-6">Confirmación</h2>
                                        <div className="mb-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="font-medium lg:text-lg text-xl text-blue-800 mb-2 ">Dirección de Envío</div>
                                                <div className="text-gray-700">{shippingAddress.name} {shippingAddress.lastName}</div>
                                                <div className="text-gray-700">{shippingAddress.email}</div>
                                                <div className="text-gray-700">{shippingAddress.phoneNumber}</div>
                                                <div className="text-gray-700">{shippingAddress.address}</div>
                                                <div className="text-gray-700">{shippingAddress.city}, {shippingAddress.state}, {shippingAddress.zipCode}, {shippingAddress.country}</div>
                                            </div>
                                        </div>
                                        {step === 2 && paymentMethod === "efectivo" && (
                                            <div className="bg-indigo-100 p-4 rounded-lg flex flex-col md:flex-row gap-0 items-center md:items-stretch">
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="font-medium lg:text-lg text-xl text-indigo-800 mb-2">Verifica tus datos</div>
                                                    <div className="text-gray-700">
                                                        <b>Antes de realizar el pedido, verifica tus datos para evitar errores...</b>
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex justify-center items-center">
                                                    <img src="/Tipografia_Completa_LIBAMAQ.png" alt="Liba" className="lg:w-2/3 md:w-full w-1/2" />
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && paymentMethod === 'transferencia' && (
                                            <div className="">
                                                <div className="bg-indigo-100 p-4 rounded-lg flex flex-col md:flex-row gap-0 items-center md:items-stretch">
                                                    <div className="flex-1 flex flex-col justify-center">
                                                        <div className="font-medium lg:text-lg text-xl text-indigo-800 mb-2">Verifica tus datos</div>
                                                        <div className="text-gray-700">
                                                            <b>Antes de realizar el pedido, verifica tus datos para evitar errores al realizar la transferencia...</b>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 flex justify-center items-center">
                                                        <img src="/Tipografia_Completa_LIBAMAQ.png" alt="Liba" className="lg:w-2/3 md:w-full w-1/2" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex justify-between mt-8">
                                            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer" onClick={prevStep}>Anterior</button>
                                            <button
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-white hover:text-indigo-600 hover:border-indigo-600 border-2 border-indigo-600 transition-colors duration-600 ml-auto cursor-pointer"
                                                onClick={async () => {
                                                    try {
                                                        // 1. Crear la orden principal
                                                        const orderPayload = {
                                                            userId: Number(currentUserId),
                                                            type: 'PURCHASE', // Usar PURCHASE como tipo válido
                                                            paymentMethod: paymentMethod === 'transferencia' ? 'BANK_TRANSFER' : 'CASH', // Usar los valores del enum del backend
                                                            shippingGuide: 'PENDIENTE',
                                                            shippingStatus: 'PENDING',
                                                            estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días después
                                                            ...(paymentMethod === 'efectivo' && { branch: selectedBranch }), // solo incluir branch si es efectivo
                                                            total: cartProducts.reduce((sum, item) => {
                                                                const product = item.product || item;
                                                                const qty = item.quantity;
                                                                const price = product.price || 0;
                                                                return sum + price * qty;
                                                            }, 0) + 50 + Math.round(cartProducts.reduce((sum, item) => {
                                                                const product = item.product || item;
                                                                const qty = item.quantity;
                                                                const price = product.price || 0;
                                                                return sum + price * qty;
                                                            }, 0) * 0.16)
                                                        };
                                                        console.log('Payload que se enviará:', JSON.stringify(orderPayload, null, 2));
                                                        const orderRes = await createOrder(orderPayload);
                                                        console.log('Respuesta del servidor:', orderRes);

                                                        // Verificar si la respuesta indica éxito o error
                                                        if (orderRes?.data?.success === false) {
                                                            throw new Error(orderRes.data.error || 'Error al crear la orden');
                                                        }

                                                        const orderId = orderRes?.data?.data?.id;
                                                        if (!orderId) throw new Error('No se pudo obtener el ID de la orden creada');
                                                        // 2. Crear los detalles de la orden (productos)
                                                        for (const item of cartProducts) {
                                                            const unitPrice = Number(item.product?.price || item.price || 0);
                                                            const quantity = Number(item.quantity);
                                                            const discount = 0;
                                                            await createOrderDetail({
                                                                orderId: Number(orderId),
                                                                productId: Number(item.product?.id || item.id),
                                                                quantity,
                                                                unitPrice,
                                                                discount,
                                                                total: unitPrice * quantity - discount
                                                            });
                                                        }
                                                        // 3. Vaciar el carrito (eliminar cada producto)
                                                        for (const item of cartProducts) {
                                                            try {
                                                                await removeProductFromCart(item.id);
                                                            } catch (e) {
                                                                // Si falla uno, sigue con los demás
                                                                console.error('Error al eliminar producto del carrito:', e);
                                                            }
                                                        }
                                                        // 4. Refrescar el contador del carrito
                                                        if (typeof useCartStore.getState === 'function') {
                                                            await useCartStore.getState().refreshCart();
                                                        }
                                                        if (paymentMethod === 'efectivo') {
                                                            setOrderCompleted(true);
                                                            setOrderCompletedBranch(selectedBranch);
                                                            navigate('/user-profile', { state: { view: 'compras' } });
                                                        } else {
                                                            toast.success('¡Pedido realizado con éxito!');
                                                            navigate('/user-profile', { state: { view: 'compras' } });
                                                        }
                                                    } catch (err) {
                                                        console.error('Error completo:', err);
                                                        console.error('Respuesta del servidor:', err.response?.data);
                                                        console.error('Status:', err.response?.status);

                                                        // Mostrar mensaje de error más específico
                                                        let errorMessage = 'Error al crear el pedido';
                                                        if (err?.message) {
                                                            errorMessage += ': ' + err.message;
                                                        } else if (err?.response?.data?.error) {
                                                            errorMessage += ': ' + err.response.data.error;
                                                        }

                                                        toast.error(errorMessage);
                                                    }
                                                }}
                                            >
                                                Realizar pedido
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    // Estilos por defecto para todos los toasts
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    // Estilos específicos para toasts de éxito
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    // Estilos específicos para toasts de error
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </SidebarProvider>
    );
} 