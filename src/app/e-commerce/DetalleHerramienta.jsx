import Carousel from "@/components/carousel";
import { useParams } from "react-router-dom";

const DetalleHerramienta = () => {
  const { nombre } = useParams();

  const herramientas = [
    {
      title: "Tubo para Martillo Perforador",
      model: "GBH 2-26 DRE",
      description:
        "Accesorio esencial para perforaciones precisas en concreto y roca. Fabricado con acero de alta resistencia para una mayor durabilidad.",
      technical_data: [
        { key: "Material", value: "Acero de alta resistencia" },
        { key: "Dimensiones", value: "50 cm x 10 cm" },
        { key: "Peso", value: "2.5 kg" },
        { key: "Diámetro de perforación", value: "10 mm" },
        { key: "Compatibilidad", value: "Martillos perforadores industriales" },
        { key: "Resistencia a la temperatura", value: "Hasta 500°C" },
      ],
      applications: [
        "Perforación en concreto reforzado",
        "Uso en minería y construcción",
        "Trabajos de demolición controlada",
      ],
      advantages: [
        "Alta resistencia a impactos",
        "Diseño optimizado para perforaciones rápidas",
        "Compatible con múltiples modelos de martillos",
      ],
      downloads: {
        manuales_de_usuario: [
          {
            titulo: "Manual de usuario",
            url: "/manuales/tubo-perforador.pdf",
            tamanio: "2 MB",
          },
        ],
        fichas_tecnicas: [
          {
            titulo: "Ficha Técnica",
            url: "/fichas/tubo-perforador.pdf",
            tamanio: "1.2 MB",
          },
        ],
        certificaciones: [
          {
            titulo: "Certificación ISO 9001",
            url: "/certificados/tubo-perforador.pdf",
            tamanio: "500 KB",
          },
        ],
      },
      multimedia: [{ url: "/tubo-mar.png" }, { url: "/tubo-mar.png" }],
    },
    {
      title: "Cuerpo De Bloqueo para Martillo",
      model:"GBH 8-45 DV",
      description:
        "Componente diseñado para garantizar la seguridad y estabilidad en el uso de martillos perforadores. Fabricado en aluminio para reducir peso sin comprometer la resistencia.",
      technical_data: [
        { key: "Material", value: "Aluminio reforzado" },
        { key: "Dimensiones", value: "40 cm x 8 cm" },
        { key: "Peso", value: "1.8 kg" },
        { key: "Sistema de bloqueo", value: "Mecanismo de seguridad dual" },
        {
          key: "Compatibilidad",
          value: "Martillos perforadores de hasta 5 kg",
        },
        {
          key: "Protección contra vibraciones",
          value: "Sí, con sistema amortiguador",
        },
      ],
      applications: [
        "Uso en perforaciones de alta precisión",
        "Trabajo seguro en superficies irregulares",
        "Ideal para mantenimiento industrial",
      ],
      advantages: [
        "Estructura ligera pero resistente",
        "Fácil instalación y desmontaje",
        "Reducción de vibraciones para mayor comodidad del usuario",
      ],
      downloads: {
        manuales_de_usuario: [
          {
            titulo: "Manual de usuario",
            url: "/manuales/cuerpo-bloqueo.pdf",
            tamanio: "1.8 MB",
          },
        ],
        fichas_tecnicas: [
          {
            titulo: "Ficha Técnica",
            url: "/fichas/cuerpo-bloqueo.pdf",
            tamanio: "1 MB",
          },
        ],
        certificaciones: [
          {
            titulo: "Certificación CE",
            url: "/certificados/cuerpo-bloqueo.pdf",
            tamanio: "700 KB",
          },
        ],
      },
      multimedia: [
        { url: "/bloqeador-mar.png" },
        { url: "/bloqeador-mar.png" },
      ],
    },
  ];

  const herramienta = herramientas.find((item) => item.title === nombre);

  if (!herramienta) {
    return <p className="text-gray-700 mt-12 text-center text-2xl">Herramienta no encontrada por el momomento</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">


      <div className="flex flex-col md:flex-row gap-8">




        <div className="w-full md:w-1/3 flex flex-col items-center">
          <Carousel images={herramienta.multimedia.map((item) => item.url)} />
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Ir a la tienda
          </button>
        </div>

        {/* Contenido principal */}
        <div className="w-full md:w-2/3">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {herramienta.title}
          </h1>
          <p className="text-2xl font-bold text-gray-800 my-4">{herramienta.model}</p>
          <p className="text-lg text-gray-600 mb-8">
            {herramienta.description}
          </p>

          {/* Especificaciones Técnicas */}
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Especificaciones Técnicas
          </h3>
          <ul className="space-y-2">
            {herramienta.technical_data.map((data, index) => (
              <li key={index} className="text-lg text-gray-700">
                <strong className="font-bold">{data.key}:</strong> {data.value}
              </li>
            ))}
          </ul>

          {/* Aplicaciones */}
          <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            Aplicaciones
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
            {herramienta.applications.map((app, index) => (
              <li key={index}>{app}</li>
            ))}
          </ul>

          {/* Ventajas */}
          <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            Ventajas
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
            {herramienta.advantages.map((adv, index) => (
              <li key={index}>{adv}</li>
            ))}
          </ul>

          {/* Descargas */}
          <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">
            Descargas
          </h3>
          {Object.entries(herramienta.downloads).map(
            ([categoria, archivos]) => (
              <div key={categoria}>
                <h4 className="text-xl font-medium mt-4 text-gray-700">
                  {categoria.replace("_", " ")}
                </h4>
                <ul className="space-y-2">
                  {archivos.map((download, index) => (
                    <li
                      key={index}
                      className="text-lg text-blue-700 hover:text-blue-900"
                    >
                      <a
                        href={download.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {download.titulo}
                      </a>{" "}
                      - {download.tamanio}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleHerramienta;
