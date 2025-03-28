import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";



const brandLogos = [
  { key: "bosch", src: "/brands/logo_bosch.png" },
  { key: "makita", src: "/brands/makita.png" },
  { key: "honda", src: "/brands/honda-fuerza.png" },
  { key: "cipsa", src: "/brands/cipsa.avif" },
  { key: "marshalltown", src: "/brands/marshalltown.png" },
  { key: "mpower", src: "/brands/m-power.webp" },
  { key: "husqvarna", src: "/brands/husq.png" },
];

const brandDetails = {
  bosch: {
    name: "Bosch",
    products: [
      "Rotomartillos y taladros",
      "Amoladoras",
      "Equipo para madera",
      "Herramientas de medición",
      "Equipo inalámbrico ",
    ],
  },
  makita: {
    name: "Makita",
    products: [
      "Taladros inalámbricos",
      "Sierras circulares",
      "Lijadoras",
      "Aspiradoras",
      "Herramientas de jardín",
      "Equipo inalámbrico ",
    ],
  },
  honda: {
    name: "Honda",
    products: [
      "Generadores",
      "Motobombas",
      "Motores estacionarios",
      "Podadoras",
      "Equipos de jardín",
    ],
  },
  cipsa: {
    name: "Cipsa",
    products: [
      "Materiales para construcción",
      "Herramientas especializadas",
      "Productos para acabados",
      "Equipos de seguridad",
      "Accesorios",
    ],
  },
  marshalltown: {
    name: "Marshalltown",
    products: [
      "Llanas",
      "Espátulas",
      "Herramientas para concreto",
      "Niveles",
      "Accesorios de albañilería",
    ],
  },
  mpower: {
    name: "Mpower",
    products: [
      "Taladros",
      "Esmeriladoras",
      "Sierras eléctricas",
      "Herramientas inalámbricas",
      "Accesorios",
    ],
  },
  husqvarna: {
    name: "Husqvarna",
    products: [
      "Motosierras",
      "Cortadoras de concreto",
      "Equipos de demolición",
      "Robots cortacésped",
      "Equipos forestales",
    ],
  },
};


export default function Dashbrand() {

  const navigate = useNavigate();

const goToCategoryPage = (brandKey, productName) => {
  const formattedBrand = brandDetails[brandKey].name;
  const formattedCategory = productName;

  // Puedes slugificar si gustas, pero aquí lo mandamos como está
  navigate(`/productos/${formattedBrand}/${formattedCategory}`);
};

  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  

  return (
    <div className="w-full h-screen max-h-screen overflow-y-auto flex flex-col items-center py-4">
     

      {/* Swiper */}
      <div className="w-full max-w-[90%] sm:max-w-6xl mx-auto p-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="rounded-lg"
        >
          {brandLogos.map((logo, index) => (
            <SwiperSlide
              key={index}
              onClick={() => setSelectedBrand(logo.key)}
              className="flex justify-center items-center h-44 p-3 border bg-white rounded-xl shadow-md hover:bg-gray-100  transition-transform duration-300 cursor-pointer"
            >
              <img
                src={logo.src}
                alt={`Marca ${logo.key}`}
                className="h-24 object-contain transition-transform duration-300 hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Categorías */}
      {selectedBrand && brandDetails[selectedBrand] && (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 mt-4 border overflow-auto max-h-[40vh]">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Categorías: {brandDetails[selectedBrand].name}
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {brandDetails[selectedBrand].products.map((product, index) => (
              <li
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span
  className="text-gray-700 cursor-pointer hover:underline"
  onClick={() => goToCategoryPage(selectedBrand, product)}
>
  {product}
</span>

              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
