import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50 px-4">
      {/* Logo fijo sin animación */}
      <div className="w-24 h-24 mb-4 relative">
        <img 
          src="/Monograma_LIBAMAQ.png" 
          alt="Libamaq Logo" 
          className="w-full h-full object-contain"
        />
      </div>

      {/* Texto de bienvenida */}
      <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Bienvenido a LIBAMAQ</h1>
      <p className="text-gray-600 mb-4 text-center">Cargando el mejor contenido para ti...</p>

      {/* Barra de carga animada */}
      <div className="w-48 h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 animate-pulse rounded-full w-1/3" />
      </div>
    </div>
  );
};

export default LoadingScreen;
