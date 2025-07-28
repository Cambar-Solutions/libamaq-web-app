"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { login } from "@/services/authService";
import { saveAuthResponse, getUserRole } from "@/utils/storage";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getUserByEmail, sendCodeToUserEmail } from "@/services/admin/userService";
import { resetPasswordWithCode } from "@/services/authService";
import { sendVerificationCodeWhatsApp } from "@/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code, 3: new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotUserId, setForgotUserId] = useState(null);
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
          position: 'top-center',
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
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 px-6 relative overflow-hidden">
        {/* Fondo animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full blur-3xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500 dark:bg-blue-800 rounded-full blur-3xl opacity-20 animate-pulse" />
        </motion.div>
        {/* Logo animado */}
        <motion.img
          src="/Tipografia_LIBAMAQ.png"
          alt="Libamaq"
          className="h-28 mb-8 z-10"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
        />
        {/* Formulario animado */}
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-6 bg-white/80 dark:bg-gray-900/80 shadow-xl rounded-2xl p-8 z-10 backdrop-blur-md border border-blue-100 dark:border-blue-900"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
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
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
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
                className="w-full pl-10 pr-10 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-950 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded-md transition shadow-md"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            as={motion.button}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
          <motion.button
            type="button"
            className="w-full text-blue-700 dark:text-blue-300 hover:underline text-sm font-semibold mt-2 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForgotModal(true)}
          >
            ¿Olvidaste tu contraseña?
          </motion.button>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
          </p>
        </motion.form>
        {/* Modal de recuperación de contraseña */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
                initial={{ scale: 0.9, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 40, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 transition"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep(1);
                    setForgotEmail("");
                    setForgotCode("");
                    setForgotPassword("");
                    setForgotLoading(false);
                    setForgotError("");
                    setForgotSuccess("");
                    setForgotUserId(null);
                  }}
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>
                {/* Indicador de paso */}
                <div className="flex items-center justify-center mb-4 gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-2 rounded-full transition-all duration-300 ${forgotStep === step ? 'bg-blue-700 dark:bg-blue-400' : 'bg-blue-200 dark:bg-blue-800'}`}
                    />
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-200 text-center">Recuperar contraseña</h2>
                <motion.div
                  key={forgotStep}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.5 }}
                >
                  {forgotStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Te enviaremos un código de verificación a tu WhatsApp asociado a tu cuenta.
                      </p>
                      <input
                        type="email"
                        placeholder="Ingresa tu correo electrónico"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        disabled={forgotLoading}
                      />
                      {forgotError && <div className="text-red-500 text-xs">{forgotError}</div>}
                      {forgotSuccess && <div className="text-green-600 text-xs">{forgotSuccess}</div>}
                      <Button
                        className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-2"
                        onClick={async () => {
                          setForgotError("");
                          setForgotSuccess("");
                          setForgotLoading(true);
                          try {
                            if (!forgotEmail) throw new Error("Ingresa tu correo electrónico");
                            // Buscar usuario por email
                            const user = await getUserByEmail(forgotEmail);
                            if (!user || !user.id) throw new Error("No se encontró un usuario con ese correo");
                            setForgotUserId(user.id);
                            // Enviar código por WhatsApp
                            await sendVerificationCodeWhatsApp(user.id);
                            setForgotSuccess("Código enviado a tu WhatsApp");
                            setTimeout(() => {
                              setForgotSuccess("");
                              setForgotStep(2);
                            }, 1000);
                          } catch (err) {
                            setForgotError(err.message || "Error al enviar el código");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? "Enviando..." : "Enviar código"}
                      </Button>
                    </div>
                  )}
                  {forgotStep === 2 && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Código de verificación"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        value={forgotCode}
                        onChange={e => setForgotCode(e.target.value)}
                        disabled={forgotLoading}
                      />
                      {forgotError && <div className="text-red-500 text-xs">{forgotError}</div>}
                      {forgotSuccess && <div className="text-green-600 text-xs">{forgotSuccess}</div>}
                      <Button
                        className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-2"
                        onClick={async () => {
                          setForgotError("");
                          setForgotSuccess("");
                          setForgotLoading(true);
                          try {
                            if (!forgotCode) throw new Error("Ingresa el código de verificación");
                            setForgotSuccess("Código verificado. Ahora ingresa tu nueva contraseña.");
                            setTimeout(() => {
                              setForgotSuccess("");
                              setForgotStep(3);
                            }, 1000);
                          } catch (err) {
                            setForgotError(err.message || "Código inválido");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? "Verificando..." : "Verificar código"}
                      </Button>
                    </div>
                  )}
                  {forgotStep === 3 && (
                    <div className="space-y-4">
                      <input
                        type="password"
                        placeholder="Nueva contraseña"
                        className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                        value={forgotPassword}
                        onChange={e => setForgotPassword(e.target.value)}
                        disabled={forgotLoading}
                      />
                      {forgotError && <div className="text-red-500 text-xs">{forgotError}</div>}
                      {forgotSuccess && <div className="text-green-600 text-xs">{forgotSuccess}</div>}
                      <Button
                        className="w-full bg-blue-700 text-white font-semibold py-2 rounded-md mt-2"
                        onClick={async () => {
                          setForgotError("");
                          setForgotSuccess("");
                          setForgotLoading(true);
                          try {
                            if (!forgotPassword) throw new Error("Ingresa tu nueva contraseña");
                            if (!forgotUserId) throw new Error("Usuario no identificado");
                            // Llamar endpoint para cambiar contraseña
                            await resetPasswordWithCode({
                              id: forgotUserId,
                              code: forgotCode,
                              password: forgotPassword
                            });
                            setForgotSuccess("¡Contraseña cambiada exitosamente!");
                            setTimeout(() => {
                              setShowForgotModal(false);
                              setForgotStep(1);
                              setForgotEmail("");
                              setForgotCode("");
                              setForgotPassword("");
                              setForgotUserId(null);
                            }, 1500);
                          } catch (err) {
                            setForgotError(err.message || "Error al cambiar la contraseña");
                          } finally {
                            setForgotLoading(false);
                          }
                        }}
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? "Cambiando..." : "Cambiar contraseña"}
                      </Button>
                    </div>
                  )}
                  <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">Paso {forgotStep} de 3</div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
