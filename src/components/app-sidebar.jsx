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
  Wrench,        // Repuestos (Llave inglesa)
  MessageCircle  // WhatsApp icon (using MessageCircle as a placeholder)
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
import { getCurrentUser } from "@/services/authService"

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
    {
      name: "Whatsapp",
      id: "whatsapp",
      icon: MessageCircle,
    },
  ],
}

export function AppSidebar({ onViewChange, currentView, ...props }) {
  const user = getCurrentUser();
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
          {data.optionsMenu.map((item) => (
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
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
