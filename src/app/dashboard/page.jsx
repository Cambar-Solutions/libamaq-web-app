// Page.jsx (dashboard)
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProductsView } from "./views/ProductsView";
import { OrdersView } from "./views/OrdersView";
import { ClientsView } from "./views/ClientsView";
import { EmployeesView } from "./views/EmployeesView";
import { StatsView } from "./views/StatsView";

export default function Page() {
  const [currentView, setCurrentView] = useState("productos");

  const renderView = () => {
    switch (currentView) {
      case "productos":
        return <ProductsView />;
      case "pedidos":
        return <OrdersView />;
      case "clientes":
        return <ClientsView />;
      case "empleados":
        return <EmployeesView />;
      case "estadisticas":
        return <StatsView />;
      default:
        return <ProductsView />;
    }
  };

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar onViewChange={setCurrentView} currentView={currentView} />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              {renderView()}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
