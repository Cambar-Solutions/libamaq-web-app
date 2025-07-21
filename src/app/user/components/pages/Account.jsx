import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "@/services/admin/userService"; // Asegúrate de que esta ruta sea correcta

// Importar los paneles
import ProfilePanel from "@/app/user/components/pages/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/components/pages/sidebar/BuyPanel";
import OrderPanel from "@/app/user/components/pages/sidebar/OrderPanel";
import RentalPanel from "@/app/user/components/pages/sidebar/RentalPanel";
import CarPanel from "@/app/user/components/pages/sidebar/CarPanel"; // Tu componente CarPanel
import { SiteHeaderCustomer } from "@/app/user/components/molecules/site-headerCustomer";
import { AppSidebarCustomer } from "@/app/user/components/molecules/app-sidebarCustomer";
import toast from "react-hot-toast"; // Para notificaciones

// Importa las funciones de API relacionadas con las órdenes para manejar el carrito
// ASEGÚRATE DE QUE LA RUTA SEA CORRECTA PARA TU PROYECTO
import {
  getOrdersByUser,
  createOrder,
} from "@/services/public/orderService"; // Ajusta esta ruta a la de tu archivo de servicios

export default function Account() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const [currentView, setCurrentView] = useState("perfil");
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const navigate = useNavigate();

  // --- NUEVOS ESTADOS PARA EL CARRITO ---
  const [currentUserId, setCurrentUserId] = useState(null); // Almacenará el ID del usuario loggeado
  const [currentCartOrderId, setCurrentCartOrderId] = useState(null); // Almacenará el ID del carrito activo
  const [isCartLoading, setIsCartLoading] = useState(true); // Estado de carga para el carrito

  // --- useEffect para obtener la información del usuario y su ID ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No se encontró token de autenticación. Redirigiendo a /login.");
          navigate("/login");
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const userId = parseInt(decoded.sub, 10); // Asegúrate de que el userId sea un número
        setCurrentUserId(userId); // Establece el ID del usuario

        const user = await getUserById(userId);
        setUserInfo({ name: user.name, lastName: user.lastName, email: user.email, avatar: "/Monograma_LIBAMAQ.png" });
        setLoading(false);
      } catch (err) {
        console.error("Error al obtener el usuario:", err);
        setError("Error al cargar los datos del usuario. Por favor, intenta de nuevo.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]); // Agrega navigate como dependencia

  // --- NUEVO useEffect para buscar o crear el carrito del usuario ---
  useEffect(() => {
    const fetchOrCreateCart = async () => {
      setIsCartLoading(true); // Inicia la carga del carrito

      // Solo procede si el usuario está loggeado y tenemos su ID
      if (!currentUserId) {
        console.log("No hay ID de usuario disponible para inicializar el carrito.");
        setIsCartLoading(false);
        return;
      }

      try {
        console.log(`[Account] Intentando obtener carrito para el usuario ${currentUserId}...`);
        const userOrdersResponse = await getOrdersByUser(currentUserId);
        console.log("[Account] Respuesta de getOrdersByUser:", userOrdersResponse);

        if (userOrdersResponse && userOrdersResponse.data) {
          // Busca una orden con estado "ACTIVE" (o "PENDING" si tu backend lo permite)
          const existingCart = userOrdersResponse.data.find(order => order.status === "ACTIVE"); // O "PENDING"

          if (existingCart) {
            setCurrentCartOrderId(Number(existingCart.id)); // Asegura que sea un número
            console.log("✅ [Account] Carrito existente encontrado (ID):", Number(existingCart.id));
          } else {
            console.log("ℹ️ [Account] No se encontró carrito activo, intentando crear uno nuevo...");
            const newCartOrder = await createOrder({
              userId: currentUserId, // Asegúrate de que este campo coincida con lo que tu API espera
              status: "ACTIVE", // Estado inicial de un carrito (debe coincidir con el enum del backend)
              total: 0,
              orderDate: new Date().toISOString(),
              // Otros campos necesarios para crear una orden (ej. addressId, paymentMethodId)
              // pueden ser null o omitidos inicialmente si tu API lo permite para un carrito.
              // Si tu API requiere orderHistoryId, tendrías que crearlo primero o manejarlo en el backend.
              orderHistoryId: 1, // <--- **IMPORTANTE:** Si tu API requiere orderHistoryId, pon un valor válido o null/undefined si es opcional.
                               // Si no tienes un historial de orden al crear el carrito, esto podría ser un problema.
                               // Revisa la entidad Order en el backend: @Column({ name: 'order_history_id', type: 'bigint' }) orderHistoryId: bigint;
                               // Si no es nullable, necesitas un valor. Si es nullable, puedes omitirlo o enviar null.
            });
            setCurrentCartOrderId(Number(newCartOrder.id)); // Asegura que sea un número
            console.log("🎉 [Account] Nuevo carrito creado (ID):", Number(newCartOrder.id));
          }
        } else {
          console.warn("⚠️ [Account] getOrdersByUser no retornó datos válidos o data está vacío:", userOrdersResponse);
          toast.error("No se pudieron cargar las órdenes del usuario.");
        }
      } catch (err) {
        console.error("❌ [Account] Error CRÍTICO al buscar o crear el carrito:", err);
        // Si el error es un 400 Bad Request, intenta mostrar el mensaje del backend
        const errorMessage = err.response?.data?.message || err.message || "Error al inicializar el carrito.";
        toast.error(`Error al inicializar el carrito: ${errorMessage}`);
      } finally {
        setIsCartLoading(false); // La inicialización del carrito ha finalizado
      }
    };

    // Solo ejecuta esta lógica si el currentUserId ya está disponible
    if (currentUserId !== null) {
      fetchOrCreateCart();
    }
  }, [currentUserId]); // Dependencia: se ejecuta cuando currentUserId cambia

  // Cuando cambia la location al navegar, inicializa ambos estados:
  useEffect(() => {
    if (location.state?.view) {
      setCurrentView(location.state.view);
    }
    if (location.state?.openLocation) {
      setOpenLocationDialog(true);
    }
  }, [location.state]);

  // Manejo de estados de carga y error unificado
  // Ahora también esperamos que el carrito termine de cargar
  if (loading || isCartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Cargando perfil y carrito...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <p className="text-3xl mb-2">😕</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          Recargar página
        </button>
      </div>
    );
  }

  if (!userInfo) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-red-500 text-lg mb-4">No se pudo cargar la información del usuario. Por favor, inicia sesión.</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Ir a iniciar sesión
          </button>
        </div>
      );
  }

  const renderPanel = () => {
    try {
      switch (currentView) {
        case "perfil":
          return (
            <ProfilePanel
              openLocationDialog={openLocationDialog}
              onCloseLocationDialog={() => setOpenLocationDialog(false)}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
            />
          );
        case "compras":
          return <BuyPanel />;
        // case "pedidos":
        //   return <OrderPanel />;
        case "rentas":
          return <RentalPanel />;
        case "carrito":
          // Pasa los IDs del usuario y del carrito a CarPanel
          return <CarPanel currentUserId={currentUserId} currentCartOrderId={currentCartOrderId} />;
        default:
          return <ProfilePanel />;
      }
    } catch (err) {
      console.error("Error al renderizar vista:", err);
      setError("Error al cargar la vista seleccionada");
      return null;
    }
  };

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeaderCustomer onViewChange={setCurrentView} userInfo={userInfo} />
        <div className="flex flex-1">
          <AppSidebarCustomer
            onViewChange={setCurrentView}
            currentView={currentView}
            setUserInfo={setUserInfo} // Asegúrate de que AppSidebarCustomer reciba setUserInfo si lo necesita
            userInfo={userInfo}
          />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-0">
              {renderPanel()}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}