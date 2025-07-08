"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

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

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getUserById, updateUserProfile } from "@/services/admin/userService";
import { useEffect, useRef } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineLogout } from "react-icons/md";
import { LiaUserEditSolid } from "react-icons/lia";




export function NavUser({ user }) {
  const [userInfo, setUserInfo] = useState({ name: "null", lastName: "null", email: "null@gmail.com", avatar: "/Monograma_LIBAMAQ.png"
  });

  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Estado para el formulario de edición de perfil
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const dropdownMenuRef = useRef();
  // Estado controlado para el DropdownMenu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Siempre sincroniza userInfo con el backend primero
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const decoded = jwtDecode(token);
        const userId = decoded.sub;
        const userFetched = await getUserById(userId);
        setUserInfo({ name: userFetched.name, lastName: userFetched.lastName || "", email: userFetched.email, avatar: userFetched.avatar || "/Monograma_LIBAMAQ.png" });
        // Actualiza localStorage con el valor real del backend
        localStorage.setItem("user_data", JSON.stringify({
          name: userFetched.name,
          lastName: userFetched.lastName || "",
          email: userFetched.email,
          avatar: userFetched.avatar || "/Monograma_LIBAMAQ.png"
        }));
        setLoading(false);
        return;
      } catch (error) {
        // Si falla el backend, intenta con localStorage
        const userData = localStorage.getItem("user_data");
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            if (parsed.name && parsed.email) {
              setUserInfo({
                name: parsed.name,
                lastName: parsed.lastName || "",
                email: parsed.email,
                avatar: parsed.avatar || "/Monograma_LIBAMAQ.png"
              });
              setLoading(false);
              return;
            }
          } catch {}
        }
      }
      // Fallback: user prop
      if (user && user.name && user.email) {
        setUserInfo({ name: user.name, lastName: user.lastName || "", email: user.email, avatar: user.avatar || "/Monograma_LIBAMAQ.png" });
        setLoading(false);
      }
    };
    fetchUserData();
    // Escucha cambios en localStorage para sincronizar entre ventanas
    const handleStorage = (e) => {
      if (e.key === "user_data") {
        fetchUserData();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user, location?.pathname]);

  // Sincronizar valores actuales al abrir el diálogo
  useEffect(() => {
    if (editDialogOpen && userInfo) {
      setEditName(`${userInfo.name}${userInfo.lastName ? ` ${userInfo.lastName}` : ""}`.trim());
      setEditEmail(userInfo.email || "");
    }
  }, [editDialogOpen, userInfo]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("userId");
    navigate("/", { replace: true });
  };;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild ref={dropdownMenuRef}>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo.name}{userInfo.lastName ? ` ${userInfo.lastName}` : ''}</span>
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
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo.name}{userInfo.lastName ? ` ${userInfo.lastName}` : ''}</span>
                  <span className="truncate text-xs">{userInfo.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={e => { e.preventDefault(); setEditDialogOpen(true); setDropdownOpen(false); }} className="cursor-pointer">
              <LiaUserEditSolid className="" />
                Editar perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <MdOutlineLogout />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Dialog de edición de perfil fuera del DropdownMenu */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Editar perfil</DialogTitle>
              <DialogDescription>
                Realiza cambios en tu perfil aquí. Da clic en guardar cuando termines.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={async e => {
                e.preventDefault();
                setEditLoading(true);
                try {
                  const token = localStorage.getItem("token");
                  if (!token) throw new Error("No autenticado");
                  const { sub: userId } = jwtDecode(token);
                  // Separar nombre y apellido
                  const [name, ...rest] = editName.trim().split(" ");
                  const lastName = rest.join(" ");
                  const profileData = { name, lastName, email: editEmail };
                  const updated = await updateUserProfile(userId, profileData);
                  // Actualizar estado y localStorage
                  setUserInfo(prev => ({ ...prev, name, lastName, email: editEmail, avatar: prev.avatar || "/Monograma_LIBAMAQ.png" }));
                  const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
                  localStorage.setItem("user_data", JSON.stringify({ ...userData, name, lastName, email: editEmail, avatar: prev.avatar || "/Monograma_LIBAMAQ.png" }));
                  toast.success("Perfil actualizado correctamente");
                  setEditDialogOpen(false);
                } catch (err) {
                  const msg = err?.message || err?.error || err?.response?.data?.message || "Error al actualizar perfil";
                  toast.error(msg.includes("email") ? "El correo ya está registrado" : msg);
                } finally {
                  setEditLoading(false);
                }
              }}
            >
              <div className="grid gap-4 p-4 py-6 mb-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right ml-auto">Nombre y Apellido</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="col-span-3"
                    required
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right ml-auto">Correo</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="cursor-pointer">Cancelar</Button>
                <Button type="submit" className="cursor-pointer" disabled={editLoading}>{editLoading ? "Guardando..." : "Guardar cambios"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
