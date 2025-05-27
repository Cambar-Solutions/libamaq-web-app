import * as React from "react"
import {
  ShoppingBag,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  User,
  LogOut
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
      name: "Mis compras",
      id: "compras",
      icon: ShoppingBag,
    },
    {
      name: "Mis pedidos",
      id: "pedidos",
      icon: ClipboardList,
    },
    {
      name: "Ver rentas",
      id: "rentas",
      icon: DollarSign,
    },
    // Se eliminó la opción de Categorías ya que ahora se gestionan desde Marcas
    {
      name: "Ver carrito",
      id: "carrito",
      icon: ShoppingCart,
    },
    {
      name: "Perfil",
      id: "perfil",
      icon: User,
    },
    
  ],
}

export function AppSidebarCustomer({ onViewChange, currentView, ...props }) {
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
      <SidebarContent className="bg-slate-100 pt-5">
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
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
    </Sidebar>
  );
}
