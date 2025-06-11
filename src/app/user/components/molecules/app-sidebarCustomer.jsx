import React, { useState, useEffect } from "react";

import {
  ShoppingBag,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  User,
  LogOut
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUserCustomer } from "./nav-userCustomer"

const data = {
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

export function AppSidebarCustomer({ onViewChange, currentView, userInfo, setUserInfo, ...props }) {
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
        <NavUserCustomer
          userInfo={userInfo}
          setUserInfo={setUserInfo}
        />

      </SidebarFooter>
    </Sidebar>
  );
}
