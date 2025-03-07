import * as React from "react"
import {
  Package,       // Productos (Caja o paquete)
  ShoppingCart,  // Pedidos (Carrito de compras)
  Users,         // Clientes (Grupo de personas)
  Briefcase,     // Empleados (Portafolio)
  BarChart3,     // Estadísticas (Gráfico de barras)
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
  navMain: [
   
    
    
  ],
  optionsMenu: [
    {
      name: "Productos",
      url: "#",
      icon: Package, 
    },
    {
      name: "Pedidos",
      url: "#",
      icon: ShoppingCart, 
    },
    {
      name: "Clientes",
      url: "#",
      icon: Users, 
    },
    {
      name: "Empleados",
      url: "#",
      icon: Briefcase, 
    },
    {
      name: "Estadísticas",
      url: "#",
      icon: BarChart3, 
    },
  ],
  
}

export function AppSidebar({
  ...props
}) {
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
        <NavProjects optionsMenu={data.optionsMenu} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
