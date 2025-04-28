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
      { name: "Rotomartillos y taladros", image: "/public/categorias/bosch/roto.png" },
      { name: "Amoladoras", image: "/public/categorias/bosch/amoladora.png" },
      { name: "Equipo para madera", image: "/public/categorias/bosch/madera.png" },
      { name: "Herramientas de medición", image: "/public/categorias/bosch/medicion.png" },
      { name: "Equipo inalámbrico", image: "/public/categorias/bosch/inalambrico.png" },
    ],
  },
  makita: {
    name: "Makita",
    products: [
      { name: "Taladros inalámbricos", image: "/public/categorias/makita/inalambrico.png" },
      { name: "Sierras circulares", image: "/public/categorias/makita/sierra.png" },
      { name: "Lijadoras", image: "/public/categorias/makita/lijadora.png" },
      { name: "Equipo inalámbrico", image: "/public/categorias/makita/bateria.png" },
    ],
  },
  honda: {
    name: "Honda",
    products: [
      { name: "Generadores", image: "/path-to-your-images/generadores.jpg" },
      { name: "Motobombas", image: "/path-to-your-images/motobombas.jpg" },
      { name: "Motores estacionarios", image: "/path-to-your-images/motores.jpg" },
      { name: "Podadoras", image: "/path-to-your-images/podadoras.jpg" },
      { name: "Equipos de jardín", image: "/path-to-your-images/equipos-jardin.jpg" },
    ],
  },
  cipsa: {
    name: "Cipsa",
    products: [
      { name: "Materiales para construcción", image: "/path-to-your-images/construccion.jpg" },
      { name: "Herramientas especializadas", image: "/path-to-your-images/herramientas.jpg" },
      { name: "Productos para acabados", image: "/path-to-your-images/acabados.jpg" },
    ],
  },
  marshalltown: {
    name: "Marshalltown",
    products: [
      { name: "Espátulas", image: "/public/categorias/marshalltown/espatula.png" },
      { name: "Herramientas para concreto", image: "/public/categorias/marshalltown/concreto.png" },
      { name: "Niveles", image: "/public/categorias/marshalltown/nivel.png" },
    ],
  },
  mpower: {
    name: "Mpower",
    products: [
      { name: "Taladros", image: "/path-to-your-images/taladros-mpower.jpg" },
      { name: "Esmeriladoras", image: "/path-to-your-images/esmeriladoras.jpg" },
      { name: "Sierras eléctricas", image: "/path-to-your-images/sierras-electricas.jpg" },
      { name: "Herramientas inalámbricas", image: "/path-to-your-images/herramientas-inalambricas.jpg" },
      { name: "Accesorios", image: "/path-to-your-images/accesorios-mpower.jpg" },
    ],
  },
  husqvarna: {
    name: "Husqvarna",
    products: [
      { name: "Cortadoras de concreto", image: "/path-to-your-images/cortadoras.jpg" },
      { name: "Equipos de demolición", image: "/path-to-your-images/demolicion.jpg" },
    ],
  },
};



export default function Dashbrand() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);

  const goToCategoryPage = (brandKey, productName) => {
    const formattedBrand = brandDetails[brandKey].name;
    const formattedCategory = productName;
    navigate(`/productos/${formattedBrand}/${formattedCategory}`);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Función para determinar el tamaño del elemento en el Bento Grid
  const getBentoSize = (index, totalItems) => {
    // Patrón de tamaños para crear un diseño interesante
    const pattern = [
      'large',   // Primer elemento grande
      'tall',    // Segundo elemento alto
      'wide',    // Tercer elemento ancho
      'small',  // Cuarto elemento pequeño
      'small',   // Quinto elemento pequeño
      'tall',    // Sexto elemento alto
      'wide',    // Séptimo elemento ancho
      'large'    // Octavo elemento grande
    ];
    
    return pattern[index % pattern.length];
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center py-4 px-4">
      {/* Swiper de marcas */}
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
              className="flex justify-center items-center h-44 p-3  bg-white rounded-xl  hover:bg-gray-100 transition-transform duration-300 cursor-pointer"
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

      {/* Bento Grid de categorías */}
      {selectedBrand && brandDetails[selectedBrand] && (
        <div className="w-full max-w-6xl bg-white rounded-xl  p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Categorías: {brandDetails[selectedBrand].name}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-[120px]">
          {brandDetails[selectedBrand].products.map((product, index) => {
  const size = getBentoSize(index, brandDetails[selectedBrand].products.length);

  // Clases CSS según el tamaño
  const sizeClasses = {
    large: 'sm:col-span-2 sm:row-span-2',  // Grande: 2 columnas y 2 filas
    tall: 'sm:col-span-1 sm:row-span-2',    // Alto: 1 columna y 2 filas
    wide: 'sm:col-span-2 sm:row-span-2',    // Ancho: 2 columnas y 1 fila
    small: 'sm:col-span-1 sm:row-span-2'   // Pequeño: 1 columna y 1 fila
  };

  return (
    <div
      key={index}
      className={`relative group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${sizeClasses[size]}`}
    >
      {/* Imagen de fondo con gradiente */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-600"
        style={{
          backgroundImage: `url('${product.image}')`, // Usa la imagen asociada con el producto
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
      </div>
      
      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-end p-4">
        <h3 
          className="text-white text-xl font-bold cursor-pointer hover:underline"
          onClick={() => goToCategoryPage(selectedBrand, product.name)}
        >
          {product.name}
        </h3>
        <p className="text-gray-200 text-sm mt-1">Ver productos</p>
      </div>
    </div>
  );
})}

           
          </div>
        </div>
      )}
    </div>
  );
}


