import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiTrash2 } from "react-icons/fi";
import NumberStepper from "@/components/ui/NumberStepper";
import { CreditCard, ShoppingCart } from "lucide-react"; // Importa ShoppingCart para el estado vacío
import { FaRegEye } from "react-icons/fa6";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; // Para notificaciones al usuario

// Importa tus servicios de API
// ASEGÚRATE DE QUE LA RUTA SEA CORRECTA PARA TU PROYECTO
import {
  getOrderById, // Asume que esta función trae la orden con sus orderDetails anidados
  deleteOrderDetail, // Asume que esta función elimina un orderDetail específico
} from "@/services/public/orderService"; // Ajusta esta ruta a la de tu archivo de servicios

// El componente CarPanel ahora aceptará currentCartOrderId y currentUserId como props.
// Esto asume que un componente padre le pasa el ID del carrito activo del usuario.
export default function CarPanel({ currentCartOrderId, currentUserId }) {
  const navigate = useNavigate();

  // Estado para los productos del carrito (que serán los 'orderDetails' de la orden)
  const [cartProducts, setCartProducts] = useState([]);
  // 'quantities' ahora mapea 'orderDetail.id' a la cantidad.
  // Es útil si permites cambiar la cantidad desde el carrito sin actualizar el backend inmediatamente.
  const [quantities, setQuantities] = useState({});
  // 'selected' ahora mapea 'orderDetail.id' al estado de selección (true/false).
  const [selected, setSelected] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // --- Función para cargar los detalles del carrito ---
  const fetchCartDetails = async () => {
    // Si no hay un ID de carrito, no podemos buscar nada.
    // Establecemos isLoadingCart a false y limpiamos los estados.
    if (!currentCartOrderId) {
      console.log("No hay ID de carrito disponible. No se pueden cargar los detalles del carrito.");
      setIsLoadingCart(false);
      setCartProducts([]);
      setQuantities({});
      setSelected({});
      return;
    }

    setIsLoadingCart(true); // Indicamos que la carga ha comenzado
    try {
      // Llamamos a la API para obtener la orden por su ID.
      // Se espera que la respuesta incluya los 'orderDetails' y, dentro de ellos,
      // la información del 'product' (nombre, descripción, imagen, etc.).
      const response = await getOrderById(currentCartOrderId);
      console.log("Respuesta de getOrderById en CarPanel:", response.data); // <--- AGREGAR ESTO

      if (response && response.data && response.data.orderDetails) {
        const fetchedOrderDetails = response.data.orderDetails;
        setCartProducts(fetchedOrderDetails);

        // Inicializamos las cantidades a partir de lo que viene del backend
        const initialQuantities = fetchedOrderDetails.reduce((acc, detail) => {
          return { ...acc, [detail.id]: detail.quantity };
        }, {});
        setQuantities(initialQuantities);

        // Inicializamos todos los ítems como seleccionados por defecto para el cálculo del resumen
        const initialSelection = fetchedOrderDetails.reduce((acc, detail) => {
          return { ...acc, [detail.id]: true };
        }, {});
        setSelected(initialSelection);

        console.log("🛒 Detalles del carrito cargados:", fetchedOrderDetails);
      } else {
        // Si no se encuentran orderDetails, asumimos que el carrito está vacío
        console.log("ℹ️ No se encontraron detalles de orden para el carrito.");
        setCartProducts([]);
        setQuantities({});
        setSelected({});
      }
    } catch (error) {
      console.error("❌ Error al cargar los productos del carrito:", error);
      toast.error("Error al cargar los productos del carrito."); // Muestra un mensaje de error
      setCartProducts([]); // Limpiamos los productos en caso de error
      setQuantities({});
      setSelected({});
    } finally {
      setIsLoadingCart(false); // La carga ha terminado, exitosa o con error
    }
  };

  // --- useEffect para cargar los datos cuando el componente se monta o el ID del carrito cambia ---
  useEffect(() => {
    fetchCartDetails();
  }, [currentCartOrderId]); // Se vuelve a ejecutar si el ID del carrito cambia

  // --- Manejador de cambio de cantidad ---
  function handleQtyChange(orderDetailId, value) {
    setQuantities((prevQuantities) => ({ ...prevQuantities, [orderDetailId]: value }));

    // OPCIONAL: Llama a tu API para actualizar la cantidad en el backend
    // Si el usuario cambia la cantidad, deberías reflejarlo en la base de datos.
    // Esto podría hacerse con un debounce (esperar un poco antes de llamar a la API)
    // o al finalizar la compra. Por simplicidad, aquí puedes agregar la llamada directa:
    // updateOrderDetailQuantity(orderDetailId, value)
    //   .then(() => toast.success("Cantidad actualizada."))
    //   .catch(error => toast.error("Error al actualizar la cantidad."));
  }

  // --- Lógica de selección de productos ---
  // Ahora filtramos sobre 'cartProducts' (los orderDetails)
  const selectedProductDetails = cartProducts.filter((detail) => selected[detail.id]);
  const anySelected = selectedProductDetails.length > 0;
  // 'allSelected' ahora verifica si todos los 'orderDetails' están seleccionados
  const allSelected =
    cartProducts.length > 0 && cartProducts.every((detail) => selected[detail.id]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({}); // Deselecciona todo
    } else {
      const sel = {};
      cartProducts.forEach((detail) => (sel[detail.id] = true)); // Selecciona todo
      setSelected(sel);
    }
  }

  function toggleOne(orderDetailId) {
    setSelected((prevSelected) => ({ ...prevSelected, [orderDetailId]: !prevSelected[orderDetailId] }));
  }

  // --- Función para eliminar un producto del carrito ---
  const handleRemoveItem = async (orderDetailId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
      return; // El usuario canceló la eliminación
    }
    try {
      await deleteOrderDetail(orderDetailId); // Llama a la función de tu API para eliminar el detalle de la orden
      toast.success("Producto eliminado del carrito.");
      fetchCartDetails(); // Vuelve a cargar el carrito para actualizar la UI
    } catch (error) {
      console.error("❌ Error al eliminar el producto del carrito:", error);
      toast.error("Error al eliminar el producto del carrito.");
    }
  };

  // --- JSX del Resumen de la compra (reutilizable) ---
  const Summary = (
    <>
      <h2 className="text-lg text-gray-800 mb-4">Resumen de la compra</h2>
      {anySelected ? (
        <>
          <div className="border-b border-gray-400 pb-6 space-y-2">
            {selectedProductDetails.map((detail) => (
              <div
                key={detail.id} // Usamos el ID del orderDetail como key
                className="flex justify-between mb-2 text-gray-700"
              >
                <span>
                  {detail.product?.name} x {quantities[detail.id] || detail.quantity}
                </span>
                <span>
                  ${(detail.unitPrice * (quantities[detail.id] || detail.quantity)).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-lg font-semibold py-6">
            <span>Total:</span>
            <span>
              $
              {selectedProductDetails
                .reduce((sum, detail) => sum + detail.unitPrice * (quantities[detail.id] || detail.quantity), 0)
                .toLocaleString()}
            </span>
          </div>
          <div className="absolute bottom-4 left-0 px-3 w-full">
            <Button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300 py-3 rounded-md flex items-center justify-center gap-1">
              <CreditCard className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="text-sm lg:text-base">Comprar</span>
            </Button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 italic">
          Seleccione los productos deseados para calcular el total a pagar.
        </p>
      )}
    </>
  );

  // --- Manejo del estado de carga ---
  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando productos del carrito...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col lg:flex-row min-h-full bg-stone-100 pb-10 pt-22 p-4">
        {/* PANEL DE PRODUCTOS */}
        <div className="order-2 lg:order-1 w-full lg:w-[80%] flex flex-col px-6 bg-stone-100 rounded-lg p-3">
          {/* Encabezado */}
          <div className="border-b border-gray-400 mb-6">
            <h1 className="text-3xl font-semibold text-indigo-950">Mi Carrito</h1>
            {/* Solo muestra "Seleccionar todos" si hay productos en el carrito */}
            {cartProducts.length > 0 && (
              <label className="inline-flex items-center text-blue-600 hover:underline cursor-pointer text-sm mb-5">
                <Input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="mr-2 w-3 h-3 cursor-pointer"
                />
                Seleccionar todos los productos
              </label>
            )}
          </div>

          {/* Resumen SOLO en móvil */}
          <div className="bg-white shadow-md rounded-lg p-3 px-4 mb-6 lg:hidden">
            {Summary}
          </div>

          {/* CONDICIONAL: Mostrar "No hay productos" si el carrito está vacío */}
          {cartProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-600">
              <ShoppingCart size={48} className="mb-4 text-gray-400" />
              <p className="text-lg font-semibold">No hay productos en el carrito.</p>
              <Link to="/tienda" className="mt-4 text-blue-600 hover:underline">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            /* Tarjetas de productos (Iteramos sobre cartProducts/orderDetails) */
            cartProducts.map((detail) => {
              const product = detail.product; // Accedemos al objeto 'product' anidado en 'orderDetail'
              const qty = quantities[detail.id] || detail.quantity; // Usamos la cantidad del estado local o del detalle
              const totalPrice = detail.unitPrice * qty; // Usamos el 'unitPrice' del 'orderDetail'

              return (
                <div
                  key={detail.id} // La clave debe ser el ID único del orderDetail
                  className="w-full flex flex-col sm:flex-row items-start p-5 bg-white rounded-2xl mb-3 shadow-sm hover:shadow-md duration-500 overflow-hidden"
                >
                  <div className="mr-0 sm:mr-4 pt-2">
                    <Input
                      type="checkbox"
                      checked={!!selected[detail.id]} // Usa el ID del orderDetail para la selección
                      onChange={() => toggleOne(detail.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <img
                    // Accede a la URL de la imagen desde el objeto 'product'
                    // Asume que 'product.media' es un array y el primer elemento tiene una 'url'
                    src={product?.media?.[0]?.url || "/placeholder-product.png"}
                    alt={product?.name}
                    className="w-full sm:w-40 h-40 object-contain rounded-lg mt-4 sm:mt-0"
                  />
                  <div className="flex-1 flex flex-col justify-between px-0 sm:px-5 mt-4 sm:mt-0">
                    <div>
                      <h2 className="text-2xl font-semibold">{product?.name}</h2> {/* Nombre del producto */}
                      <p className="text-gray-700 mt-2 line-clamp-2">
                        {/* Descripción del producto. Ajusta si tienes shortDescription o solo description */}
                        {product?.description?.shortDescription || product?.description || "No description available."}
                      </p>
                      <div className="flex gap-4 mt-3">
                        <button
                          className="flex items-center text-red-600 hover:underline" // Cambiado a rojo para "Eliminar"
                          onClick={() => handleRemoveItem(detail.id)} // Llama a la función de eliminación
                        >
                          <FiTrash2 size={18} className="mr-1" />
                          Eliminar
                        </button>
                        {/* Redirección a los detalles del producto usando el ID del producto */}
                        <Link to={`/e-commerce/detalle-producto/${product?.id}`}>
                          <button className="flex items-center text-blue-600 hover:underline">
                            <FaRegEye size={18} className="mr-1" />
                            Ver producto
                          </button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <NumberStepper
                        min={1}
                        max={product?.stock || 10} // Usa el stock del producto si está disponible, sino un máximo de 10
                        value={qty}
                        onChange={(v) => handleQtyChange(detail.id, v)} // Pasa el ID del orderDetail
                      />
                      <p className="text-2xl">${totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PANEL DE RESUMEN (solo en escritorio) */}
        <div className="hidden lg:block order-1 lg:order-2 w-[25%] ml-3 px-4 mt-13 h-[26em] top-16 z-10 bg-white shadow-md rounded-lg p-3 relative">
          {Summary}
        </div>
      </div>
    </motion.div>
  );
}