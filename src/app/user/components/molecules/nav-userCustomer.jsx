"use client";
import { ChevronsUpDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MdOutlineLogout } from "react-icons/md";
import React, { useState, useEffect } from "react";

export function NavUserCustomer({ userInfo, setUserInfo }) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  };;

  const [user, setUser] = useState({ name: "null", email: "null@gmail.com" });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={userInfo.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo.name} {userInfo.lastName}</span>
                <span className="truncate text-xs">{userInfo.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo.name} {userInfo.lastName}</span>
                  <span className="truncate text-xs">{userInfo.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <Dialog>
                <DialogTrigger asChild className="cursor-pointer">
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <BadgeCheck />
                    Editar perfil
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Editar perfil</DialogTitle>
                    <DialogDescription>
                      Realiza cambios en tu perfil aquí. Da clic en guardar
                      cuando termines.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Nombre
                      </Label>
                      <Input
                        id="name"
                        defaultValue={user.name}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Correo
                      </Label>
                      <Input
                        id="email"
                        defaultValue={user.email}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="cursor-pointer">Guardar cambios</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenuItem className="cursor-pointer">
                <Bell />
                Notificaciones
              </DropdownMenuItem>
            </DropdownMenuGroup> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer ">
              <MdOutlineLogout />
              Cerrar Sesión

            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
