import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { motion } from "framer-motion";

const products = [
    {
        id: 1,
        name: "Taladro percutor",
        brand: "Bosch",
        description: "Taladro percutor 500 W con mango antideslizante",
        price: 1299.0,
        img: "https://imgs.search.brave.com/mV4uQJWhbZAtQsBdsI5LlJm_K4w9lRp8XPjxRSGXUgk/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vMkFDcVJf/T3Bfd0VkSzhsdGtj/TVV0aTN3eHlVd2pt/c1hLTTRSTUdrbDlW/RS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpZek16RXdO/QzFOVEZVMy9Namcx/TURjMU5EWTBObDh4/L01USXdNak10UlM1/M1pXSnc",
        startRentalDate: "10 de mayo, 2025",
        endRentalDate: "20 de mayo, 2025",
        status: "Rentado",
        seRealizoEn: "Carr Federal México-Cuautla Cuautla, Mor.",
        seEntregoEn: "Tejalpa, Av. los Gallos 111",
        pay: "Transferencia"
    },
    {
        id: 2,
        name: "Sierra circular",
        brand: "Makita",
        description: "Sierra circular 185 mm con guía láser Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora nulla incidunt fuga eveniet voluptatum quos suscipit atque blanditiis ab! Obcaecati eaque dolor nihil id non repellendus enim deserunt voluptate! Aliquid. Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora nulla incidunt fuga eveniet voluptatum quos suscipit atque blanditiis ab! Obcaecati eaque dolor nihil id non repellendus enim deserunt voluptate! Aliquid.",
        price: 1799.0,
        img: "https://imgs.search.brave.com/jHturDrTb5p9h6e67ksWeq1E7MVGcNIcmP-TwSGDSiU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vRHNXT252/b3E2YU5fb2p0bUZ1/cUQzaE5qaVNZQW92/U09idE1xU3p5WTB2/VS9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpnMU1UVTBO/UzFOVEVFMC9NVFV3/T1RrNE5qa3dPRjh3/L05ESXdNakF0UlM1/M1pXSnc",
        startRentalDate: "16 de abril, 2025",
        endRentalDate: "En renta",
        seRealizoEn: "Carr Federal México-Cuautla Cuautla, Mor.",
        seEntregoEn: "Civac, calle Morelos 12",
        status: "En renta",
        pay: "Efectivo"
    },
    {
        id: 3,
        name: "Motosierra",
        brand: "Husqvarna",
        description: "Motosierra de poda 35 cm³, liviana y potente",
        price: 2599.0,
        img: "https://imgs.search.brave.com/rVmrKXsTcjhgLeSPZU4mahTzhwsIrQUZwbeS_FZHQUQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vU3hMTldO/SF8wUHJ3a1ljWDJz/ckxRRVlqRWw3Wnhi/WmpJci1sbVdqSlhR/Yy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHprNE5EWXlN/aTFOVEVFMC9NVEUz/T1RFd016WXpOVjh3/L016SXdNakF0UlM1/M1pXSnc",
        startRentalDate: "10 de febrero, 2025",
        endRentalDate: "20 de mayo, 2025",
        status: "Rentado",
        seRealizoEn: "Carr Federal México-Cuautla Cuautla, Mor.",
        seEntregoEn: "Cuernavaca, Av. Plan de Ayala 111",
        pay: "Transferencia"
    },
    {
        id: 4,
        name: "Paleta de albañil",
        brand: "Marshaltown",
        description: "Paleta angular de acero inoxidable 280 mm",
        price: 299.0,
        img: "https://imgs.search.brave.com/_vnY_R1kI6u5KZfua-KvDjOuRA9wLDmtJcvIQmDwtto/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vREx6eVln/dFlpN0dMLWx4QlNC/MXppRzU5SkVpWklS/d2k2VXdLRjRJYUU5/MC9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTl0/TG0xbC9aR2xoTFdG/dFlYcHZiaTVqL2Iy/MHZhVzFoWjJWekww/a3YvTmpGU01YVXJO/RUpuTlV3dS9hbkJu",
        startRentalDate: "1 de mayo, 2025",
        endRentalDate: "En renta",
        status: "En renta",
        seRealizoEn: "Blvd. Paseo Cuauhnáhuac Jiutepec, Mor.",
        seEntregoEn: "Tejalpa, av. los Gallos 111",
        pay: "Efectivo"
    },
    {
        id: 5,
        name: "Nivel de burbuja",
        brand: "Cipsa",
        description: "Nivel torpedo 32 cm con imán lateral",
        price: 149.0,
        img: "https://imgs.search.brave.com/I642UE2fPSBuaecAt1fjalx1UVF966WIZCr2iW5A2Vo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vd0F2Wm9B/d3J6eG01WEk5aGVv/Q2tlelVuRGZZNWtj/NWdBNWJveXNVM05W/dy9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlv/ZEhSdy9NaTV0YkhO/MFlYUnBZeTVqL2Iy/MHZSRjlSWDA1UVh6/SlkvWHpnek16RTJO/UzFOVEUwNC9NVEUx/T0RNMU5UZzNNRjh4/L01qSXdNalF0UlMx/dGFXNXAvTFc1cGRt/VnNaWFJoTFdOdi9i/aTFwYldGdUxYUnZj/bkJsL1pHOHRjR3ho/YzNScFkyOHQvWVd4/MWJXbHVhVzh0TXkx/aS9kWEppZFdwaGN5/NTNaV0p3",
        startRentalDate: "1 de enero, 2025",
        endRentalDate: "20 de enero, 2025",
        status: "Rentado",
        seRealizoEn: "Carr Federal México-Cuautla Cuautla, Mor.",
        seEntregoEn: "Cuernavaca, Av. del Salto 99",
        pay: "Efectivo"
    },
];

