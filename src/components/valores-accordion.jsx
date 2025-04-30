import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function ValoresAccordion() {
  const [activeValue, setActiveValue] = useState(null);

  const handleClick = (value) => {
    setActiveValue((prev) => (prev === value ? null : value));
  };

  const items = [
    {
      value: "honestidad",
      title: "Honestidad",
      content: "Somos transparentes en nuestro trabajo que realizamos.",
    },
    {
      value: "calidad",
      title: "Calidad",
      content: "Nuestros productos cumplen los parámetros establecidos y prometidos.",
    },
    {
      value: "trabajo-en-equipo",
      title: "Trabajo en equipo",
      content: "Multiplicamos nuestra productividad con esfuerzo coordinado.",
    },
    {
      value: "lealtad",
      title: "Lealtad",
      content: "Somos leales y fieles con nuestro equipo y clientes.",
    },
    {
      value: "puntualidad",
      title: "Puntualidad",
      content: "Respetamos y valoramos el tiempo propio y ajeno.",
    },
  ];

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full max-w-2xl mx-auto"
      onValueChange={handleClick}
    >
      {items.map(({ value, title, content }) => {
        const isActive = activeValue === value;
        const activeClass = isActive ? "bg-blue-100" : "";

        return (
          <AccordionItem key={value} value={value}>
            <div className={`${activeClass}`}>
              <AccordionTrigger className={`text-xl cursor-pointer p-2`}>
                {title}
              </AccordionTrigger>
              <AccordionContent className={`text-lg px-2 transition-all duration-300 ease-in`}>
                {content}
              </AccordionContent>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
