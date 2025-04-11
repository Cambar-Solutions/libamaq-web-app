import { motion } from "framer-motion";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CardImg from "@/components/ui/CardImg";
import { useNavigate } from "react-router-dom";

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

export function ProductsView() {
  const navigate = useNavigate();

  const handleCardClick = (card) => {
    localStorage.setItem("detalleProducto", JSON.stringify(card));
    navigate("/producto-detalle");
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/nuevo-producto")}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Agregar producto
        </button>
      </div>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cardData.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CardComponent {...card} onClick={() => handleCardClick(card)} />
          </motion.div>
        ))}
      </div>
    </>
  );
}
