  import { Link, useParams, useNavigate } from "react-router-dom";

  import { useEffect } from "react";
  import { Button } from "@/components/ui/button";


  const brandDetails = {
    bosch: {
      name: "Bosch",
      description: "Líder mundial en herramientas eléctricas profesionales y accesorios. Bosch ofrece soluciones innovadoras y de alta calidad para todo tipo de aplicaciones.",
      products: ["Rotomartillos y taladros", "Amoladoras", "Herramienta para madera", "Herramientas de medición", "Herramienta a Bateria 12V y 18V", "Limpieza y jardineria"],
      image: "/logo_bosch.png",
    },
    makita: {
      name: "Makita",
      description: "Reconocida por su durabilidad y rendimiento excepcional. Makita ofrece una amplia gama de herramientas eléctricas y accesorios para profesionales.",
      products: ["Taladros inalámbricos", "Amoladoras", "Herramienta para madera", "Herramientas de medición", "Herramienta a Bateria 12V y 18V ", "Limpieza y jardineria"],
      image: "/makita.png",
    },
    husqvarna: {
      name: "Husqvarna",
      description: "Especialistas en equipos para exteriores y construcción. Husqvarna combina potencia y precisión en cada una de sus herramientas.",
      products: [ "Cortadoras de concreto", "Apisonadoras o bailarinas", "Placas Vibratorias", "Rodillos Vibratorios", "Desbaste y pulido de concreto", "Barrenadores", "Accesorios y Herramientas de diamante"],
      image: "/husq.png",
    },
    honda: {
      name: "Honda",
      description: "Líder en motores y equipos de fuerza. Honda ofrece productos confiables y eficientes para diversas aplicaciones.",
      products: ["Generadores", "Motobombas 2 y 3 pulgadas ", "Motores de 6.5hp, 9hp y 14hp"],
      image: "/honda-fuerza.png",
    },
    marshalltown: {
      name: "Marshalltown",
      description: "Expertos en herramientas manuales para construcción. Marshalltown es sinónimo de calidad y precisión en el acabado.",
      products: ["Llanas tipo avión", "Llanas tipo fresno" , "Texturizadores 1/2, 3/4 y 1 pulgada", "Regla Vibratoria", "Llanas Manuales", "Orilladores", "Barredoras de concreto", "Cortadores de concreto"],
      image: "/marshalltown.png",
    },
    mpower: {
      name: "Mpower",
      description: "Innovación y calidad en herramientas eléctricas. Mpower ofrece soluciones efectivas para profesionales y entusiastas.",
      products: ["Motores a gasolina 6.5, 9, 15hp.", "Motobombas 2 y 3 pulgadas.", "Generadores de luz de 3,500w a 8000w.", "Soldadora 200 A.", "Discos de 14 in para corte de concreto", "Accesorios"],
      image: "/m-power.webp",
    },
    cipsa: {
      name: "Cipsa",
      description: " Cipsa es especialistas en herramientas y maquinaria para construcción.",
      products: ["Revolvedoras para concreto de 1 y 2 sacos", "Vibradores a gasolina para concreto", "Rodillos Vibratorios", "Apisonadores o bailarinas", "Torres de ilumiación", "Soldadoras", "Bombas para concreto"],
      image: "/cipsa.avif",
    },
  };

  export default function BrandPage() {
    const { brandName } = useParams();
    const navigate = useNavigate();

    // Normalizamos el brandName para evitar errores de búsqueda
    const formattedBrandName = brandName?.toLowerCase();
    const brand = brandDetails[formattedBrandName];

    console.log("Brand name from URL:", brandName);
    console.log("Available brands:", Object.keys(brandDetails));
    console.log("Formatted brand name:", formattedBrandName);
    console.log("Brand found:", brand);

    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.title = `LIBAMAQ - ${brand.name}`;
    }, []);
    

    // Función para regresar a `BrandCards`
    const handleBack = () => {
      navigate("/#brand-cards", { replace: true });
    };

    // Hacer scroll automático al `brand-cards` al regresar
    useEffect(() => {
      if (window.location.hash === "#brand-cards") {
        setTimeout(() => {
          const element = document.getElementById("brand-cards");
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 200);
      }
    }, []);

    if (!brand) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marca no encontrada</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer" onClick={handleBack}>
            Regresar a Marcas
          </Button>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-100 pt-20 px-4">
        <div className="max-w-4xl mx-auto">
        <Button className="bg-blue-500 rounded-b-2xl hover:bg-blue-700 mb-3 cursor-pointer" onClick={handleBack}>
          Regresar a Marcas
        </Button>
          {/* Información de la marca */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <img src={brand.image} alt={`Logo de herramientas ${brand.name} en LIBAMAQ`} className="w-48 h-auto object-contain" />
              <div>
                <p className="text-gray-600 text-lg">{brand.description}</p>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Productos principales</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brand.products.map((product, index) => (
                <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-700">{product}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end me-[2em] mt-[2em]" >
            <Link to="/tienda">
            <Button className="cursor-pointer">Ver productos</Button>
            </Link>

            </div>
          </div>

          {/* Botón regresar */}
          <div className="flex justify-center mt-6">
          
          </div>
        </div>
      </div>
    );
  }
