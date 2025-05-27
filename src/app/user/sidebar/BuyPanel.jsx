// src/app/user/sidebar/BuyPanel.jsx
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

// Mapa de meses en español a índice 0–11
const MONTHS_ES = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

// Helper: parsea "10 de mayo, 2025" -> Date()
function parseSpanishDate(str) {
  const match = str.match(/(\d{1,2}) de (\w+),? (\d{4})/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS_ES[monthName.toLowerCase()];
  return month != null ? new Date(Number(year), month, Number(day)) : null;
}

const orders = [
  {
    id: 1,
    name: "Taladro percutor",
    brand: "Bosch",
    description: "Taladro percutor 500 W con mango antideslizante",
    price: 1299.0,
    img: "https://imgs.search.brave.com/mV4uQJWhbZAtQsBdsI5LlJm_K4w9lRp8XPjxRSGXUgk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vMkFDcVJf/T3Bfd0VkSzhsdGtj/TVV0aTN3eHlVd2pt/c1hLTTRSTUdrbDlW/RS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpZek16RXdO/QzFOVEZVMy9Namcx/TURjMU5EWTBObDh4/L01USXdNak10UlM1/M1pXSnc",
    deliveredAt: "10 de mayo, 2025",
    status: "Entregado",
  },
  {
    id: 2,
    name: "Sierra circular",
    brand: "Makita",
    description: "Sierra circular 185 mm con guía láser Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora nulla incidunt fuga eveniet voluptatum quos suscipit atque blanditiis ab! Obcaecati eaque dolor nihil id non repellendus enim deserunt voluptate! Aliquid. Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora nulla incidunt fuga eveniet voluptatum quos suscipit atque blanditiis ab! Obcaecati eaque dolor nihil id non repellendus enim deserunt voluptate! Aliquid.",
    price: 1799.0,
    img: "https://imgs.search.brave.com/jHturDrTb5p9h6e67ksWeq1E7MVGcNIcmP-TwSGDSiU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vRHNXT252/b3E2YU5fb2p0bUZ1/cUQzaE5qaVNZQW92/U09idE1xU3p5WTB2/VS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpnMU1UVTBO/UzFOVEVFMC9NVFV3/T1RrNE5qa3dPRjh3/L05ESXdNakF0UlM1/M1pXSnc",
    deliveredAt: "8 de mayo, 2025",
    status: "Entregado",
  },
  {
    id: 3,
    name: "Motosierra",
    brand: "Husqvarna",
    description: "Motosierra de poda 35 cm³, liviana y potente",
    price: 2599.0,
    img: "https://imgs.search.brave.com/rVmrKXsTcjhgLeSPZU4mahTzhwsIrQUZwbeS_FZHQUQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vU3hMTldO/SF8wUHJ3a1ljWDJz/ckxRRVlqRWw3Wnhi/WmpJci1sbVdqSlhR/Yy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHprNE5EWXlN/aTFOVEVFMC9NVEUz/T1RFd016WXpOVjh3/L016SXdNakF0UlM1/M1pXSnc",
    deliveredAt: "12 de mayo, 2025",
    status: "En tránsito",
  },
  {
    id: 4,
    name: "Paleta de albañil",
    brand: "Marshaltown",
    description: "Paleta angular de acero inoxidable 280 mm",
    price: 299.0,
    img: "https://imgs.search.brave.com/_vnY_R1kI6u5KZfua-KvDjOuRA9wLDmtJcvIQmDwtto/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vREx6eVln/dFlpN0dMLWx4QlNC/MXppRzU5SkVpWklS/d2k2VXdLRjRJYUU5/MC9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTl0/TG0xbC9aR2xoTFdG/dFlYcHZiaTVqL2Iy/MHZhVzFoWjJWekww/a3YvTmpGU01YVXJO/RUpuTlV3dS9hbkJu",
    deliveredAt: "9 de mayo, 2025",
    status: "Entregado",
  },
  {
    id: 5,
    name: "Nivel de burbuja",
    brand: "Cipsa",
    description: "Nivel torpedo 32 cm con imán lateral",
    price: 149.0,
    img: "https://imgs.search.brave.com/I642UE2fPSBuaecAt1fjalx1UVF966WIZCr2iW5A2Vo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vd0F2Wm9B/d3J6eG01WEk5aGVv/Q2tlelVuRGZZNWtj/NWdBNWJveXNVM05W/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpnek16RTJO/UzFOVEUwNC9NVEUx/T0RNMU5UZzNNRjh4/L01qSXdNalF0UlMx/dGFXNXAvTFc1cGRt/VnNaWFJoTFdOdi9i/aTFwYldGdUxYUnZj/bkJsL1pHOHRjR3ho/YzNScFkyOHQvWVd4/MWJXbHVhVzh0TXkx/aS9kWEppZFdwaGN5/NTNaV0p3",
    deliveredAt: "11 de mayo, 2025",
    status: "Entregado",
  },
];

export default function BuyPanel() {
  const [filterDate, setFilterDate] = useState("");

  // Añade deliveredISO a cada orden
  const ordersWithISO = useMemo(
    () =>
      orders.map((o) => {
        const dateObj = parseSpanishDate(o.deliveredAt);
        const iso = dateObj ? dateObj.toISOString().slice(0, 10) : "";
        return { ...o, deliveredISO: iso };
      }),
    []
  );

  // Filtra según filterDate
  const filtered = useMemo(() => {
    if (!filterDate) return ordersWithISO;
    return ordersWithISO.filter((o) => o.deliveredISO === filterDate);
  }, [filterDate, ordersWithISO]);

  return (
    <div className="w-full bg-stone-100 min-h-screen pb-10 pt-26">
      {/* Header y filtro */}
      <div className="flex flex-col sm:flex-row items-center justify-between mx-4 mb-6 border-b border-gray-400 pb-3">
        <h1 className="text-3xl font-semibold">ComprasMAQ</h1>
        <div className="">
          <label className="mr-2 font-medium">Filtrar fecha:</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-0 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate("")}
              className="ml-2 text-sm text-gray-600 hover:underline"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de compras */}
      <Link to="/user-shopping">
        <div className="max-w-6xl mx-auto px-4 grid gap-6">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No hay compras en esa fecha.
            </p>
          ) : (
            filtered.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500">
                <div className="mt-2 flex items-center text-lg text-gray-600 pl-5 py-3 border-b-2">
                  <span className="font-medium">{order.deliveredAt}</span>
                </div>
                <div className="px-10 py-4 flex items-center">
                  <img
                    src={order.img}
                    alt={order.name}
                    className="w-40 h-40 object-cover rounded"
                  />
                  <div className="flex-1 ml-4">
                    <h2 className="text-2xl font-semibold">{order.name}</h2>
                    <p className="text-lg text-gray-600">{order.brand}</p>
                    <p className="mt-1 text-gray-700 md:line-clamp-3 w-[80%] text-justify">{order.description}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-semibold">
                      ${order.price.toLocaleString()}
                    </span>
                    <span
                      className={`mt-2 px-2 py-1 rounded-full text-sm font-medium ${
                        order.status === "Entregado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Link>
    </div>
  );
}
