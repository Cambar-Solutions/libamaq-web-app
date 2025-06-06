"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { login } from "@/services/authService";
import { saveAuthResponse, getUserRole } from "@/utils/storage";

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
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      toast.error("Por favor ingresa tu correo y contraseña", {
        position: 'top-right',
        style: { background: '#f44336', color: '#fff', borderRadius: '10px' },
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(credentials.email, credentials.password);

      if (response && response.data && response.data.user) {
        // Guardar datos en localStorage
        saveAuthResponse(response);

        const { user } = response.data;
        const userRole = getUserRole();

        // Mostrar mensaje de bienvenida
        toast.success(`¡Bienvenido, ${user.name || user.email}!`, {
          position: 'top-right',
          style: { background: '#4caf50', color: '#fff', borderRadius: '10px' },
        });

        // Redirigir según el rol del usuario
        if (userRole === 'ADMIN' || userRole === 'DIRECTOR') {
          navigate('/dashboard');
        } else if (userRole === 'GENERAL_CUSTOMER' || userRole === 'FREQUENT_CUSTOMER') {
          navigate('/user-home');
        } else {
          navigate('/');
        }
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error en inicio de sesión:', error);

      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        toast.error("credenciales invalidas", {
          position: 'top-right',
          style: { background: '#f44336', color: '#fff', borderRadius: '10px' },
        });
      } else {
        const errorMessage = error?.response?.data?.message || 'Error al iniciar sesión. Por favor verifica tus credenciales.';
        toast.error(errorMessage, {
          position: 'top-right',
          style: { background: '#f44336', color: '#fff', borderRadius: '10px' },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-100 via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6">
        {/* Logo */}
        <img
          src="/Tipografia_LIBAMAQ.png"
          alt="Libamaq"
          className="h-28 mb-8"
        />

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="usuario@gmail.com"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-950 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded-md transition"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
          </p>
        </form>
      </div>
    </>
  );
}
