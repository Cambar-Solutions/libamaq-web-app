import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ValoresAccordion from "./components/valores-accordion";
import Carousel from "./components/carousel";
import BrandCards from "./components/ui/brand-cards";
import CardSection from "./components/card-section";
import Footer from "./components/footer";
import MisionVision from "./components/vision-mision";
import IconoWhats from "./app/normal/IconoWhats";
import { FaStore } from "react-icons/fa";
import "./App.css";
import Nav from "./components/Nav";
import { Toaster } from "sonner";
import BentoGrid from "./components/ui/BentoGrid";
import TikTokGallery from "./components/ui/TikTokGallery";

const images = [
  "/gbh8-45.jpg",
  //"/bosch_start.jpg",
  "/bateriaMakita.jpg",
  "/bosch-power.jpg",
  //"/muelle.jpg",
  "/HUSQ.jpg",
  //"/cortadora.jpg",
  "/service.jpg",
];

export const items = [
  {
    image: "/card-section/16-28.webp",
    title: "GSH 16-28 Professional",
  },
  {
    image: "/card-section/8-45DV.webp",
    title: "GBH 8-45 DV Professional",
  },
  {
    image: "/card-section/27VC.webp",
    title: "GSH 27 VC Professional",
  },
  {
    image: "/card-section/2-26DRE.webp",
    title: "GBH 2-26 DRE Professional",
  },

  {
    image:"/card-section/cipsa-10.jpg",
    title:"Revolvedora para concreto Máxi 10"
  },
  {
    image:"/card-section/rotomartillo.png",
    title:"Rotomartillo electro neumático HR2475"
  }
];

const destacados = [
  'https://www.tiktok.com/@libamaqherramientas/video/7388193969009626373',
  'https://www.tiktok.com/@libamaqherramientas/video/7200102863421394182',
  'https://www.tiktok.com/@libamaqherramientas/video/7263189002147187973'
  
];

export default function App() {
  const location = useLocation();

  // Detectar hash en la URL y hacer scroll automático
  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <Nav/>
    

      {/* Hero Section */}
      <header className="text-center py-6 bg-gradient-to-l from-gray-200 to-blue-400 text-black mt-[7em]">
        <h1 className="text-4xl font-bold">
           Las mejores herramientas para cualquier persona
        </h1>
        <p className="mt-4 text-xl">
        Encuentra herramientas de calidad al mejor precio en LIBAMAQ.
        </p>

        <Button className="bg-white hover:bg-blue-500 border-1 border-blue-500 text-blue-600 hover:text-white rounded-full hover:scale-110 p-4 mt-4 text-1xl transition-transform transition-colors duration-500">
        <Link to="/tienda" className="flex items-center justify-center space-x-2">
    <span>Explorar Tienda</span>
    <FaStore />
  </Link>
          </Button>
      </header>

      <Carousel images={images} className="mb-6"/>

      <section className="py-10 px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center "
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

      <MisionVision />

      <TikTokGallery videoUrls={destacados} />






      {/* Sección de Marcas */}
      <div id="brand-cards">
        <BrandCards />
      </div>

      <BentoGrid />




      <section className="py-10 px-6 border-1 m-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Nuestros Valores
          </h2>
          <ValoresAccordion />
        </motion.div>
      </section>

      <div id="productos-destacados" >
        <CardSection
          title="Modelos representativos"
          description="Una selección de nuestras mejores herramientas"
          items={items}
        />
      </div>

      <IconoWhats />

      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
