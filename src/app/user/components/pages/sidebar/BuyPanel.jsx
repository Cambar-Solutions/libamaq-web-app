import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FilterByDate from "../../molecules/FilterByDate";
import CardCarProducts from "../../organisms/buyPanel/CardCarProducts";
import CardsDetail from "../../organisms/buyPanel/CardsDetail";
import Breadcrumb_Buy from "../../atoms/Breadcrumb_Buy";

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
        address: "Carr Federal México-Cuautla Cuautla, Mor.",
        pay: "Transferencia"
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
        address: "Blvd. Paseo Cuauhnáhuac Jiutepec, Mor.",
        pay: "Efectivo"
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
        address: "San Antón, Avenida del Salto 112",
        pay: "Transferencia"
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
        address: "Ciudad Chapultepec, Rojas 21",
        pay: "Efectivo"
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
        address: "Centro Jiutepec, Martirez de la Revolución 125",
        pay: "Efectivo"
    },
];

const slideVariants = {
    initial: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
    animate: { x: "0%" },
    exit: (dir) => ({ x: dir > 0 ? "100%" : "100%" }),
};

export default function BuyPanel() {
    const [filterDate, setFilterDate] = useState("");
    const [selected, setSelected] = useState(null);
    const direction = selected ? 1 : -1; // control de dirección

    // Prepara deliveredISO
    const ordersWithISO = useMemo(() =>
        orders.map(o => {
            const d = parseSpanishDate(o.deliveredAt);
            return { ...o, deliveredISO: d?.toISOString().slice(0, 10) || "" };
        }), []
    );
    const filtered = useMemo(() => {
        if (!filterDate) return ordersWithISO;
        return ordersWithISO.filter(o => o.deliveredISO === filterDate);
    }, [filterDate, ordersWithISO]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-22 p-4">
                <div className=" max-w-7xl mx-auto px-2 sm:px-4 sticky top-16 z-10 p-2 sm:p-3">
                    {/* Cabecera + filtro */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mx-4 mb-6 border-b border-gray-400 pb-3 px-0">
                        <div>
                            <h1 className="text-3xl font-semibold text-indigo-950">Mis Compras</h1>
                            <p className="text-base text-gray-400 font-semibold">Aquí puedes ver tus compras realizadas
                            </p>
                        </div>

                        {/* Filtro por fecha */}
                        <FilterByDate
                            filterDate={filterDate}
                            setFilterDate={setFilterDate}
                        />
                    </div>

                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        {selected === null ? (
                            // LISTADO DE CARDS
                            <motion.div
                                key="list"
                                custom={direction}
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                {/* CARD MIS COMPRAS */}
                                <CardCarProducts
                                    filtered={filtered}
                                    setSelected={setSelected}
                                />
                            </motion.div>
                        ) : (
                            // VISTA DE DETALLE INLINE
                            <motion.div
                                key="detail"
                                custom={-direction}
                                variants={slideVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="absolute inset-0 min-h-screen bg-stone-100 overflow-y-auto pt-6 pb-0 lg:pb-0"
                            >
                                {/* Breadcrumb “Compras” como volver */}
                                <Breadcrumb_Buy
                                    setSelected={setSelected}
                                />

                                {/* Tres cards de detalle */}
                                <CardsDetail
                                    selected={selected}
                                />

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}