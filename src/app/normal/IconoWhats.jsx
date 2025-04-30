import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const IconoWhats = () => {
  const messages = ["Contáctanos", "Hola, para servirte!", "¿En qué podemos ayudarte?"];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const whatsappNumber = "7351023279"; // Reemplaza este número por el tuyo

  return (
    <div className="fixed bottom-5 right-5 flex items-center space-x-2">
      <div className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg">
        <span className="text-sm font-medium">
          {messages[currentMessageIndex]}
        </span>
      </div>
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition duration-300"
      >
        <FaWhatsapp size={28} className="transform transition duration-300 ease-in-out hover:rotate-360" />
      </a>
    </div>
  );
};

export default IconoWhats;
