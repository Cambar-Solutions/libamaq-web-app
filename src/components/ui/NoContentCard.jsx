import React from 'react';

/**
 * Componente para mostrar un mensaje de "no hay contenido disponible"
 * @param {Object} props
 * @param {string} props.title - Título del mensaje
 * @param {string} props.message - Mensaje descriptivo
 * @param {string} props.componentName - Nombre del componente (para atributo data-component-name)
 * @param {string} props.className - Clases CSS adicionales
 */
const NoContentCard = ({ 
  title = "Contenido no disponible", 
  message = "En este momento no hay contenido disponible. Por favor, vuelve a revisar más tarde.",
  componentName = "",
  className = ""
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-md p-6 text-center mx-auto max-w-md ${className}`}
      data-component-name={componentName}
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-2xl">!</span>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default NoContentCard;
