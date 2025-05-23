// src/components/ui/StepperDemo.jsx
import React from "react";
import { FaBusinessTime  } from "react-icons/fa";
import { PiSealCheckFill } from "react-icons/pi";
import { FaTruckFast } from "react-icons/fa6";
import { LuPackageCheck } from "react-icons/lu";



// Definición de los pasos del seguimiento de pedido
const steps = [
  { id: "pending", title: "Pendiente", icon: <FaBusinessTime />, description: "Tu pedido está siendo procesado" },
  { id: "confirmed", title: "Confirmado", icon: <PiSealCheckFill />, description: "Tu pedido ha sido confirmado" },
  { id: "shipping", title: "En camino", icon: <FaTruckFast />, description: "Tu pedido está en camino" },
  { id: "delivered", title: "Entregado", icon: <LuPackageCheck />, description: "Tu pedido ha sido entregado" }
];

// Componente para renderizar cada paso (siempre vertical en el modal, horizontal/vertical en la vista principal)
const Step = ({ step, isActive, isCompleted, isLast, isVertical = true }) => {
  return (
    <div className={`flex ${isVertical ? 'items-start' : 'flex-col items-center'}`}>
      {/* Icono del paso */}
      <div className="relative">
        <div
          className={`${isVertical ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center z-10 ${isActive
            ? "bg-amber-600 text-white"
            : isCompleted
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-500"
            }`}
        >
          <span className={`${isVertical ? 'text-sm' : 'text-lg'}`}>{step.icon}</span>
        </div>
      </div>
      
      {/* Título y descripción */}
      <div className={`${isVertical ? 'ml-3' : 'mt-2 text-center'} ${isVertical ? 'w-auto' : 'w-24'}`}>
        <p className={`${isVertical ? 'text-sm' : 'text-xs'} font-medium ${isActive ? "text-amber-600" : isCompleted ? "text-green-500" : "text-gray-500"}`}>
          {step.title}
        </p>
        <p className={`${isVertical ? 'text-xs' : 'text-[10px]'} text-gray-500 mt-1`}>
          {step.description}
        </p>
      </div>
    </div>
  );
};

// Componente principal que acepta el estado actual del pedido y si debe mostrarse en el modal
const StepperDemo = ({ status = "pendiente", inModal = false }) => {
  // Determinar el índice del paso actual basado en el estado
  const getCurrentStepIndex = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === "entregado") return 3;
    if (statusLower === "en proceso" || statusLower === "en camino") return 2;
    if (statusLower === "confirmado") return 1;
    return 0; // pendiente por defecto
  };

  const currentStepIndex = getCurrentStepIndex();
  const [isMobile, setIsMobile] = React.useState(true); // Mobile-first approach

  // Detectar si es móvil
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Si está en el modal o es móvil, mostrar vista vertical
  if (inModal || isMobile) {
    return (
      <div className="w-full py-2 px-1">
        <div className="flex flex-col space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start relative">
              {/* Línea vertical de conexión */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-10 ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} 
                  style={{ transform: 'translateX(-50%)' }}
                />
              )}
              
              <Step
                step={step}
                isActive={index === currentStepIndex}
                isCompleted={index < currentStepIndex}
                isLast={index === steps.length - 1}
                isVertical={true}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Vista de escritorio (horizontal)
  return (
    <div className="w-full py-2 px-1">
      <div className="flex justify-between items-center relative">
        {/* Líneas de conexión entre pasos */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        
        {/* Línea de progreso */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-green-500 z-0" 
          style={{ 
            width: `${currentStepIndex * 100 / (steps.length - 1)}%`,
            transition: 'width 0.5s ease-in-out'
          }} 
        />
        
        {/* Pasos */}
        {steps.map((step, index) => (
          <Step
            key={step.id}
            step={step}
            isActive={index === currentStepIndex}
            isCompleted={index < currentStepIndex}
            isLast={index === steps.length - 1}
            isVertical={false}
          />
        ))}
      </div>
    </div>
  );
};

export default StepperDemo;
