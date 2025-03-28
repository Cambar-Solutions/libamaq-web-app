
// Page.jsx (dashboard)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardImg from "@/components/ui/CardImg";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const cardData = [
  { id: 1, title: "Taladro reversible", model: "GBM 1600 RE", img: "/hG3Liriw.png" },
  { id: 2, title: "Sierra Ingleteadora", model: "GCM 254", img: "/E9mJXFeQ.png" },
  { id: 3, title: "Taladro reversible", model: "GBM 16-2 RE", img: "/taladroo.png" },
];

const CardComponent = ({ title, model, img, onClick }) => (
  <Card className="cursor-pointer" onClick={onClick}>
    <CardHeader>
      <CardImg img={img} altText={title} />
      <CardTitle>{title}</CardTitle>
      <CardDescription>{model}</CardDescription>
    </CardHeader>
  </Card>
);

export default function Page() {
  const [newCard, setNewCard] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    localStorage.setItem("detalleProducto", JSON.stringify(card));
    navigate("/producto-detalle");
  };

  useEffect(() => {
    const stored = localStorage.getItem("nuevoProducto");
    if (stored) {
      setNewCard(JSON.parse(stored));
      localStorage.removeItem("nuevoProducto");
    }
  }, []);

  return (
    <div className="[--header-height:calc(theme(spacing.14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/nuevo-producto")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
                >
                  + Agregar producto
                </button>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {newCard && !cardData.some(c => c.title === newCard.title) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <CardComponent {...newCard} onClick={() => handleCardClick(newCard)} />
                  </motion.div>
                )}
                {cardData.map((card) => (
                  <CardComponent key={card.id} {...card} onClick={() => handleCardClick(card)} />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
