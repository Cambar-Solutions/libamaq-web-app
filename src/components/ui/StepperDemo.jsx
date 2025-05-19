// src/components/ui/StepperDemo.jsx
import * as React from "react";
import { defineStepper } from "@stepperize/react";

// 1) Define pasos y extrae Provider + hook
const { Provider, useStepper } = defineStepper(
  { id: "pending",    title: "Pendiente"    },
  { id: "processing", title: "En proceso"   },
  { id: "delivered",  title: "Entregado"    }
);

// 2) InnerStepper usa el hook dentro del Provider
function InnerStepper() {
  const { currentStep, nextStep, prevStep } = useStepper();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <button
          onClick={prevStep}
          disabled={currentStep.id === "pending"}
          className="px-2 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <button
          onClick={nextStep}
          disabled={currentStep.id === "delivered"}
          className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
      <span className="mt-1 font-semibold">{currentStep.title}</span>
    </div>
  );
}

// 3) Export default que monta el Provider
export default function StepperDemo() {
  return (
    <Provider>
      <InnerStepper />
    </Provider>
  );
}
