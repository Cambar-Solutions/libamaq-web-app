import { Card, CardContent } from "@/components/ui/card"; 

const MisionVision = () => {
  return (
    <section className="py-10 px-6 w-full max-w-screen-lg mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-10">
        {/* Misión - Card a la izquierda */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
          <Card className="shadow-lg w-full max-w-sm transform transition-all hover:scale-105 hover:cursor-pointer hover:shadow-xl"> 
            <CardContent className="p-6">
              <h3 className="text-2xl font-semibold text-center text-gray-900">
                Misión
              </h3>
              <p className="mt-4 text-center text-gray-600">
                Somos una empresa comprometida a ofrecer venta, renta y servicio
                de herramientas eléctricas, maquinaria de construcción y agrícola,
                trabajando de la mano con las marcas líderes del mercado, apoyando
                el desarrollo social y económico de nuestro entorno.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Imagen para la Misión */}
        <div className="w-full md:w-1/2">
          <img
            src="/trabajadores.avif" 
            alt="Misión"
            className="w-3/4 h-auto object-cover rounded-lg mx-auto" 
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-10 mt-10">
        {/* Imagen para la Visión */}
        <div className="w-full md:w-1/2">
          <img
            src="/persona.avif" 
            alt="Visión"
            className="w-3/4 h-auto object-cover rounded-lg mx-auto" 
          />
        </div>

        {/* Visión - Card a la derecha */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
  <Card className="shadow-lg w-full max-w-sm transform transition-all hover:scale-105 hover:cursor-pointer hover:shadow-xl">
    <CardContent className="p-6">
      <h3 className="text-2xl font-semibold text-center text-gray-900">
        Visión
      </h3>
      <p className="mt-4 text-center text-gray-600">
        Ser la empresa líder en la prestación de nuestros servicios,
        ofreciendo al cliente la mejor calidad y atención para poder crear
        un vínculo a largo plazo.
      </p>
    </CardContent>
  </Card>
</div>

      </div>
    </section>
  );
};

export default MisionVision;
