import * as React from "react"
import {
  Package,       // Productos (Caja o paquete)
  ShoppingCart,  // Pedidos (Carrito de compras)
  Users,         // Clientes (Grupo de personas)
  Briefcase,     // Empleados (Portafolio)
  BarChart3,     // Estadísticas (Gráfico de barras)
  Film,          // Contenido (Película)
  Tag,           // Marcas (Etiqueta)
  Layers,        // Categorías (Capas)
  Wrench         // Repuestos (Llave inglesa)
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Jonathan Ocampo",
    email: "libamaq@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  optionsMenu: [
    {
      name: "Productos",
      id: "productos",
      icon: Package,
    },
    {
      name: "Repuestos",
      id: "repuestos",
      icon: Wrench,
    },
    {
      name: "Marcas",
      id: "marcas",
      icon: Tag,
    },
    // Se eliminó la opción de Categorías ya que ahora se gestionan desde Marcas
    {
      name: "Pedidos",
      id: "pedidos",
      icon: ShoppingCart,
    },
    {
      name: "Clientes",
      id: "clientes",
      icon: Users,
      roles: ["ADMIN", "DIRECTOR", "GERENTE"] // Actualizado para incluir GERENTE
    },
    {
      name: "Empleados",
      id: "empleados",
      icon: Briefcase,
      roles: ["ADMIN", "DIRECTOR"] // Solo visible para estos roles
    },
    {
      name: "Estadísticas",
      id: "estadisticas",
      icon: BarChart3,
    },
    {
      name: "Contenido",
      id: "contenido",
      icon: Film,
    },
  ],
}

export function AppSidebarGerente({ onViewChange, currentView, ...props }) {
  // Obtener el rol del usuario actual
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role;

  // Filtrar las opciones del menú según el rol del usuario
  const filteredMenuOptions = data.optionsMenu.filter(option => {
    // Si la opción no tiene roles definidos, es visible para todos
    if (!option.roles) return true;
    // Si tiene roles definidos, verificar si el usuario tiene uno de esos roles
    return option.roles.includes(userRole);
  });

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div>
                  
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <img src="/Tipografia_LIBAMAQ.png" alt="logo" className="max-h-14" />
                </div>
              </a>
            </SidebarMenuButton> */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-slate-100">
        <SidebarMenu>
          {filteredMenuOptions.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton className="data-[active=true]:bg-blue-100 data-[active=true]:text-sky-600 hover:bg-stone-200"
                onClick={() => onViewChange(item.id)}
                isActive={currentView === item.id}
              >
                <item.icon className="mr-2" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
