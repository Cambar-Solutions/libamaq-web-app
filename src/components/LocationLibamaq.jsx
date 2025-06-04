import { useState } from "react";
import { FaStore, FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Suponiendo que el botón es de tu librería
import { GrMapLocation } from "react-icons/gr";
import Nav from "../components/Nav";
import { AiOutlineCar } from "react-icons/ai";

const locations = [
  {
    id: 1,
    streetAndNumber: "Carr Federal México-Cuautla 1617",
    colony: "Empleado Postal",
    cityState: "62747 Cuautla, Mor.",
    location: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.599723229453!2d-98.94029718937453!3d18.849427758972766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce6ee646400001%3A0xdb09b495bcfa9365!2sLibamaq%20Herramientas.!5e1!3m2!1ses!2smx!4v1748384499064!5m2!1ses!2smx",
    ubi: "Carr Federal México-Cuautla 1617, Empleado Postal, 62747 Cuautla, Mor.",
    cel: "+52 7353985943",
    email: "libamaq@gmail.com"
  },
  {
    id: 2,
    streetAndNumber: "Blvd. Paseo Cuauhnáhuac 1742",
    colony: "Puente Blanco",
    cityState: "62577 Jiutepec, Mor.",
    location: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3774.4661262655997!2d-99.17959492373906!3d18.91969495427647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85ce7481d3aed4c3%3A0x9f4e9f76e3752738!2sBlvd.%20Paseo%20Cuauhn%C3%A1huac%201742%2C%20Puente%20Blanco%2C%2062577%20Jiutepec%2C%20Mor.!5e0!3m2!1ses!2smx!4v1715572500000!5m2!1ses!2smx",
    ubi: "Blvd. Paseo Cuauhnáhuac 1742, Puente Blanco, 62577 Jiutepec, Mor.",
    cel: "+52 7351023279",
    email: "libamaq@gmail.com"
  },
]

const LocationLibamaq = () => {

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navbar */}
      <Nav />

      <div className="grid grid-cols-1 sm:grid-cols-2 w-full space-y- p-8 pt-32 gap-8 justify-around">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-2xl shadow-sm w-full h-full hover:shadow-lg hover:scale-102 transition-all duration-500">
            {/* Header */}
            <div className="bg-zinc-200 text-center text-gray-700 text-2xl font-medium py-2 rounded-t-2xl">
              {loc.cityState}
            </div>

            {/* Body */}
            <div className="px-4 py-3 text-gray-800 h-[60%]">
              <div className="mb-5 text-base text-gray-500">
                <p className="">Calle {loc.streetAndNumber}</p>
                <p className="">Col. {loc.colony}</p>
                <p className="">Tel. {loc.cel}</p>
                <p className="text-blue-600 select-all">{loc.email}</p>
              </div>

              {/* <div className="h-full">
                <iframe
                  src={loc.location}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div> */}

            </div>
            <div className="bg-zinc-200 pt-3 border-t flex justify-center sm:justify-end rounded-b-2xl pb-3 pr-0 sm:pr-5">
              <button
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.ubi)}`, "_blank")}
                className="cursor-pointer inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium px-3 py-1 rounded transition-colors duration-500"
              >
                <AiOutlineCar size={18} />
                Indicaciones
              </button>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default LocationLibamaq;
