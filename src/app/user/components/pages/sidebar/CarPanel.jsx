import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Importa useNavigate
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiTrash2 } from "react-icons/fi";
import NumberStepper from "@/components/ui/NumberStepper";
import { CreditCard, ShoppingCart } from "lucide-react"; // Importa ShoppingCart para el estado vacío
import { FaRegEye } from "react-icons/fa6";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Importa tus servicios de API
// ASEGÚRATE DE QUE LA RUTA SEA CORRECTA PARA TU PROYECTO
import { getCartByUser, removeProductFromCart, updateCartItem } from "@/services/customer/shoppingCar";
import { jwtDecode } from "jwt-decode";

// El componente CarPanel ahora aceptará currentCartOrderId y currentUserId como props.
// Esto asume que un componente padre le pasa el ID del carrito activo del usuario.
export default function CarPanel() {
  const navigate = useNavigate();

  // Estado para los productos del carrito
  const [cartProducts, setCartProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selected, setSelected] = useState({});
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- Función para cargar los detalles del carrito ---
  const fetchCartDetails = async () => {
    setIsLoadingCart(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No autenticado");
      const decoded = jwtDecode(token);
      const userId = decoded.sub ? parseInt(decoded.sub, 10) : null;
      if (!userId) throw new Error("No se pudo obtener el ID de usuario");
      const cartData = await getCartByUser(userId);
      const items = Array.isArray(cartData?.data) ? cartData.data : [];
      console.log("CART ITEM EXAMPLE", items[0]);
      setCartProducts(items);
      // Inicializa cantidades y selección
      const initialQuantities = items.reduce((acc, item) => ({ ...acc, [item.id]: item.quantity }), {});
      setQuantities(initialQuantities);
      const initialSelection = items.reduce((acc, item) => ({ ...acc, [item.id]: true }), {});
      setSelected(initialSelection);
    } catch (err) {
      setCartProducts([]);
      setQuantities({});
      setSelected({});
      setError(err.message || "Error al cargar el carrito");
    } finally {
      setIsLoadingCart(false);
    }
  };

  useEffect(() => {
    fetchCartDetails();
  }, []);

  // --- Manejador de cambio de cantidad ---
  async function handleQtyChange(cartItemId, value) {
    setQuantities((prevQuantities) => ({ ...prevQuantities, [cartItemId]: value }));
    // Actualiza en backend
    try {
      const item = cartProducts.find(i => i.id === cartItemId);
      if (!item) return;
      const payload = {
        id: Number(item.id),
        userId: Number(item.userId),
        productId: Number(item.product.id),
        quantity: Number(value)
      };
      console.log("PAYLOAD TO UPDATE", payload);
      await updateCartItem(payload);
      //toast.success("Cantidad actualizada.");
      // Actualiza el estado local de cartProducts para reflejar el nuevo valor
      setCartProducts((prev) => prev.map(i => i.id === cartItemId ? { ...i, quantity: Number(value) } : i));
      // No recargues todo el carrito
    } catch (error) {
      toast.error("Error al actualizar la cantidad.");
    }
  }

  // --- Lógica de selección de productos ---
  const selectedProductDetails = cartProducts.filter((item) => selected[item.id]);
  const anySelected = selectedProductDetails.length > 0;
  const allSelected = cartProducts.length > 0 && cartProducts.every((item) => selected[item.id]);

  function toggleSelectAll() {
    if (allSelected) {
      setSelected({});
    } else {
      const sel = {};
      cartProducts.forEach((item) => (sel[item.id] = true));
      setSelected(sel);
    }
  }

  function toggleOne(cartItemId) {
    setSelected((prevSelected) => ({ ...prevSelected, [cartItemId]: !prevSelected[cartItemId] }));
  }

  // --- Función para eliminar un producto del carrito ---
  const handleRemoveItem = async () => {
    if (!itemToDelete) return;
    try {
      await removeProductFromCart(itemToDelete);
      toast.success("Producto eliminado del carrito.");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchCartDetails();
    } catch (error) {
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
            {selectedProductDetails.map((item) => (
              <div
                key={item.id}
                className="flex justify-between gap-8 mb-2 text-gray-700"
              >
                <span className="flex items-center gap-0">
                  <span className="w-[9em] line-clamp-1">{item.product?.name || item.name}</span>
                  x <span className="">{quantities[item.id] || item.quantity}</span>
                </span>
                <span className="text-start w-full">
                  ${((item.product?.price || item.price || 0) * (quantities[item.id] || item.quantity)).toLocaleString("es-MX")}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 text-lg font-semibold py-6">
            <span>Total:</span>
            <span>
              $
              {selectedProductDetails
                .reduce((sum, item) => sum + (item.product?.price || item.price || 0) * (quantities[item.id] || item.quantity), 0)
                .toLocaleString("es-MX")}
            </span>
          </div>
          <div className="absolute bottom-4 left-0 lg:px-5 md:px-5 px-10 w-full">
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

  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Cargando productos del carrito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
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
            <p className="text-base text-gray-400 font-semibold mb-3">En este panel podrás ver los productos que tienes en tu carrito
            </p>
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
            cartProducts.map((item) => {
              const product = item.product || item;
              const qty = quantities[item.id] || item.quantity;
              const totalPrice = (product.price || item.price || 0) * qty;

              return (
                <div
                  key={item.id}
                  className="w-full flex flex-col sm:flex-row items-start p-5 bg-white rounded-2xl mb-3 shadow-sm hover:shadow-md duration-500 overflow-hidden"
                >
                  <div className="mr-0 sm:mr-4 pt-2">
                    <Input
                      type="checkbox"
                      checked={!!selected[item.id]}
                      onChange={() => toggleOne(item.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <img
                    src={product?.media?.[0]?.url || "/placeholder-product.png"}
                    alt={product?.name}
                    className="w-full sm:w-40 h-40 object-contain rounded-lg mt-4 sm:mt-0"
                  />
                  <div className="flex-1 flex flex-col justify-between px-0 sm:px-5 mt-4 sm:mt-0">
                    <div>
                      <h2 className="text-2xl font-semibold">{product?.name}</h2>
                      <p className="text-gray-700 mt-2 line-clamp-2">
                        {product?.shortDescription || "..."}
                      </p>
                      <div className="flex gap-4 mt-3">
                        <button
                          className="flex items-center text-red-600 hover:underline"
                          onClick={() => { setItemToDelete(item.id); setDeleteDialogOpen(true); }}
                        >
                          <FiTrash2 size={18} className="mr-1" />
                          Eliminar
                        </button>
                        <Link to={`/producto/${product?.id}`}>
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
                        max={product?.stock || 10}
                        value={qty}
                        onChange={(v) => handleQtyChange(item.id, v)}
                      />
                      <p className="text-2xl font-semibold text-blue-700">${totalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PANEL DE RESUMEN (solo en escritorio) */}
        <div className="hidden lg:block order-1 lg:order-2 w-[25%] ml-3 px-4 mt-13 h-[26em] lg:sticky lg:top-24 z-10 bg-white shadow-md rounded-lg p-3">
          {Summary}
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto del carrito. ¿Estás seguro de que deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)} className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveItem} className="bg-red-600 hover:bg-red-700 text-white cursor-pointer">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </motion.div>
  );
}