// Gerente.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { OrdersView } from "./views/OrdersView";
import { ClientsView } from "./views/ClientsView";
import { EmployeesView } from "./views/EmployeesView";
import { ContentView } from "./views/ContentView";
import { StatsView } from "./views/StatsView";
import { BrandsView } from "./views/BrandsView";
import { CategoriesView } from "./views/CategoriesView";
import SparePartsView from "./views/SpareParts/SparePartsView";
import ProductsView from "./views/Products/ProductsView";
import { toast } from "sonner";
import { AppSidebarGerente } from "@/components/app-sidebarGerente";

export default function Gerente() {
  const [currentView, setCurrentView] = useState("pedidos"); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // En desarrollo, no verificamos autenticación
  useEffect(() => {
    // Simplemente establecemos isLoading en false para mostrar el dashboard
    setIsLoading(false);
    console.log("Modo desarrollo: Acceso al dashboard sin autenticación");
  }, []);

  const renderView = () => {
    try {
      switch (currentView) {
        case "productos":
          return <ProductsView />;
        case "repuestos":
          return <SparePartsView />;
        case "pedidos":
          return <OrdersView />;
        case "estadisticas":
          return <StatsView />;
        case "contenido":
          return <ContentView />;
        case "marcas":
          return <BrandsView />;
        case "categorias":
          return <CategoriesView />;
        case "clientes":
          return <ClientsView />;
        case "empleados":
          return <EmployeesView />;
        default:
          return <OrdersView />; 
      }
    } catch (error) {
      console.error("Error al renderizar vista:", error);
      setError("Error al cargar la vista seleccionada");
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-500 text-lg">Error al cargar la vista</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCurrentView("pedidos")} 
          >
            Intentar cargar vista de pedidos
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
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebarGerente onViewChange={setCurrentView} currentView={currentView} />
          <SidebarInset className="flex-1 p-6">
            {renderView()}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
