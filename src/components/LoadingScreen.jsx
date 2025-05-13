import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-32 h-32 mb-4 relative">
        <img 
          src="/Monograma_LIBAMAQ.png" 
          alt="Libamaq Logo" 
          className="w-full h-full object-contain animate-pulse"
        />
      </div>
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Bienvenido a LIBAMAQ</h1>
      <p className="text-gray-600 mb-4">Cargando el mejor contenido para ti...</p>
      
      {/* Barra de progreso animada */}
      <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-loading-bar"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
