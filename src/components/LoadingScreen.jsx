import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="w-32 h-32 mb-4 relative">
        <img 
          src="/Monograma_LIBAMAQ.png" 
          alt="Libamaq Logo" 
          className="w-full h-full object-contain animate-spin"
          style={{
            animation: 'spin 2s linear infinite',
            transformOrigin: 'center center'
          }}
        />
      </div>
      <h1 className="text-2xl font-bold text-blue-600 mb-2">Bienvenido a LIBAMAQ</h1>
      <p className="text-gray-600 mb-4">Cargando el mejor contenido para ti...</p>
    </div>
  );
};

export default LoadingScreen;
