import React, { useEffect, useRef, useState } from "react";
import { X, ArrowRight, Upload, Camera } from 'lucide-react';
import toast, { Toaster } from "react-hot-toast";
import { getOrderDetailsByOrderId } from '@/services/admin/orderDetailService';
import { jwtDecode } from 'jwt-decode';

const STATUS_FLOW = [
    'PENDIENTE',
    'EN REVISION',
    'EN CURSO',
    'ENTREGADO'
];

export default function CardsDetail({ selected }) {
    const [details, setDetails] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [localStatus, setLocalStatus] = useState((selected.status || 'PENDIENTE').toUpperCase());

    // Referencia al elemento <animated-icons>
    const animatedIconRef = useRef(null);

    // ***************************************************************
    // DECLARA animatedIconAttrs AQUÍ, FUERA DE CUALQUIER CONDICIONAL
    // ***************************************************************
    const animatedIconAttrs = {
        variationThumbColour: "#536DFE",
        variationName: "Two Tone",
        variationNumber: 2,
        numberOfGroups: 2,
        backgroundIsGroup: false,
        strokeWidth: 1,
        defaultColours: {
            "group-1": "#000000",
            "group-2": "#215DFCFF",
            background: "#FFFFFF"
        },
    };



    useEffect(() => {
        setLocalStatus((selected.status || 'PENDIENTE').toUpperCase());
    }, [selected.id, selected.status]);

    const [transferImage, setTransferImage] = useState(null);
    const [transferFile, setTransferFile] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const fileInputRef = React.useRef(null);

    const detail = details[0];

    const status = localStatus;
    let statusLabel = 'Pendiente';
    let statusColor = 'text-yellow-500';
    if (status === 'EN REVISION') {
        statusLabel = 'En revisión';
        statusColor = 'text-blue-500';
    } else if (status === 'EN CURSO') {
        statusLabel = 'En curso';
        statusColor = 'text-orange-500';
    } else if (status === 'ENTREGADO') {
        statusLabel = 'Entregado';
        statusColor = 'text-green-600';
    }

    const handleDelete = async () => {
        if (!detail) return;
        setDeleting(true);
        try {
            toast.success('Producto eliminado correctamente');
            setTimeout(() => setDeleting(false), 500);
        } catch (err) {
            toast.error('Error al eliminar el producto: ' + (err?.message || err));
            setDeleting(false);
        }
    };

    const handleNextStatus = () => {
        const idx = STATUS_FLOW.indexOf(localStatus);
        const next = STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
        setLocalStatus(next);
    };

    const handleInitiatePayment = () => {
        setLocalStatus('PENDIENTE');
        toast.success('Se ha iniciado el proceso de pago. Estado: PENDIENTE');
    };

    const handleTransferFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTransferFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setTransferImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveTransferImage = () => {
        setTransferImage(null);
        setTransferFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleOpenCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowCamera(true);
            }
        } catch (err) {
            toast.error("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
        }
    };
    const handleCloseCamera = () => {
        setShowCamera(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };
    const handleTakePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext("2d");
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            const imageData = canvasRef.current.toDataURL("image/png");
            setTransferImage(imageData);
            setTransferFile(null);
            handleCloseCamera();
        }
    };

    useEffect(() => {
        async function fetchOrderDetails() {
            setLoading(true);
            setError(null);
            try {
                const res = await getOrderDetailsByOrderId(selected.id);
                setDetails(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                setError(err.message || 'Error al cargar los productos del pedido');
            } finally {
                setLoading(false);
            }
        }
        fetchOrderDetails();
    }, [selected.id]);

    // Efecto para aplicar los atributos cuando el componente se monta o los atributos cambian
    useEffect(() => {
        // Asegúrate de que el estado que controla la visibilidad del icono (e.g., status)
        // se actualice antes de que este efecto se ejecute, o maneja la lógica aquí.
        if (animatedIconRef.current && status === 'EN REVISION') { // Condición para aplicar solo cuando el icono es visible
            // Convierte el objeto JavaScript a una cadena JSON
            const attrsJsonString = JSON.stringify(animatedIconAttrs);

            // Usa setAttribute para establecer la propiedad 'attributes' del Web Component
            animatedIconRef.current.setAttribute('attributes', attrsJsonString);
        }
    }, [status]);

    return (
        <div className="max-w-6xl mx-auto px-4 grid gap-6 grid-cols-1 md:grid-cols-3">
            {/* 1) Cabecera */}
            {status === 'EN CURSO' ? (
                <div className="bg-white rounded-2xl shadow p-6 md:col-span-2 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-md font-semibold text-orange-500">En curso</span>
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Siguiente estado"
                            onClick={handleNextStatus}
                        >
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                        ¡Buenas noticias! Tu pedido está en camino y te lo entregaremos pronto...
                    </h3>
                    <div className="text-gray-700 mb-1">
                        Entregaremos tu paquete en <b>Carr Federal México-Cuautla Cuautla, Mor.</b>
                    </div>
                </div>
            ) : status === 'ENTREGADO' ? (
                <div className="bg-white rounded-2xl shadow p-6 md:col-span-2 relative">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-md font-semibold ${statusColor}`}>{statusLabel}</span>
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Siguiente estado"
                            onClick={handleNextStatus}
                        >
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-1">
                        Llegó el {selected.estimatedDeliveryDate ? new Date(selected.estimatedDeliveryDate).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : '10 de mayo, 2025'}
                    </h3>
                    <div className="text-gray-700 mb-1">
                        Entregamos tu paquete en <b>{selected.shippingAddress || 'Carr Federal México-Cuautla Cuautla, Mor.'}</b>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow p-6 md:col-span-2 relative">
                    <div className="flex items-center gap-2">
                        <span className={`text-md font-medium ${statusColor}`}>{statusLabel}</span>
                        <button
                            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Siguiente estado"
                            onClick={handleNextStatus}
                        >
                            <ArrowRight className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-gray-800 flex items-center justify-between">
                        <span>
                            Fecha que se realizó el pedido: {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : 'Sin fecha'}
                        </span>
                    </h3>
                    <p className=" text-gray-700">
                        <strong>ID del pedido:</strong> {selected.id}
                    </p>
                </div>
            )}

            {/* 2) Detalle del producto o mensaje según estado */}
            <div className="bg-white rounded-2xl shadow p-6 md:col-span-2 flex flex-col">
                {loading ? (
                    <p className="text-gray-500">Cargando producto…</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : status === 'EN REVISION' ? (
                    <div className="flex flex-col items-center justify-center flex-grow">
                        <h2 className="text-xl font-semibold text-blue-600">El pedido está en revisión</h2>
                        <p className="text-gray-500 mt-2">En breve te notificaremos el avance de tu pedido.</p>

                        {/* Aquí insertas el Web Component <animated-icons> */}
                        <animated-icons
                            ref={animatedIconRef}
                            src="https://animatedicons.co/get-icon?name=Order%20History&style=minimalistic&token=c80ddd83-3d22-40c2-8da3-e8459337e6c4"
                            trigger="loop"
                            height="200"
                            width="200"
                        ></animated-icons>
                    </div>
                ) : status === 'PENDIENTE' ? (
                    <div className="w-full flex-grow">
                        <div className="flex flex-col md:flex-row gap-0 items-center md:items-stretch h-full">
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="font-medium lg:text-x1 text-xl text-indigo-800 mb-2">Datos para Transferencia Bancaria</div>
                                <div className="text-gray-700"><b>LIBAMAQ HERRAMIENTAS S DE RL. de CV.</b></div>
                                <div className="text-gray-700">RFC: <b className="select-all">LHE2311286G3</b></div>
                                <div className="text-gray-700">Número de cuenta: <b className="select-all">0122268418</b></div>
                                <div className="text-gray-700">CLABE interbancaria: <b className="select-all">012542001222684186</b></div>
                                <div className="text-gray-700">Banco: <b>BANCOMER</b></div>
                                <div className="mt-4 text-gray-700 text-lg lg:text-base font-semibold flex items-center gap-2 flex-col lg:flex-row leading-2 lg:leading-4">Enviar ficha de transferencia al:
                                    <b className="text-green-700">777 111 8924</b>
                                </div>
                            </div>
                            <div className="flex-1 flex justify-center items-center">
                                <img src="/Tipografia_Completa_LIBAMAQ.png" alt="Liba" className="lg:w-4/4 md:w-full w-1/1" />
                            </div>
                        </div>
                    </div>
                ) : details && details.length > 0 ? (
                    <div className="flex flex-col gap-6 overflow-y-scroll h-[330px]">
                        {details.map((item) => {
                            const product = item.product;
                            return (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                                        {product?.media && product.media.length > 0 ? (
                                            <img src={product.media[0].url} alt={product.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <span className="text-gray-400">Sin imagen</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-800">{product?.name}</h2>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product?.description}</p>
                                        <div className="mt-2 flex flex-wrap gap-4 items-center">
                                            <span className="text-base font-bold text-indigo-700">${product?.price?.toLocaleString('es-MX')}</span>
                                            <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">No hay producto en este pedido.</p>
                )}
            </div>

            {/* 3) Resumen de compra o sección de pago/transferencia */}
            {status === 'EN CURSO' && (
                <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center mb-25 lg:mb-0 w-full h-[320px] justify-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Rastrear pedido</h2>
                    <hr className="w-full mb-4" />
                    <p className="text-center text-gray-700 mb-4 text-sm">Copia el siguiente enlace y pégalo en tu buscador para seguir su pedido</p>
                    <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col items-center w-full max-w-xl shadow">
                        <a
                            href="https://google-enlace-pedido.com/pedido-id-001"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline text-black text-center break-all mb-4"
                            style={{ wordBreak: 'break-all' }}>
                            https://google-enlace-pedido.com/pedido-id-001
                        </a>
                        <button
                            className="px-6 py-2 w-full lg:w-auto mt-3 lg:mt-0 bg-indigo-600 text-white rounded-md hover:bg-white hover:text-indigo-600 hover:border-indigo-600 border-2 border-indigo-600 transition-colors duration-600 cursor-pointer lg:text-sm"
                            onClick={() => {
                                navigator.clipboard.writeText('https://google-enlace-pedido.com/pedido-id-001');
                            }}
                        >
                            Copiar enlace
                        </button>
                    </div>
                </div>
            )}
            {status === 'ENTREGADO' && (
                <div className="bg-white rounded-2xl shadow px-6 py-6 flex flex-col mb-25 lg:mb-0 w-full h-[375px]">
                    <div className="w-full flex flex-col h-full">
                        <div className="font-semibold text-xl mb-4">Detalle de la compra</div>
                        <>
                            <div className="border-b border-gray-400 pb-0 space-y-2 overflow-y-auto">
                                {details.map((item) => {
                                    const prod = item.product;
                                    return (
                                        <div key={item.id} className="flex justify-between gap-8 mb-2 text-gray-700">
                                            <span className="flex items-center gap-0">
                                                <span className="w-[9em] line-clamp-1">{prod?.name || 'Producto'}</span>
                                                x <span className="">{item.quantity}</span>
                                            </span>
                                            <span className="text-start w-full">
                                                ${((prod?.price || 0) * (item.quantity || 1)).toLocaleString("es-MX")}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3 text-lg font-bold pt-6 lg:mb-0 mt-auto">
                                <span>Total:</span>
                                <span>
                                    $
                                    {details.reduce((sum, item) => {
                                        const prod = item.product;
                                        return sum + (prod?.price || 0) * (item.quantity || 1);
                                    }, 0).toLocaleString("es-MX")}
                                </span>
                            </div>
                            <div className="text-gray-700 text-sm">
                                Método de Pago: <b>Transferencia</b>
                            </div>
                        </>
                    </div>
                </div>
            )}
            {/* 3) Sección de "Resumen de la Orden" (tercer div) */}
            {status === 'EN REVISION' || (status !== 'PENDIENTE' && status !== 'EN CURSO' && status !== 'ENTREGADO') ? (
                <div className="bg-white rounded-2xl shadow px-6 space-y-10 flex flex-col mb-25 lg:mb-0 items-center w-full h-[320px] justify-center">
                    <h2 className="text-xl font-bold text-gray-800 my-4">Resumen de la Orden</h2>
                    <hr className="w-full mb-4" />
                    <p className="text-center text-gray-700 mb-4 text-sm">
                        Aquí puedes revisar los detalles de tu pedido.
                    </p>
                    <div className="w-full">
                        <div className="flex gap-3 text-lg font-bold pt-2 lg:mb-0 mt-auto">
                            <span>Total a pagar:</span>
                            <span>
                                $
                                {details.reduce((sum, item) => {
                                    const prod = item.product;
                                    return sum + (prod?.price || 0) * (item.quantity || 1);
                                }, 0).toLocaleString("es-MX")}
                            </span>
                        </div>
                        <div className="text-gray-700 text-sm mb-4">
                            Método de Pago: <b>Transferencia Bancaria</b>
                        </div>
                    </div>

                    {status !== 'EN REVISION' && status !== 'PENDIENTE' && (
                        <div className="mb-6">
                            <button
                                className="px-4 py-2 w-full lg:w-auto bg-indigo-600 text-white rounded-md hover:bg-white hover:text-indigo-600 hover:border-indigo-600 border-2 border-indigo-600 transition-colors duration-600 cursor-pointer text-sm font-semibold"
                                onClick={handleInitiatePayment}
                            >
                                Realizar Pago
                            </button>
                        </div>

                    )}
                </div>
            ) : null /* Si es 'PENDIENTE', 'EN CURSO', 'ENTREGADO', no se muestra esta sección */}

            {/* Contenido para subir imagen de transferencia, solo si el estado es PENDIENTE */}
            {status === 'PENDIENTE' && (
                <div className="bg-white rounded-2xl shadow p-6 space-y-4 flex flex-col mb-25 lg:mb-0 items-center w-full justify-center">
                    <h3 className="text-lg font-semibold mb-4">Subir comprobante de pago</h3>
                    {!transferImage ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">Subir archivo</p>
                                <p className="text-xs text-gray-500">JPG, PNG o PDF</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="hidden"
                                    onChange={handleTransferFileUpload}
                                />
                            </div>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={handleOpenCamera}>
                                <Camera className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">Tomar foto</p>
                                <p className="text-xs text-gray-500">Usar cámara del dispositivo</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative mt-4 flex flex-col items-center w-full">
                            <div className="w-[100%] max-w-sm">
                                <img
                                    src={transferImage}
                                    alt="Transferencia"
                                    className="w-full max-h-40 object-contain border rounded-md"
                                />
                                <button
                                    type="button"
                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    onClick={handleRemoveTransferImage}
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                <p className="text-xs text-gray-500 mt-1 text-center">
                                    {transferFile?.name || "Imagen capturada"}
                                </p>
                            </div>
                            <div className="flex justify-center mt-4 w-full">
                                <button
                                    className="px-4 py-2 w-full lg:w-auto bg-indigo-600 text-white rounded-md hover:bg-white hover:text-indigo-600 hover:border-indigo-600 border-2 border-indigo-600 transition-colors duration-600 cursor-pointer text-sm font-semibold"
                                    onClick={() => {
                                        if (transferImage) {
                                            setLocalStatus('EN REVISION');
                                            toast.success('Comprobante de pago enviado. El pedido está en revisión.');
                                        } else {
                                            toast.error('Por favor, sube una imagen de la transferencia primero.');
                                        }
                                    }}
                                >
                                    Enviar imagen
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Cámara */}
                    {showCamera && (
                        <div className="fixed inset-0 bg-black z-50 flex flex-col">
                            <div className="flex justify-between items-center p-4 bg-black text-white">
                                <h3 className="text-lg font-semibold">Tomar foto de transferencia</h3>
                                <button
                                    type="button"
                                    className="text-white p-1 rounded-full hover:bg-gray-800"
                                    onClick={handleCloseCamera}
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="flex-1 relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" width={640} height={480} />
                            </div>
                            <div className="p-4 bg-black flex justify-center">
                                <button
                                    type="button"
                                    className="bg-white text-black rounded-full w-16 h-16 flex items-center justify-center"
                                    onClick={handleTakePhoto}
                                >
                                    <div className="bg-black rounded-full w-14 h-14 flex items-center justify-center">
                                        <div className="bg-white rounded-full w-12 h-12"></div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
            <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}