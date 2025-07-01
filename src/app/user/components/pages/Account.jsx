import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {jwtDecode} from "jwt-decode";
import { getUserById } from "@/services/admin/userService"; 

// Importar los paneles (verifica que las rutas sean correctas)
import ProfilePanel from "@/app/user/components/pages/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/components/pages/sidebar/BuyPanel";
import OrderPanel from "@/app/user/components/pages/sidebar/OrderPanel";
import RentalPanel from "@/app/user/components/pages/sidebar/RentalPanel";
import CarPanel from "@/app/user/components/pages/sidebar/CarPanel";
import { SiteHeaderCustomer } from "@/app/user/components/molecules/site-headerCustomer";
import { AppSidebarCustomer } from "@/app/user/components/molecules/app-sidebarCustomer";

export default function Account() {
    const [userInfo, setUserInfo] = useState({ name: "null", lastName: "null", email: "null@gmail.com" });
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const [currentView, setCurrentView] = useState("perfil");
    const [openLocationDialog, setOpenLocationDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("auth_token");
                if (!token) return;

                const decoded = jwtDecode(token);
                const userId = decoded.sub;

                const user = await getUserById(userId);
                setUserInfo({ name: user.name, lastName: user.lastName, email: user.email });
                setLoading(false); 
            } catch (error) {
                console.error("Error al obtener el usuario:", error);
            }
        };

        fetchUserData();
    }, []);
    
    // Cuando cambia la location al navegar, inicializa ambos estados:
    useEffect(() => {
        if (location.state?.view) {
            setCurrentView(location.state.view);
        }
        if (location.state?.openLocation) {
            setOpenLocationDialog(true);
        }
    }, [location.state]);

    // En desarrollo, no verificamos autenticación
    useEffect(() => {
        // Simplemente establecemos isLoading en false para mostrar el dashboard
        setIsLoading(false);
        console.log("Modo desarrollo: Acceso al dashboard sin autenticación");
    }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                {/* Cargando perfil… */}
            </div>
        );
    }

    

    const renderPanel = () => {
        try {
            switch (currentView) {
                case "perfil":
                    return <ProfilePanel
                        openLocationDialog={openLocationDialog}
                        onCloseLocationDialog={() => setOpenLocationDialog(false)}
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                    />;
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
        } catch (error) {
            console.error("Error al renderizar vista:", error);
            setError("Error al cargar la vista seleccionada");
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="text-red-500 text-lg">Error al cargar la vista</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => setCurrentView("perfil")}
                    >
                        Intentar cargar vista de perfil
                    </button>
                </div>
            );
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <p className="text-red-500 text-lg">{typeof error === "string" ? error : "Ha ocurrido un error inesperado"}</p>
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

    return (
        <div className="[--header-height:calc(theme(spacing.14))]">
            <SidebarProvider className="flex flex-col">
                <SiteHeaderCustomer
                    onViewChange={setCurrentView}
                    userInfo={userInfo}
                />
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