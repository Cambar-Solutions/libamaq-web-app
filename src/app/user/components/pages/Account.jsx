import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jwtDecode } from "jwt-decode";
import { getUserById } from "@/services/admin/userService";

// Importar los paneles
import ProfilePanel from "@/app/user/components/pages/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/components/pages/sidebar/BuyPanel";
import OrderPanel from "@/app/user/components/pages/sidebar/OrderPanel";
import RentalPanel from "@/app/user/components/pages/sidebar/RentalPanel";
import CarPanel from "@/app/user/components/pages/sidebar/CarPanel";
import { SiteHeaderCustomer } from "@/app/user/components/molecules/site-headerCustomer";
import { AppSidebarCustomer } from "@/app/user/components/molecules/app-sidebarCustomer";

export default function Account() {
  const [userInfo, setUserInfo] = useState(null); // Inicializa como null para indicar que no hay datos
  const [loading, setLoading] = useState(true); // Un solo estado de carga
  const [error, setError] = useState(null);

  const location = useLocation();
  const [currentView, setCurrentView] = useState("perfil");
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // CAMBIO CRÍTICO AQUÍ: Usar "token" en lugar de "auth_token"
        const token = localStorage.getItem("token"); 
        if (!token) {
          console.warn("No se encontró token de autenticación. Redirigiendo a /login.");
          navigate("/login"); // Redirige al login si no hay token
          setLoading(false); 
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded.sub;

        const user = await getUserById(userId);
        setUserInfo({ name: user.name, lastName: user.lastName, email: user.email });
        setLoading(false); // Datos cargados exitosamente
      } catch (err) {
        console.error("Error al obtener el usuario:", err);
        setError("Error al cargar los datos del usuario. Por favor, intenta de nuevo.");
        setLoading(false); // Finaliza la carga con un error
      }
    };

    fetchUserData();
  }, [navigate]); // Agrega navigate como dependencia

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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Cargando perfil...</p>
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

  // Si no hay userInfo después de la carga y sin error, significa que no se cargó el usuario
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
        case "pedidos":
          return <OrderPanel />;
        case "rentas":
          return <RentalPanel />;
        case "carrito":
          return <CarPanel />;
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
            setUserInfo={setUserInfo}
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