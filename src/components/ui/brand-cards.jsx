import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const BrandCards = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-4">
      <h1 className="mt-8 font-bold text-2xl">Marcas con las que contamos...</h1>

      <div className="max-w-5xl w-full flex justify-center mt-8 mb-8">
        <div className="flex justify-center gap-6 flex-wrap w-full">
          
          <Card className="py-2 w-[350px] md:w-[400px]">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <CardTitle>Marca Bosch</CardTitle>
              <CardDescription>Equipos de alta calidad para profesionales</CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible py-2">
              <div className="flex justify-center">
                <img
                  alt="Bosch Logo"
                  className="object-cover rounded-lg w-full"
                  src="/logo_bosch.png" 
                  width={300}
                  height={300} 
                />
              </div>
            </CardContent>
          
          </Card>

          
          <Card className="py-2 w-[350px] md:w-[400px]">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <CardTitle>Marca Dremel</CardTitle>
              <CardDescription>Herramientas para el bricolaje y la precisión</CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible py-2">
              <div className="flex justify-center">
                <img
                  alt="Dremel Logo"
                  className="object-cover rounded-lg w-full"
                  src="/dremel.png" 
                  width={300}
                  height={300} 
                />
              </div>
            </CardContent>
            
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandCards;
