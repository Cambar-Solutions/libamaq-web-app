"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validar credenciales
    if (credentials.email !== 'libamaq@gmail.com' || credentials.password !== 'Cesar1234.') {
      toast.error("Credenciales incorrectas", {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      setIsLoading(false);
      return;
    }

    // Simular delay de autenticación
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("¡Bienvenido!", {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#4caf50',
          color: '#fff',
          borderRadius: '10px',
        },
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error al iniciar sesión", {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 ">
        <Card className="w-full max-w-sm shadow-lg p-12 hover:scale-105 transition-all">
          <CardHeader className="flex flex-col gap-1.5 px-6">
            <img
              src="/Tipografia_LIBAMAQ.png"
              alt=""
              className="hover:scale-105 transition-all"
            />
          </CardHeader>
          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm leading-none font-medium mb-2">
                  Correo:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                  <input
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="border-input pl-10 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="usuario@gmail.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm leading-none font-medium mb-2">
                  Contraseña:
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="border-input pl-10 pr-10 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
