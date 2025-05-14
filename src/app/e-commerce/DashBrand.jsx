import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from 'swiper';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useNavigate } from "react-router-dom";
import { getAllBrands } from "@/services/admin/brandService";



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
      { name: "Rotomartillos y taladros", image: "/categorias/bosch/roto.png" },
      { name: "Amoladoras", image: "/categorias/bosch/amoladora.png" },
      { name: "Herramienta para madera", image: "/categorias/bosch/madera.png" },
      { name: "Herramientas de medición", image: "/categorias/bosch/medicion.png" },
      { name: "Herramienta a Bateria 12V y 18V", image: "/categorias/bosch/inalambrico.png" },
      { name: "Limpieza y jardineria", image: "/categorias/bosch/jardin.png" },
    ],
  },
  makita: {
    name: "Makita",
    products: [
      { name: "Taladros inalámbricos", image: "/categorias/makita/inalambrico.png" },
      { name: "Amoladoras", image: "/categorias/makita/amoladora.png" },
      { name: "Herramienta para madera", image: "/categorias/makita/madera.png" },
      { name: "Herramientas de medición", image: "/categorias/makita/medicion.png" },
      { name: "Herramienta a Bateria 12V y 18V", image: "/categorias/makita/bateria.png" },
      { name: "Limpieza y jardineria", image: "/categorias/makita/jardin.png" },
    ],
  },
  honda: {
    name: "Honda",
    products: [
      { name: "Generadores", image: "/categorias/honda/generadores.jpg" },
      { name: "Motobombas 2 y 3 pulgadas", image: "/categorias/honda/motobombas.jpg" },
      { name: "Motores de 6.5hp, 9hp y 14hp", image: "/categorias/honda/motores.jpg" },
    ],
  },
  cipsa: {
    name: "Cipsa",
    products: [
      { name: "Revolvedoras para concreto de 1 y 2 sacos", image: "/categorias/cipsa/revolvedoras.jpg" },
      { name: "Vibradores a gasolina para concreto", image: "/categorias/cipsa/vibradores.jpg" },
      { name: "Rodillos Vibratorios", image: "/categorias/cipsa/rodillos.jpg" },
      { name: "Apisonadores o bailarinas", image: "/categorias/cipsa/apisonadores.jpg" },
      { name: "Torres de ilumiación", image: "/categorias/cipsa/torres.jpg" },
      { name: "Soldadoras", image: "/categorias/cipsa/soldadoras.jpg" },
      { name: "Bombas para concreto", image: "/categorias/cipsa/bombas.jpg" },
    ],
  },
  marshalltown: {
    name: "Marshalltown",
    products: [
      { name: "Llanas tipo avión", image: "/categorias/marshalltown/llanas-avion.png" },
      { name: "Llanas tipo fresno", image: "/categorias/marshalltown/llanas-fresno.png" },
      { name: "Texturizadores 1/2, 3/4 y 1 pulgada", image: "/categorias/marshalltown/texturizadores.png" },
      { name: "Regla Vibratoria", image: "/categorias/marshalltown/regla.png" },
      { name: "Llanas Manuales", image: "/categorias/marshalltown/llanas-manuales.png" },
      { name: "Orilladores", image: "/categorias/marshalltown/orilladores.png" },
      { name: "Barredoras de concreto", image: "/categorias/marshalltown/barredoras.png" },
      { name: "Cortadores de concreto", image: "/categorias/marshalltown/cortadores.png" },
    ],
  },
  mpower: {
    name: "Mpower",
    products: [
      { name: "Motores a gasolina 6.5, 9, 15hp.", image: "/categorias/mpower/motores.jpg" },
      { name: "Motobombas 2 y 3 pulgadas.", image: "/categorias/mpower/motobombas.jpg" },
      { name: "Generadores de luz de 3,500w a 8000w.", image: "/categorias/mpower/generadores.jpg" },
      { name: "Soldadora 200 A.", image: "/categorias/mpower/soldadora.jpg" },
      { name: "Discos de 14 in para corte de concreto", image: "/categorias/mpower/discos.jpg" },
      { name: "Accesorios", image: "/categorias/mpower/accesorios.jpg" },
    ],
  },
  husqvarna: {
    name: "Husqvarna",
    products: [
      { name: "Cortadoras de concreto", image: "/categorias/husqvarna/cortadoras.jpg" },
      { name: "Apisonadoras o bailarinas", image: "/categorias/husqvarna/apisonadoras.jpg" },
      { name: "Placas Vibratorias", image: "/categorias/husqvarna/placas.jpg" },
      { name: "Rodillos Vibratorios", image: "/categorias/husqvarna/rodillos.jpg" },
      { name: "Desbaste y pulido de concreto", image: "/categorias/husqvarna/desbaste.jpg" },
      { name: "Barrenadores", image: "/categorias/husqvarna/barrenadores.jpg" },
      { name: "Accesorios y Herramientas de diamante", image: "/categorias/husqvarna/accesorios.jpg" },
    ],
  },
};



export default function Dashbrand() {
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const goToCategoryPage = (brandKey, productName) => {
    const brand = brands.find(b => b.id === brandKey);
    if (brand) {
      const formattedBrand = brand.name;
      const formattedCategory = productName;
      navigate(`/productos/${formattedBrand}/${formattedCategory}`);
    }
  };

  // Cargar marcas desde el backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getAllBrands();
        const brandsData = response?.result || [];
        console.log('Marcas cargadas:', brandsData);
        setBrands(brandsData);
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
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
        {loading ? (
          <div className="flex justify-center items-center h-44">
            <p>Cargando marcas...</p>
          </div>
        ) : (
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
            {brands.map((brand) => (
              <SwiperSlide
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id)}
                className="flex justify-center items-center h-44 p-3 bg-white rounded-xl hover:bg-gray-100 transition-transform duration-300 cursor-pointer"
                style={{ borderTop: `4px solid ${brand.color || '#000000'}` }}
              >
                {brand.url ? (
                  <img
                    src={brand.url}
                    alt={`Marca ${brand.name}`}
                    className="h-24 object-contain transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-logo.png";
                    }}
                  />
                ) : (
                  <div 
                    className="h-24 w-full flex items-center justify-center text-xl font-bold transition-transform duration-300 hover:scale-105"
                    style={{ color: brand.color || '#000000' }}
                  >
                    {brand.name}
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Bento Grid de categorías */}
      {selectedBrand && (
        <div className="w-full max-w-6xl bg-white rounded-xl p-6 mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Categorías: {brands.find(b => b.id === selectedBrand)?.name || 'Marca'}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-[120px]">
          {/* Usar los datos de brandDetails para mantener la estructura actual */}
          {brandDetails[brands.find(b => b.id === selectedBrand)?.name?.toLowerCase() || 'bosch']?.products.map((product, index) => {
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


