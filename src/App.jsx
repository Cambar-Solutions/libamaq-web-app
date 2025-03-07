import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";




import { motion } from "framer-motion";
import ValoresAccordion from "./components/valores-accordion";
import Carousel from "./components/carousel";
import BrandCards from "./components/ui/brand-cards";
import CardSection from "./components/card-section";
import Footer from "./components/footer";
import MisionVision from "./components/vision-mision";

const images = ["/boschcarusel.png", "/service.jpg", "/bosch-power.jpg"];

const items = [
  {
    image: "/tubo-mar.png",
    title: "Tubo para Martillo Perforador ",
    text: "GBH 2-26 DRE",
  },
  {
    image: "/bloqeador-mar.png",
    title: "Cuerpo De Bloqueo para Martillo",
    text: "GBH 8-45 DV",
  },
  {
    image: "/perno.png",
    title: "Perno De Bloqueo para Martillo",
    text: "GSH 27 VC/ GSH 16-28",
  },
  {
    image: "/gsh27.png",
    title: "Resorte para Martillo Demoledor",
    text: "GSH 27 / GSH 27 VC",
  },
];

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

        {/* Navbar */}
        <nav className="bg-white/95 dark:bg-gray-800 shadow-lg py-4 px-12 flex justify-between items-center fixed top-0 w-full z-10">
          <div className="flex items-center">
            <img
              src="/Tipografia_LIBAMAQ.png"
              alt="logo"
              className="max-h-12"
            />
          </div>
      
          <Button asChild>
            <Link to="/login">Iniciar Sesión</Link>
          </Button>
        </nav>

        {/* Hero Section */}
        <header className="text-center py-6 bg-gradient-to-l from-gray-100 to-blue-300 text-black mt-[7em]">
          <h1 className="text-4xl font-bold">
            Las mejores herramientas para cualquier persona
          </h1>
          <p className="mt-4 text-xl">
            Encuentra herramientas de calidad al mejor precio.
          </p>
          <Button className="mt-2 p-5 bg-white text-blue-600 text-lg hover:bg-gray-200">
            Explorar Tienda
          </Button>
        </header>

        <Carousel images={images} />

        <section className="py-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Nuestro Objetivo
            </h2>
            <p className="mt-4 text-2xl text-gray-700 dark:text-gray-300">
              Venta, renta, servicio y reparación de herramientas eléctricas y
              maquinaria para construcción.
            </p>
          </motion.div>
        </section>

        <MisionVision/>

        <BrandCards />

        <section className="py-10 px-6 border-1  m-auto ">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              Nuestros Valores
            </h2>

            <ValoresAccordion />
          </motion.div>
        </section>

        <div>
          <CardSection
            title="Modelos representativos"
            description="Una selección de nuestras mejores herramientas"
            items={items}
          />
        </div>

        <Footer/>

      </div>

    </>
  );
}
