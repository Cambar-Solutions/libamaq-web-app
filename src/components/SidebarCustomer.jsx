import * as React from "react"
import {
  ShoppingBag,
  ClipboardList,
  DollarSign,
  ShoppingCart,
  User,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
  menuItems: [
    { key: "compras", label: "Mis compras", icon: ShoppingBag },
    { key: "pedidos", label: "Mis pedidos", icon: ClipboardList },
    { key: "rentas", label: "Ver rentas", icon: DollarSign },
    { key: "carrito", label: "Ver carrito", icon: ShoppingCart },
    { key: "perfil", label: "Perfil", icon: User },
  ]
}

export default function SidebarCustomer({ activeKey, onSelect, ...props }) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Espacio vacío */}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-slate-100">
        <SidebarMenu>
          {data.menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton 
                  className="data-[active=true]:bg-blue-100 data-[active=true]:text-sky-600 hover:bg-stone-200"
                  onClick={() => onSelect(item.key)}
                  isActive={activeKey === item.key}
                >
                  <Icon className="mr-2" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Cerrar sesión</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción cerrará tu sesión actual.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => window.location.href = '/'}>
                Cerrar sesión
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  );
}
