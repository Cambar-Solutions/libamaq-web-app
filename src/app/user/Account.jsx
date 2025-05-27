import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavCustomer from "@/components/NavCustomer";
import SidebarCustomer from '@/components/SidebarCustomer';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

// Importar los paneles (verifica que las rutas sean correctas)
import ProfilePanel from "@/app/user/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/sidebar/BuyPanel";
import OrderPanel from "@/app/user/sidebar/OrderPanel";
import RentalPanel from "@/app/user/sidebar/RentalPanel";
import CarPanel from "@/app/user/sidebar/CarPanel";
import Shopping from "./sidebar/Shopping";

export default function Account() {
    const location = useLocation();
    const initial = location.state?.openSection || "perfil";
    const [activeSection, setActiveSection] = useState(initial);

    // Opcional: limpia el state para no reaparecer si recargas
    useEffect(() => {
        if (location.state?.openSection) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    const renderPanel = () => {
        switch (activeSection) {
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
            case "verCompras":
                return <Shopping />;
            default:
                return <ProfilePanel />;
        }
    };

    return (
        <div className="[--header-height:calc(theme(spacing.14))]">
            <SidebarProvider className="flex flex-col">
                <NavCustomer />
                <div className="flex flex-1">
                    <SidebarCustomer
                        activeKey={activeSection}
                        onSelect={setActiveSection}
                    />
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