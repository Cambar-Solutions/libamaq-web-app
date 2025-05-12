import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CreditCard, Clock } from "lucide-react";

const DetalleProducto = () => {
  const navigate = useNavigate();

  // Función para regresar a la página de categorías
  const handleBack = () => {
    navigate("/tienda", { replace: true });
  };

  // Al montar el componente, hacer scroll al inicio de la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const productos = [
    {
      id: "1",
      title: "Smartphone Galaxy S23 Ultra",
      brand: "Samsung",
      model: "SM-S918B",
      price: 24999,
      description: "El smartphone más avanzado de Samsung con cámara de 200MP y S Pen incluido.",
      features: [
        "Pantalla Dynamic AMOLED 2X de 6.8 pulgadas con 120Hz",
        "Procesador Snapdragon 8 Gen 2 para Galaxy",
        "Cámara principal de 200MP con estabilización óptica",
        "Batería de 5000mAh con carga rápida de 45W",
        "S Pen integrado con latencia reducida"
      ],
      advantages: [
        { icon: "/icons/camera.png", text: "200MP Camera" },
        { icon: "/icons/battery.png", text: "5000mAh" },
        { icon: "/icons/processor.png", text: "Snapdragon 8 Gen 2" },
        { icon: "/icons/pen.png", text: "S Pen" }
      ],
      multimedia: [
        "/placeholder-product.png",
        "/placeholder-product-detail.png",
        "/placeholder-product-back.png"
      ],
      selection: "Disponible en colores: Negro, Verde, Crema y Morado",
      additionalInfo: {
        highlights: "El Galaxy S23 Ultra representa lo mejor en tecnología móvil con un diseño premium en aluminio y vidrio Gorilla Glass Victus 2. Su sistema de cámaras profesional permite capturar imágenes con un nivel de detalle sin precedentes incluso en condiciones de poca luz. El S Pen integrado ofrece la experiencia más fluida para tomar notas, dibujar o editar documentos sobre la marcha.",
        application: "Ideal para profesionales creativos, fotógrafos móviles y usuarios que buscan el máximo rendimiento en un smartphone. Perfecto para gaming, multitarea exigente y creación de contenido."
      },
      specs: [
        { name: "Pantalla", value: "6.8\" Dynamic AMOLED 2X, 3088 x 1440 (WQHD+)" },
        { name: "Procesador", value: "Snapdragon 8 Gen 2 para Galaxy (4nm)" },
        { name: "RAM", value: "12GB LPDDR5X" },
        { name: "Almacenamiento", value: "256GB/512GB/1TB UFS 4.0" },
        { name: "Batería", value: "5000mAh, carga rápida 45W, carga inalámbrica 15W" },
        { name: "Sistema Operativo", value: "Android 13 con One UI 5.1" },
        { name: "Resistencia", value: "IP68 (agua y polvo)" }
      ],
      accessories: [
        {
          image: "/placeholder-accessory.png",
          title: "Funda Protectora Premium",
          description: "Protección de grado militar con acabado elegante",
          material: "Policarbonato y TPU"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Cargador Inalámbrico 15W",
          description: "Carga rápida inalámbrica con indicador LED",
          material: "Aleación de aluminio"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Protector de Pantalla",
          description: "Vidrio templado ultra resistente anti-huellas",
          material: "Vidrio templado 9H"
        }
      ],
      downloads: [
        { title: "Manual de usuario", url: "#", size: "5.2 MB" },
        { title: "Guía de inicio rápido", url: "#", size: "1.8 MB" }
      ]
    },
    {
      id: "2",
      title: "Laptop MacBook Pro 16",
      brand: "Apple",
      model: "M2 Pro",
      price: 49999,
      description: "Potencia y rendimiento excepcionales con el chip M2 Pro y pantalla Liquid Retina XDR.",
      features: [
        "Chip M2 Pro con CPU de 12 núcleos y GPU de 19 núcleos",
        "Pantalla Liquid Retina XDR de 16 pulgadas",
        "32GB de memoria unificada",
        "SSD de 1TB de almacenamiento",
        "Batería de hasta 22 horas de duración"
      ],
      advantages: [
        { icon: "/icons/chip.png", text: "M2 Pro" },
        { icon: "/icons/memory.png", text: "32GB RAM" },
        { icon: "/icons/display.png", text: "Liquid Retina XDR" },
        { icon: "/icons/battery.png", text: "22h Battery" }
      ],
      multimedia: [
        "/placeholder-product.png",
        "/placeholder-product-detail.png",
        "/placeholder-product-side.png"
      ],
      selection: "Disponible en color Space Gray",
      additionalInfo: {
        highlights: "El MacBook Pro de 16 pulgadas con chip M2 Pro redefine lo que una laptop profesional puede hacer. Con un rendimiento excepcional, una pantalla espectacular y una batería que dura todo el día, es la herramienta perfecta para profesionales creativos, desarrolladores y cualquier persona que necesite potencia y portabilidad sin compromisos.",
        application: "Ideal para edición de video profesional, desarrollo de software, diseño gráfico, modelado 3D y cualquier flujo de trabajo exigente que requiera alto rendimiento sostenido."
      },
      specs: [
        { name: "Procesador", value: "Apple M2 Pro (12 núcleos CPU, 19 núcleos GPU)" },
        { name: "Memoria", value: "32GB memoria unificada LPDDR5" },
        { name: "Almacenamiento", value: "SSD 1TB" },
        { name: "Pantalla", value: "16\" Liquid Retina XDR, 3456 x 2234, 1000 nits" },
        { name: "Puertos", value: "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3, Jack 3.5mm" },
        { name: "Batería", value: "100Wh, hasta 22 horas de reproducción de video" },
        { name: "Sistema Operativo", value: "macOS Ventura" }
      ],
      accessories: [
        {
          image: "/placeholder-accessory.png",
          title: "Adaptador Thunderbolt a HDMI/USB/Ethernet",
          description: "Expande las posibilidades de conexión de tu MacBook",
          material: "Aluminio anodizado"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Funda de cuero premium",
          description: "Protección elegante con interior de microfibra",
          material: "Cuero genuino"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Magic Mouse",
          description: "Control preciso con superficie Multi-Touch",
          material: "Aluminio y vidrio"
        }
      ],
      downloads: [
        { title: "Guía del usuario", url: "#", size: "4.7 MB" },
        { title: "Información de seguridad", url: "#", size: "1.2 MB" }
      ]
    },
    {
      id: "3",
      title: "Smart TV OLED 65\"",
      brand: "LG",
      model: "OLED65C3",
      price: 32999,
      description: "Televisor OLED 4K con procesador α9 Gen6 AI y tecnología de píxeles autoiluminados.",
      features: [
        "Panel OLED evo para mayor brillo y colores más vivos",
        "Procesador α9 Gen6 AI con Deep Learning",
        "4 puertos HDMI 2.1 compatibles con 4K@120Hz",
        "webOS 23 con asistentes de voz integrados",
        "Dolby Vision IQ y Dolby Atmos"
      ],
      advantages: [
        { icon: "/icons/oled.png", text: "OLED evo" },
        { icon: "/icons/processor.png", text: "α9 Gen6 AI" },
        { icon: "/icons/gaming.png", text: "Gaming Features" },
        { icon: "/icons/sound.png", text: "Dolby Atmos" }
      ],
      multimedia: [
        "/placeholder-product.png",
        "/placeholder-product-detail.png",
        "/placeholder-product-side.png"
      ],
      selection: "Incluye Magic Remote con control por voz",
      additionalInfo: {
        highlights: "El LG OLED65C3 representa la evolución de la tecnología OLED con el nuevo panel evo que ofrece un 20% más de brillo que la generación anterior. El procesador α9 Gen6 AI utiliza deep learning para optimizar imagen y sonido en tiempo real según el contenido. Para los gamers, incluye todas las características necesarias: HDMI 2.1, VRR, ALLM, G-Sync y FreeSync Premium.",
        application: "Perfecto para cinéfilos exigentes, gamers de nueva generación y cualquier persona que busque la mejor experiencia visual en su sala de estar. Ideal tanto para contenido HDR como para juegos de última generación."
      },
      specs: [
        { name: "Panel", value: "OLED evo 65\" (164cm), 10-bit, 100% DCI-P3" },
        { name: "Resolución", value: "4K UHD (3840 x 2160)" },
        { name: "Procesador", value: "α9 Gen6 AI con Deep Learning" },
        { name: "Tasa de refresco", value: "120Hz nativo, VRR 40-120Hz" },
        { name: "HDR", value: "Dolby Vision IQ, HDR10, HLG" },
        { name: "Audio", value: "2.2 canales, 40W, Dolby Atmos, AI Sound Pro" },
        { name: "Smart TV", value: "webOS 23, ThinQ AI, Works with Alexa/Google" }
      ],
      accessories: [
        {
          image: "/placeholder-accessory.png",
          title: "Barra de sonido LG S95QR",
          description: "Sistema de sonido 9.1.5 canales con Dolby Atmos",
          material: "Plástico premium y metal"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Soporte de pared VESA",
          description: "Soporte delgado con inclinación ajustable",
          material: "Acero reforzado"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Magic Remote adicional",
          description: "Control remoto con puntero y reconocimiento de voz",
          material: "Plástico ABS"
        }
      ],
      downloads: [
        { title: "Manual de usuario", url: "#", size: "8.3 MB" },
        { title: "Guía de configuración rápida", url: "#", size: "2.1 MB" }
      ]
    },
    {
      id: "4",
      title: "Cámara Mirrorless Full Frame",
      brand: "Sony",
      model: "Alpha A7 IV",
      price: 42999,
      description: "Cámara mirrorless de fotograma completo con sensor CMOS Exmor R de 33MP y grabación 4K 60p.",
      features: [
        "Sensor CMOS Exmor R retroiluminado de 33MP",
        "Procesador de imagen BIONZ XR",
        "Grabación de video 4K 60p 10-bit 4:2:2",
        "Sistema AF híbrido con 759 puntos de detección de fase",
        "Estabilización de imagen de 5 ejes en el cuerpo"
      ],
      advantages: [
        { icon: "/icons/sensor.png", text: "33MP Full Frame" },
        { icon: "/icons/video.png", text: "4K 60p 10-bit" },
        { icon: "/icons/autofocus.png", text: "Real-time AF" },
        { icon: "/icons/stabilization.png", text: "5-axis IBIS" }
      ],
      multimedia: [
        "/placeholder-product.png",
        "/placeholder-product-detail.png",
        "/placeholder-product-back.png"
      ],
      selection: "Incluye batería recargable NP-FZ100 y cargador",
      additionalInfo: {
        highlights: "La Sony Alpha A7 IV representa el equilibrio perfecto entre fotografía y video en una cámara híbrida. Su nuevo sensor de 33MP ofrece una calidad de imagen excepcional con un rango dinámico amplio y bajo ruido incluso en condiciones de poca luz. El sistema de autofoco mejorado con seguimiento en tiempo real proporciona un rendimiento excepcional para sujetos en movimiento, incluyendo detección específica para ojos humanos, animales y aves.",
        application: "Ideal para fotógrafos profesionales, videógrafos y creadores de contenido que necesitan versatilidad y calidad de imagen superior. Perfecta para fotografía de retratos, paisajes, vida silvestre, eventos y producción de video de alta calidad."
      },
      specs: [
        { name: "Sensor", value: "CMOS Exmor R retroiluminado de 33MP Full Frame" },
        { name: "Procesador", value: "BIONZ XR" },
        { name: "ISO", value: "100-51200 (expandible a 50-204800)" },
        { name: "Velocidad de obturación", value: "1/8000 a 30s" },
        { name: "Video", value: "4K 60p 10-bit 4:2:2, Full HD 120p" },
        { name: "Estabilización", value: "5 ejes en el cuerpo, 5.5 stops" },
        { name: "Batería", value: "NP-FZ100, aprox. 580 disparos (visor)" }
      ],
      accessories: [
        {
          image: "/placeholder-accessory.png",
          title: "Objetivo Sony FE 24-70mm f/2.8 GM II",
          description: "Zoom estándar profesional con apertura constante",
          material: "Metal y vidrio óptico avanzado"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Batería adicional NP-FZ100",
          description: "Batería recargable de ion-litio de alta capacidad",
          material: "Ion-litio"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Tarjeta de memoria CFexpress Tipo A",
          description: "160GB con velocidades de 800MB/s lectura, 700MB/s escritura",
          material: "Memoria flash"
        }
      ],
      downloads: [
        { title: "Manual de instrucciones", url: "#", size: "12.5 MB" },
        { title: "Guía de inicio rápido", url: "#", size: "3.2 MB" }
      ]
    },
    {
      id: "5",
      title: "Consola de Videojuegos",
      brand: "Microsoft",
      model: "Xbox Series X",
      price: 12999,
      description: "La consola Xbox más potente con 12 teraflops de potencia gráfica y SSD ultrarrápido.",
      features: [
        "CPU AMD Zen 2 personalizada de 8 núcleos a 3.8GHz",
        "GPU AMD RDNA 2 con 12 teraflops",
        "SSD personalizado de 1TB con velocidades de 2.4GB/s",
        "Resolución 4K nativa y hasta 120 FPS",
        "Ray tracing hardware acelerado"
      ],
      advantages: [
        { icon: "/icons/power.png", text: "12 Teraflops" },
        { icon: "/icons/ssd.png", text: "SSD Ultrarrápido" },
        { icon: "/icons/resolution.png", text: "4K 120FPS" },
        { icon: "/icons/raytracing.png", text: "Ray Tracing" }
      ],
      multimedia: [
        "/placeholder-product.png",
        "/placeholder-product-detail.png",
        "/placeholder-product-side.png"
      ],
      selection: "Incluye control inalámbrico Xbox y cable HDMI de alta velocidad",
      additionalInfo: {
        highlights: "La Xbox Series X representa la nueva generación de consolas con un rendimiento sin precedentes. Su arquitectura personalizada permite tiempos de carga mínimos, mayor frecuencia de cuadros y resoluciones más altas. La tecnología Quick Resume permite cambiar entre varios juegos de forma instantánea, mientras que la retrocompatibilidad da acceso a miles de títulos de generaciones anteriores con mejoras automáticas.",
        application: "Perfecta para gamers exigentes que buscan la mejor experiencia visual y de rendimiento. Ideal para juegos de acción rápida, títulos de mundo abierto detallados y experiencias inmersivas con ray tracing."
      },
      specs: [
        { name: "CPU", value: "8 núcleos Zen 2 a 3.8GHz (3.6GHz con SMT)" },
        { name: "GPU", value: "52 CUs a 1.825GHz, 12 teraflops" },
        { name: "Memoria", value: "16GB GDDR6 con bus de 320bit" },
        { name: "Almacenamiento", value: "SSD NVME personalizado de 1TB" },
        { name: "Resolución", value: "Hasta 8K HDR" },
        { name: "Frecuencia", value: "Hasta 120 FPS" },
        { name: "Audio", value: "Dolby Digital 5.1, DTS 5.1, Dolby TrueHD con Atmos" }
      ],
      accessories: [
        {
          image: "/placeholder-accessory.png",
          title: "Control Xbox Elite Series 2",
          description: "Control profesional personalizable con palancas intercambiables",
          material: "Plástico premium, acero y goma"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Tarjeta de expansión Seagate 1TB",
          description: "Almacenamiento adicional con la misma velocidad que el SSD interno",
          material: "Memoria flash NVME"
        },
        {
          image: "/placeholder-accessory.png",
          title: "Xbox Game Pass Ultimate (3 meses)",
          description: "Acceso a más de 100 juegos de alta calidad",
          material: "Suscripción digital"
        }
      ],
      downloads: [
        { title: "Manual del usuario", url: "#", size: "4.8 MB" },
        { title: "Guía de configuración", url: "#", size: "2.3 MB" }
      ]
    }
  ];

  // For demo purposes, always show the first product regardless of the ID
  const producto = productos[0];
  const [mainImage, setMainImage] = useState(producto.multimedia[0]);
  

  
  // No need for the not found check since we're always showing the first product

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Botón de regreso */}
      <div className="mb-6">
        <Button className="bg-blue-500 rounded-b-2xl hover:bg-white hover:text-blue-500 border-2 border-blue-500 mb-3 cursor-pointer transition-colors duration-500" onClick={handleBack}>
          Regresar a catálogo
        </Button>
      </div>
  
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Galería de imágenes */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-md h-80 flex justify-center items-center">
            <img
              src={mainImage}
              alt={producto.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex mt-4 space-x-2 overflow-x-auto">
            {producto.multimedia?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${producto.title} - ${index}`}
                className={`w-16 h-16 object-contain border p-1 cursor-pointer ${
                  mainImage === img ? "border-blue-600" : "border-gray-300 bg-black/20 hover:bg-black/10 transition-all duration-400"
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>
  
        {/* Información del producto */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{producto.title}</h1>
          <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{producto.model}</p>
          <p className="text-gray-600 text-md sm:text-lg font-semibold">{producto.description}</p>
          <p className="text-2xl font-bold text-blue-700 mt-4">${producto.price.toLocaleString()}</p>
          
          {/* Botones solo para móvil */}
          <div className="mt-6 space-y-4 lg:hidden">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md flex items-center justify-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Agregar al carrito
            </Button>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              Comprar ahora
            </Button>
            <Button 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-md flex items-center justify-center gap-2"
              onClick={() => navigate(`/e-commerce/rentar/${producto.id || '1'}`, { state: { product: producto } })}
            >
              <Clock className="h-5 w-5" />
              Rentar
            </Button>
          </div>
  
          {/* Características */}
          {producto.features?.length > 0 && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Características principales</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {producto.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </>
          )}
  
          {/* Funciones y características con íconos */}
          {producto.advantages?.length > 0 && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Funciones y características</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {producto.advantages.map((adv, index) => (
                  <div key={index} className="flex flex-col items-center w-16">
                    {adv.icon && (
                      <img src={adv.icon} alt={adv.text} className="w-12 h-12" />
                    )}
                    <p className="text-xs text-gray-700 mt-1 text-center">{adv.text}</p>
                  </div>
                ))}
              </div>
              
              {/* Botones horizontales para desktop, debajo de las ventajas */}
              <div className="hidden lg:flex mt-6 gap-4 w-full">
                <Button className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Agregar al carrito
                </Button>
                <Button className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Comprar ahora
                </Button>
                <Button 
                  className="cursor-pointer flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-md flex items-center justify-center gap-2"
                  onClick={() => navigate(`/e-commerce/rentar/${producto.id || '1'}`, { state: { product: producto } })}
                >
                  <Clock className="h-5 w-5" />
                  Rentar
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
  

  
      {/* Información Adicional */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Características */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2">Características</h4>
          <p className="text-gray-700 whitespace-pre-line">{producto.additionalInfo?.highlights}</p>
        </div>

        {/* Aplicaciones */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-bold text-gray-800 mb-2">Usos recomendados</h4>
          <p className="text-gray-700 whitespace-pre-line">{producto.additionalInfo?.application}</p>
        </div>
      </div>
      
      {/* Sección destacada con fondo de color */}
      <div className="mt-6 p-4 rounded-lg text-white" style={{ backgroundColor: '#017593' }}>
        <h3 className="text-xl font-bold mb-2 text-white">Características destacadas</h3>
        <p className="whitespace-pre-line text-white">{producto.additionalInfo?.highlights}</p>
      </div>
  
      {/* Especificaciones técnicas */}
      {producto.specs?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-950">Especificaciones técnicas</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <tbody className="divide-y divide-gray-200">
                {producto.specs.map((spec, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-1/3">{spec.name}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
  
      {/* Accesorios */}
      {producto.accessories?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold">Accesorios compatibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {producto.accessories.map((acc, index) => (
              <div key={index} className="border p-4 rounded-md bg-gray-100 hover:scale-105 hover:shadow-lg transition-all duration-300">
                <img src={acc.image} alt={acc.title} className="w-full h-32 object-contain mb-4" />
                <h3 className="text-md sm:text-lg font-bold">{acc.title}</h3>
                <p className="text-gray-700">{acc.description}</p>
                <p className="text-sm font-semibold mt-2">Material: {acc.material}</p>
              </div>
            ))}
          </div>
        </div>
      )}
  
      {/* Descargas */}
      {producto.downloads?.length > 0 && (
        <div className="mt-12 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-blue-950 mb-2">DESCARGAS</h2>
          <div className="w-80">
            <hr />
          </div>
          <ul className="mt-4">
            {producto.downloads.map((doc, index) => (
              <li key={index} className="text-blue-600 hover:underline hover:font-semibold transition-all duration-200">
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  {doc.title} ({doc.size})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DetalleProducto;
