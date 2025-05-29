import React from 'react';

const DescargasComponente = ({ downloads }) => {
  // Función para verificar si un valor es una URL válida
  const esUrlValida = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Función para obtener la URL segura
  const obtenerUrlSegura = (url) => {
    if (!url) return '#';
    const urlStr = String(url).trim();
    if (!urlStr) return '#';
    return urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
  };

  // Si no hay descargas o es una cadena vacía
  if (!downloads || (typeof downloads === 'string' && downloads.trim() === '')) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        No hay enlaces de descarga disponibles
      </div>
    );
  }

  // Si no es un string, mostrar mensaje de tipo no soportado
  if (typeof downloads !== 'string') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        Tipo de dato no soportado para descargas: {typeof downloads}
      </div>
    );
  }

  // Intentar parsear como JSON
  try {
    const parsedData = JSON.parse(downloads);
    
    // Si es un array de URLs
    if (Array.isArray(parsedData)) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-2">
            {parsedData.map((url, index) => (
              <a
                key={index}
                href={obtenerUrlSegura(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center break-all"
              >
                <DownloadIcon />
                <span className="truncate">{url || 'Descargar archivo'}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }
    
    // Si es un objeto con pares clave-valor
    if (typeof parsedData === 'object' && parsedData !== null) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-3">
            {Object.entries(parsedData).map(([key, value], index) => (
              <div key={index} className="mb-2">
                <div className="font-medium text-gray-700">{key}:</div>
                <a
                  href={obtenerUrlSegura(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center break-all"
                >
                  <DownloadIcon />
                  <span className="truncate">{value || 'Descargar archivo'}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      );
    }
  } catch (e) {
    // Si no es JSON, tratar como string simple
    const urlSegura = obtenerUrlSegura(downloads);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <a
          href={urlSegura}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center break-all"
        >
          <DownloadIcon />
          <span className="truncate">{downloads || 'Descargar archivo'}</span>
        </a>
      </div>
    );
  }

  // Caso por defecto
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-500">
      No hay enlaces de descarga disponibles
    </div>
  );
};

// Componente para el ícono de descarga
const DownloadIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className="h-5 w-5 mr-2 flex-shrink-0" 
    viewBox="0 0 20 20" 
    fill="currentColor"
  >
    <path 
      fillRule="evenodd" 
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
      clipRule="evenodd" 
    />
  </svg>
);

export default DescargasComponente;
