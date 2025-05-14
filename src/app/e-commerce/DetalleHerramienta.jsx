import { useState } from "react";
import { useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const DetalleHerramienta = () => {


  const navigate = useNavigate();

  // Función para regresar a Productos Destacados
  const handleBack = () => {
    navigate("/#productos-destacados", { replace: true }); // Cambia la ruta según corresponda
  };

  // Hacer scroll automático al regresar a Productos Destacados
  useEffect(() => {
    if (window.location.hash === "#productos-destacados") {
      setTimeout(() => {
        const element = document.getElementById("productos-destacados");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }
  }, []);



  // Al montar el componente, hacer scroll al inicio de la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);




  const { nombre } = useParams();
  const herramientas = [
    {
      title: "GSH 16-28 Professional",
      model: "GSH 16-28",
      description: "Potencia extrema con capacidad de extraer 13 toneladas de material al día.",
      features: [
        "Máximo rendimiento en la remoción de material con energía de impacto de 41 J",
        "Máxima vida útil con construcción robusta y materiales de alta calidad",
        "Sistema Vibration Control para reducir hasta un 60% las vibraciones",
      ],
      advantages: [{ icon: "/product-des/GSH16-28/icon_vc.webp", text: "Vibration Control" }],
      multimedia: [
        "/card-section/16-28.webp",
        "/product-des/GSH16-28/gsh16-28-p.webp",
      ],
      selection: "En carrito con empuñadura auxiliar",
      additionalInfo: {
        highlights: "El GSH 16-28 con Vibration Control y soporte para llaves de dado hexagonales de 28 mm es la herramienta universal de la gama de martillos demoledores con cable de Bosch. Su potente motor alcanza una impresionante energía de impacto de 41 J y gran rendimiento de remoción de material. El martillo demoledor es muy duradero gracias a sus robustos componentes metálicos. Además, es fácil de usar y produce pocas vibraciones para un manejo perfecto.",
        application: "Está diseñada para demoler concreto y piedra. Es compatible con el aspirador de polvo GDE hex.",
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" },
      ],
      accessories: [
        {
          image: "/product-des/GSH16-28/hex28.webp",
          title: "Cortador de asfalto PRO HEX 28",
          description: "Larga vida útil en el corte de asfalto",
          material: "Acero reforzado",
        },
        {
          image: "/product-des/GSH16-28/hex28-4c.webp",
          title: "Cincel espada, redondeado PRO HEX 28-4C",
          description: "Afloramiento duradero de suelos duros y compactados",
          material: "Acero endurecido",
        },
      ],
      downloads: [
        { title: "Manual de usuario", url: "https://www.bosch-professional.com/binary/manualsmedia/o482974v21_160992A9V9_202409.pdf", size: "4.4 MB" },
        { title: "Ficha técnica del producto", url: "https://www.bosch-professional.com/mx/es/pdf/productdata/gsh-16-28-sheet.pdf", size: "1.5 MB" },
      ],
    },
    {
      title: "GSH 27 VC Professional",
      model: "GSH 27 VC",
      description: "El martillo demoledor eléctrico más potente de Bosch.",
      features: [
        "Gran potencia de percusión con 62 J y 1000 impactos por minuto",
        "Valores mínimos de vibración (solo 8,5 m/s²) gracias a la empuñadura desacoplada",
        "Vida útil prolongada gracias a los componentes de aluminio y acero de alta calidad",
      ],
      advantages: [{ icon: "/product-des/GSH27VC/icon_vc.webp", text: "Vibration Control" }],
      multimedia: [
        "/card-section/27VC.webp",
        "/product-des/GSH27VC/gsh27vc-usage1.webp",
      ],
      selection: "En versión estándar con empuñadura desacoplada",
      additionalInfo: {
        highlights: "El GSH 27 VC con Vibration Control es el martillo demoledor más potente de Bosch, ofreciendo un rendimiento superior con 62 J de energía de impacto y un sistema de reducción de vibraciones para mayor comodidad del usuario. Su estructura robusta y componentes de aluminio garantizan una vida útil prolongada.",
        application: "Ideal para trabajos de demolición en concreto y piedra. Compatible con el accesorio de aspiración de polvo GDE 68.",
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" },
      ],
      accessories: [
        {
          image: "/product-des/GSH27VC/hex28.webp",
          title: "Cortador de asfalto PRO HEX 28",
          description: "Larga vida útil en el corte de asfalto",
          material: "Acero reforzado",
        },
        {
          image: "/product-des/GSH27VC/hex28-4c.webp",
          title: "Cincel espada, redondeado PRO HEX 28-4C",
          description: "Afloramiento duradero de suelos duros y compactados",
          material: "Acero endurecido",
        },
        {
          image: "/product-des/GSH27VC/gde.webp",
          title: "GDE 68",
          description: "Accesorios del sistema para la reducción de polvo",
          material: "Plástico de alta resistencia",
        },
      ],
      downloads: [
        { title: "Manual de usuario", url: "https://www.bosch-professional.com/binary/manualsmedia/o484930v21_160992A9VA_202410.pdf", size: "3 MB" },
        { title: "Ficha técnica del producto", url: "https://www.bosch-professional.com/mx/es/pdf/productdata/gsh-27-vc-sheet.pdf", size: "1.5 MB" },
      ],
    },
    {
      title: "GBH 8-45 DV Professional",
      model: "GBH 8-45 DV",
      description: "1500 W de potencia con bajo nivel de vibraciones.",
      features: [

        "Rendimiento máximo de perforación y cincelado.",
        "Sistema Vibration Control de tres etapas con función Turbo Power.",
      ],
      advantages: [
        { icon: "/product-des/GBH8-45DV/icon_rc.webp", text: "Rotation Control Clutch" },
        { icon: "/product-des/GBH8-45DV/icon_vc.webp", text: "Vibration Control" },
        { icon: "/product-des/GBH8-45DV/icon_ss.webp", text: "Speed Selection" },
        { icon: "/product-des/GBH8-45DV/icon_rp.webp", text: "Restart Protection" }
      ],
      multimedia: [
        "/card-section/8-45DV.webp",
        "/product-des/GBH8-45DV/p.webp",

      ],
      selection: "En versión con función Turbo Power y sistema de reducción de vibraciones.",
      additionalInfo: {
        highlights: "El GBH 8-45 DV con Vibration Control es la herramienta todoterreno en la categoría de rotomartillo con cable SDS max de Bosch gracias a sus funciones universales. Su perfecta relación potencia-peso lo hace ideal para múltiples aplicaciones SDS max al equilibrar potencia y facilidad de uso. Este rotomartillo posee componentes metálicos robustos que lo hacen muy duradero. Su potente motor alcanza una energía de impacto de 12,5 J para una perforación y cincelado rápidos.",
        application: "Perfecto para trabajos de perforación en hormigón y mampostería, con una potencia equilibrada para aplicaciones exigentes.",
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" },
      ],
      accessories: [
        {
          image: "/product-des/GBH8-45DV/cinceles-sd.webp",
          title: "Juego de cinceles PRO SDS max-5C",
          description: "Larga vida útil en el cincelado de hormigón y mampostería",
          material: "Acero reforzado",
        },
        {
          image: "/product-des/GBH8-45DV/gde.webp",
          title: "GDE 68",
          description: "Accesorios del sistema para la reducción de polvo",
          material: "Plástico de alta resistencia",
        },
      ],
      downloads: [
        { title: "Manual de usuario", url: "https://www.bosch-professional.com/binary/manualsmedia/o204408v21_160992A0H2_final.pdf", size: "4.1 MB" },

        { title: "Ficha técnica del producto", url: "https://www.bosch-professional.com/mx/es/pdf/productdata/gbh-8-45-dv-sheet.pdf", size: "1.5 MB" },
      ],
    },
    {
      title: "GBH 2-26 DRE Professional",
      model: "GBH 2-26 DRE",
      description: "Más rápido que una bala, herramienta versátil para trabajos diarios.",
      features: [
        "Avance de perforación superior entre los martillos de 2 kg.",
        "Parada de rotación para cincelar.",
        "Bloqueo de percusión para perforar en madera y acero.",
      ],
      advantages: [
        { icon: "/product-des/GBH2-26DRE/icon_cons.webp", text: "Construccion" },

        { icon: "/product-des/GBH2-26DRE/icon_vs.webp", text: "Variable Speed" },
        { icon: "/product-des/GBH2-26DRE/icon_sds.webp", text: "SDS Plus" },
        { icon: "/product-des/GBH2-26DRE/icon_rc.webp", text: "Rotation Control Clutch" },
      ],
      multimedia: [
        "/card-section/2-26DRE.webp",
        "/product-des/GBH2-26DRE/gbh2-26dre-case.webp",

      ],
      selection: "Incluye maletín de transporte con limitador de profundidad.",
      additionalInfo: {
        highlights: "El GBH 2-26 Professional es el todoterreno de la categoría de rotomartillo con cable SDS plus de Bosch, lo que lo hace ideal para el uso diario. Proporciona 2,7 J de energía de impacto, lo que brinda una perforación rápida y un alto rendimiento de cincelado. Confiables y robustos, los componentes de alta calidad del rotomartillo también garantizan una larga vida útil. Su modo de cincel opcional permite su uso en una amplia gama de aplicaciones.",
        application: "Ideal para perforaciones en hormigón, mampostería y aplicaciones de cincelado en construcción y renovación.",
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" },
      ],
      accessories: [
        {
          image: "/product-des/GBH2-26DRE/cinceles-sds-plus.webp",
          title: "Juego de cinceles PRO SDS plus-5C",
          description: "Larga vida útil en el cincelado de hormigón y mampostería",
          material: "Acero reforzado",
        },
        {
          image: "/product-des/GBH2-26DRE/brocas-sds-plus.webp",
          title: "Juego de brocas variadas de cincel y SDS plus-1",
          description: "La broca SDS plus-1 ha sido optimizada para taladrar hormigón",
          material: "Acero endurecido",
        },
        {
          image: "/product-des/GBH2-26DRE/gde.webp",
          title: "GDE 68",
          description: "Accesorios del sistema para la reducción de polvo",
          material: "Plástico de alta resistencia",
        },
      ],
      downloads: [
        { title: "Manual de usuario", url: "https://www.bosch-professional.com/binary/manualsmedia/o458514v21_160992A9A9_202404.pdf", size: "2 MB" },
        { title: "Ficha técnica del producto", url: "https://www.bosch-professional.com/mx/es/pdf/productdata/gbh-2-26-dre-sheet.pdf", size: "1.5 MB" },
      ],
    },
    {
      title: "Revolvedora para concreto Máxi 10",
      model: "MAXI-1010P",
      description: "Equipo de fácil operación y bajo mantenimiento con gran capacidad de producción de concreto. Se pueden montar motores de 9, 13, 14 y 15 H.P.",
      features: [
        "Capacidad total de 350 litros (12.4 pies³)",
        "Capacidad de carga de 300 litros (10.6 pies³)",
        "Bastidor robusto con patín de arrastre para mayor estabilidad",
        "Corona y piñón de acero para mayor durabilidad",
        "Tolva de lámina con refuerzo interior"
      ],
      multimedia: [
        "/card-section/cipsa-10.jpg",
        "/product-des/MAX/lateral.jpg"
      ],
      selection: "Disponible con base de patín y llantas neumáticas de 13\"",
      additionalInfo: {
        highlights: "La revolvedora para concreto Máxi 10 es ideal para trabajos de alto rendimiento. Su diseño reforzado y gran capacidad de carga permiten una mezcla eficiente y continua. Compatible con motores de gasolina desde 9 hasta 15 H.P., brinda gran versatilidad en obra.",
        application: "Usada para mezclar concreto en obras de construcción, adaptable a distintos motores de combustión."
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" }
      ],

      downloads: [
        {
          title: "Ficha técnica del producto",
          url: "https://www.cipsa.com.mx/bo/file.php?id=13729&cmd=download",
          size: "2.1 MB"
        },
        {
          title: "Manual de partes",
          url: "/public/MAXI-10ND.pdf",
          size: "2.1 MB"
        }
      ]
    },
    {
      title: "Rotomartillo electro neumático HR2475",
      model: "HR2475",
      description: "Rotomartillo electro neumático de tres funciones: taladro, rotomartillo y cincelador. Sistema de encastre SDS Plus. Cuenta con un potente motor y un peso ideal para realizar cualquier tipo de trabajo.",
      features: [
        "3 modos de operación: rotación, rotación con percusión y solo percusión",
        "Encastre SDS Plus para cambio rápido de brocas",
        "Velocidad variable con gatillo sensible al tacto",
        "Empuñadura ergonómica con goma antideslizante para mejor control",
        "Limitador de profundidad ajustable"
      ],

      multimedia: [
        "/card-section/rotomartillo.png",
        "/product-des/HR2475/work.png"
      ],
      selection: "Incluye empuñadura lateral y tope de profundidad",
      additionalInfo: {
        highlights: "El rotomartillo HR2475 de Makita combina versatilidad, potencia y durabilidad. Es ideal para trabajos de perforación y demolición ligera gracias a sus 3 funciones seleccionables. Su diseño ergonómico y el sistema SDS Plus lo convierten en una herramienta confiable para el profesional de la construcción.",
        application: "Diseñado para taladrar, perforar con impacto y cincelar en concreto, ladrillo o piedra. Ideal para instaladores, electricistas y personal de mantenimiento."
      },
      spareParts: [
        { icon: "/icons/step1.png", text: "Seleccione un repuesto" },
        { icon: "/icons/step2.png", text: "Haga el pedido en línea" },
        { icon: "/icons/step3.png", text: "Pague" },
        { icon: "/icons/step4.png", text: "Reciba su pedido" }
      ],
      // accessories: [
      //   {
      //     image: "/product-des/HR2475/broca.jpg",
      //     title: "Broca SDS Plus para metal",
      //     description: "Broca de alta resistencia para perforación precisa en concreto",
      //     material: "Acero de alta velocidad (HSS)"
      //   },
      //   {
      //     image: "/product-des/HR2475/brocas.jpg",
      //     title: "Juego de brocas de acero",
      //     description: "Brocas de acero de alta velocidad-G",
      //     material: "Acero templado"
      //   }
      // ],
      downloads: [
        {
          title: "Manual del usuario",
          url: "https://www.makita.com.mx/wp-content/uploads/2023/04/Manual_HR2475.pdf",
          size: "3.2 MB"
        },
        {
          title: "Ficha técnica del producto",
          url: "https://www.makita.com.mx/wp-content/uploads/2023/04/Ficha_HR2475.pdf",
          size: "1.1 MB"
        }
      ]
    },
    {
      title: "Regla vibro extendedora para concreto",
      model: "28166",
      description: "Una herramienta indispensable por sus características y ventajas para vibrar y extender el concreto.",
      features: [
        "Se puede instalar perfil de 5 o 3 Mts dependiendo de las necesidades del usuario",
        "Potente Motor Honda® GX35 (4 tiempos): 1.3 hp (1.0 kW) @ 7 000 rpm, con tanque de combustible de 0.166 US gal (0.63 L)",
        "Los perfiles son de fácil reemplazo",
        "La vibración solo es en el perfil, no en el operador",
        "Fácil de transportar",
        "Cien por ciento reparable ",
      ],
      // advantages: [
      //   {
      //     "icon": "/product-des/SpeedStriker/icon_vibration_control.webp",
      //     "text": "Vibración controlada"
      //   }
      // ],
      multimedia: [
        "/card-section/regla-vibro-extendedora-para-concretoR.png",
        "/product-des/28166/regla-vibro-extendedora-detrasR.png"
      ],
      selection: "En carrito con hoja de 4 ½ ft",
      additionalInfo: {
        "highlights": "La regla vibro extendedora 28166 de Marshalltown para concreto consolida el concreto mientras nivelas, logrando una losa más fuerte y uniforme. Su ligereza (28.5 lbs / 12.9 kg) y sus agarres ergonómicos facilitan el transporte entre zonas de trabajo. Ideal para proyectos de tamaño medio a grande donde la eficiencia y comodidad del operador son cruciales.",
        "application": "Recomendada para alisar y nivelar losas, aceras, rampas, patios y pisos industriales. Perfecta en obras donde se requiere un acabado profesional con mínimo esfuerzo manual."
      },
      spareParts: [
        { "icon": "/icons/step1.png", "text": "Seleccione un repuesto" },
        { "icon": "/icons/step2.png", "text": "Haga el pedido en línea" },
        { "icon": "/icons/step3.png", "text": "Pague" },
        { "icon": "/icons/step4.png", "text": "Reciba su pedido" }
      ],
      accessories: [
        {
          image: "/product-des/28166/Planchas-de-reglaje-motorizadas.png",
          title: "Planchas de reglaje motorizadas 13284",
          description: "Placa ideal para el revestimiento húmedo y de forma a forma",
          material: "Aleación de aluminio",
        },
      ],
      downloads: [
        {
          title: "Manual del usuario",
          url: "chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/https://marshalltown-ecommerce.azureedge.net/mtdocuments/_WS1716_Speed_Striker_STRIKE45_Manual_FULL.pdf",
          size: "4.3 MB"
        },
        {
          title: "Ficha técnica del producto",
          url: "chrome-extension://efaidnbmnnnibpcajpcglclefindmkaj/https://marshalltown-ecommerce.azureedge.net/mtdocuments/SpeedStriker_SS.pdf",
          size: "1.9 MB"
        }
      ]
    }
  ];


  const herramienta = herramientas.find((item) => item.title === nombre);
  const [mainImage, setMainImage] = useState(herramienta?.multimedia[0]);

  if (!herramienta) {
    return <p className="text-gray-700 mt-12 text-center text-2xl">Herramienta no encontrada por el momento</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Botón de regreso funcional */}
      <div className="mb-6">
        <Button className="bg-blue-500 rounded-b-2xl hover:bg-white hover:text-blue-500 border-2 border-blue-500 mb-3 cursor-pointer transition-colors duration-500" onClick={handleBack}>
          Regresar a productos destacados
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Galería de imágenes */}
        <div className="w-full lg:w-1/2 flex flex-col items-center">
          <div className="w-full max-w-md h-80 flex justify-center items-center">
            <img
              src={mainImage}
              alt={herramienta.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex mt-4 space-x-2 overflow-x-auto">
            {herramienta.multimedia?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${herramienta.title} - ${index}`}
                className={`w-16 h-16 object-contain border p-1 cursor-pointer ${mainImage === img ? "border-blue-600" : "border-gray-300 bg-black/20 hover:bg-black/10 transition-all duration-400"
                  }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Información de la herramienta */}
        <div className="w-full lg:w-1/2">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-950">{herramienta.title}</h1>
          <p className="text-md sm:text-lg text-gray-700 font-bold my-2">{herramienta.model}</p>
          <p className="text-gray-600 text-md sm:text-lg font-semibold">{herramienta.description}</p>

          {/* Características */}
          {herramienta.features?.length > 0 && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Características principales</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {herramienta.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </>
          )}

          {/* Funciones y características con íconos */}
          {herramienta.advantages?.length > 0 && (
            <>
              <h3 className="text-lg sm:text-xl font-semibold mt-6">Funciones y características</h3>
              <div className="flex flex-wrap gap-4 mt-2">
                {herramienta.advantages.map((adv, index) => (
                  <div key={index} className="flex flex-col items-center w-16">
                    {adv.icon && (
                      <img src={adv.icon} alt={adv.text} className="w-12 h-12" />
                    )}
                    <p className="text-xs text-gray-700 mt-1 text-center">{adv.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 text-blue-950">Aspectos destacados del producto</h2>
        <p className="text-gray-700">{herramienta.additionalInfo?.highlights}</p>

        <h2 className="text-xl sm:text-2xl font-bold mt-6 mb-3 text-blue-950">Equipos y aplicaciones</h2>
        <p className="text-gray-700">{herramienta.additionalInfo?.application}</p>
      </div>

      {/* Sección de repuestos */}
      {herramienta.spareParts?.length > 0 && (
        <div className="mt-12 bg-blue-900 text-white p-6 text-center rounded-md">
          <h2 className="text-xl sm:text-2xl font-bold">¿NECESITA ALGÚN REPUESTO?</h2>
          <p className="mt-2">
            Aquí encontrará rápida y fácilmente los repuestos indicados para su herramienta profesional de Bosch.
          </p>

          <ol className="mt-4 space-y-4 flex flex-col items-center max-w-lg mx-auto">
            {herramienta.spareParts.map((step, index) => (
              <li key={index} className="flex items-center gap-4 w-full sm:w-3/4 lg:w-2/3">
                <span className="text-lg font-bold bg-white text-blue-900 px-4 py-2 rounded-full flex justify-center items-center w-10 h-10">
                  {index + 1}
                </span>
                <p className="text-sm sm:text-base text-left">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Accesorios */}
      {herramienta.accessories?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold">Accesorios compatibles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {herramienta.accessories.map((acc, index) => (
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
      {herramienta.downloads?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-blue-950 mb-2">DESCARGAS</h2>
          <div className="w-80">
            <hr />
          </div>
          <ul className="mt-4">
            {herramienta.downloads.map((doc, index) => (
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

export default DetalleHerramienta;
