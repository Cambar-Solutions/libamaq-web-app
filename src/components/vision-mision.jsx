import { Card, CardContent } from "@/components/ui/card"; 

const MisionVision = () => {
  return (
    <section className="py-10 px-6 w-full max-w-screen-lg mx-auto mb-10">
      <div className="flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-10">



        {/* Misión - Card a la izquierda */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
          <Card className="shadow-lg w-full max-w-sm transform transition-all hover:scale-110 hover:shadow-xl bg-blue-100"> 
            <CardContent className="p-4">
              <h3 className="text-2xl font-semibold text-center text-gray-900">
                Misión
              </h3>
              <p className="mt-4 text-center text-gray-600 text-md">
                En LIBAMAQ somos una empresa comprometida a ofrecer venta,
                renta y servicio de herramientas, maquinaria de construcción y
                agrícola, trabajando de la mano con las marcas líderes del
                mercado, apoyando el desarrollo social y económico de nuestro entorno.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Imagen para la Misión */}
        <div className="w-full md:w-1/2">
          <img
            src="/trabajadores.avif" 
            alt="Trabajadores de LIBAMAQ"
            className="w-3/4 h-auto object-cover rounded-lg mx-auto" 
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-10 mt-10">
        {/* Imagen para la Visión */}
        <div className="w-full md:w-1/2">
          <img
            src="/cons.jpg" 
            alt="Maquinaria en LIBAMAQ"
            className="w-3/4 h-auto object-cover rounded-lg mx-auto" 
          />
        </div>

        {/* Visión - Card a la derecha */}
        <div className="flex flex-col items-center md:items-start w-full md:w-1/2">
  <Card className="shadow-lg w-full max-w-sm transform transition-all hover:scale-110 hover:shadow-xl bg-blue-100">
    <CardContent className="p-6">
      <h3 className="text-2xl font-semibold text-center text-gray-900">
        Visión
      </h3>
      <p className="mt-4 text-center text-gray-600 text-md">
        En LIBAMAQ queremos ser la empresa líder en la prestación de nuestros
        servicios, ofreciendo al cliente la mejor calidad y atención en
        herramientas y maquinaria para poder crear un vínculo a largo plazo.
      </p>
    </CardContent>
  </Card>
</div>

      </div>
    </section>
  );
};

export default MisionVision;
