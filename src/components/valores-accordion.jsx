import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function ValoresAccordion() {
  return (
    
        <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto">
      <AccordionItem value="honestidad">
        <AccordionTrigger  className='text-xl'>Honestidad</AccordionTrigger>
        <AccordionContent  className='text-lg'>Somos transparentes en nuestro trabajo que realizamos.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="calidad">
        <AccordionTrigger   className='text-xl'>Calidad</AccordionTrigger>
        <AccordionContent className='text-lg'>Nuestros productos cumplen los parámetros establecidos y prometidos.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="trabajo-en-equipo">
        <AccordionTrigger   className='text-xl'>Trabajo en equipo</AccordionTrigger>
        <AccordionContent className='text-lg'>Multiplicamos nuestra productividad con esfuerzo coordinado.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="lealtad">
        <AccordionTrigger   className='text-xl'>Lealtad</AccordionTrigger>
        <AccordionContent className='text-lg'>Somos leales y fieles con nuestro equipo y clientes.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="puntualidad">
        <AccordionTrigger  className='text-xl'>Puntualidad</AccordionTrigger>
        <AccordionContent className='text-lg'>Respetamos y valoramos el tiempo propio y ajeno.</AccordionContent>
      </AccordionItem>
    </Accordion>
  
    
  );
}