export default function RentalPanel() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-22 p-4">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 sticky top-16 z-10 mb-6 p-2 sm:p-3">
                    <div className="m-2 border-b border-gray-400 mb-5">
                        <h1 className="text-3xl font-semibold text-indigo-950">Mis Rentas</h1>
                        <p className="text-base text-gray-400 font-semibold mb-3">Aquí podrás ver las rentas que has realizado y las que están en curso
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        {products.map((prod) => {
                            return (
                                <Dialog key={prod.id}>
                                    <DialogTrigger asChild>
                                        <div
                                            key={prod.id}
                                            className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 cursor-pointer"
                                        >
                                            <div className="px-10 py-4 flex mb-5 flex-col sm:flex-row items-center sm:items-center">
                                                <img
                                                    src={prod.img}
                                                    alt={prod.name}
                                                    className="w-40 h-40 sm:h-48 object-cover rounded"
                                                />
                                                <div className="flex-1 ml-4 sm:mt-0 sm:ml-4">
                                                    <h2 className="text-2xl font-semibold">{prod.name}</h2>
                                                    <p className="text-lg text-gray-600">{prod.brand}</p>
                                                    <p className="mt-1 text-gray-700 line-clamp-3 w-[80%] text-justify">
                                                        {prod.description}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xl font-semibold">
                                                        ${prod.price.toLocaleString()}
                                                    </span>
                                                    <span
                                                        className={`mt-2 px-2 py-1 rounded-full text-sm font-medium ${prod.status === "Rentado"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-yellow-100 text-yellow-800"
                                                            }`}
                                                    >
                                                        {prod.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader className="gap-0">
                                            <DialogTitle className="text-3xl font-semibold">{prod.name}</DialogTitle>
                                            <DialogDescription className="mt-0 text-gray-500 line-clamp-2">
                                                {prod.description}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex mr-13 justify-end sm:justify-center ">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm font-medium ${prod.status === "Rentado"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                Estado: {prod.status}
                                            </span>
                                        </div>
                                        <div className="w-[90%] mx-auto mt-0 grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-600 mt-2">Inicio de renta</dt>
                                                <dd className="mt-1 text-gray-900">{prod.startRentalDate}</dd>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-600 mt-2">Fin de renta</dt>
                                                <dd className="mt-0 text-gray-900">{prod.endRentalDate}</dd>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-600 mt-2">Se realizó en</dt>
                                                <dd className="mt-0 text-gray-900">{prod.seRealizoEn}</dd>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-1">
                                                <dt className="text-sm font-medium text-gray-600 mt-2">Se entregó en</dt>
                                                <dd className="mt-0 text-gray-900">{prod.seEntregoEn}</dd>
                                            </div>

                                            <div className="bg-gray-50 p-4 rounded-2xl shadow-sm sm:col-span-2">
                                                <dt className="text-sm font-medium text-gray-600">Detalles del Pago</dt>
                                                <dd className="mt-0 text-gray-900">Método de pago: {prod.pay}</dd>
                                                <dd className="mt-0 text-gray-900">Precio: ${prod.price}</dd>
                                            </div>
                                        </div>
                                        <DialogFooter className="">
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}