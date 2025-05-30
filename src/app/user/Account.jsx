import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import NavCustomer from "@/components/NavCustomer";
 import SidebarCustomer from '@/components/SidebarCustomer';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Importar los paneles (verifica que las rutas sean correctas)
import ProfilePanel from "@/app/user/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/sidebar/BuyPanel";
import OrderPanel from "@/app/user/sidebar/OrderPanel";
import RentalPanel from "@/app/user/sidebar/RentalPanel";
import CarPanel from "@/app/user/sidebar/CarPanel";
import Shopping from "./sidebar/Shopping";
import { SiteHeaderCustomer } from "@/components/site-headerCustomer";
import { AppSidebarCustomer } from "@/components/app-sidebarCustomer";

export default function Account() {
    const [currentView, setCurrentView] = useState("perfil");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // En desarrollo, no verificamos autenticación
    useEffect(() => {
        // Simplemente establecemos isLoading en false para mostrar el dashboard
        setIsLoading(false);
        console.log("Modo desarrollo: Acceso al dashboard sin autenticación");
    }, []);

    const renderPanel = () => {
        try {
            switch (currentView) {
                case "perfil":
                    return <ProfilePanel />;
                case "compras":
                    return <BuyPanel />;
                case "pedidos":
                    return <OrderPanel />;
                case "rentas":
                    return <RentalPanel />;
                case "carrito":
                    return <CarPanel />;
                // case "verCompras":
                //     return <Shopping />;
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
                <p className="text-red-500 text-lg">{error}</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
                <SiteHeaderCustomer onViewChange={setCurrentView} />
                <div className="flex flex-1">
                    <AppSidebarCustomer onViewChange={setCurrentView} currentView={currentView} />
                    <SidebarInset>
                        <div className="flex flex-1 flex-col gap-4 p-4">
                            {renderPanel()}
                        </div>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
}