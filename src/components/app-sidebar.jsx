import * as React from "react"
import {
  Package,       // Productos (Caja o paquete)
  ShoppingCart,  // Pedidos (Carrito de compras)
  Users,         // Clientes (Grupo de personas)
  Briefcase,     // Empleados (Portafolio)
  BarChart3,     // Estadísticas (Gráfico de barras)
  Film,          // Contenido (Película)
  Tag            // Marcas (Etiqueta)
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
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
      name: "Marcas",
      id: "marcas",
      icon: Tag, 
    },
    {
      name: "Pedidos",
      id: "pedidos",
      icon: ShoppingCart, 
    },
    {
      name: "Clientes",
      id: "clientes",
      icon: Users, 
    },
    {
      name: "Empleados",
      id: "empleados",
      icon: Briefcase, 
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

export function AppSidebar({ onViewChange, currentView, ...props }) {
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
      <SidebarContent>
        <SidebarMenu>
          {data.optionsMenu.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
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
