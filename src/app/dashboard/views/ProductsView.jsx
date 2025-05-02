import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const CardComponent = ({ product, onClick }) => {
  const getImageUrl = () => {
    if (product.multimedia?.length) {
      return product.multimedia[0].url;
    }
    return product.brand?.logoUrl || "";
  };

  const bg = product.color || "#e5e7eb";

  return (
    <Card
      onClick={onClick}
      className="
        cursor-pointer
        filter grayscale-[40%] hover:grayscale-0
        transition-filter duration-500
      "
    >
      <CardHeader>
        <div className="relative w-full h-48 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              if (product.brand?.logoUrl) {
                e.target.src = product.brand.logoUrl;
              }
            }}
          />
        </div>
      </CardHeader>

      <div
        className="rounded-b-xl w-full px-6 py-3 text-white"
        style={{ backgroundColor: bg }}
      >
        <CardTitle>{product.name}</CardTitle>
        <CardDescription>
          <div className="flex flex-col text-white">
            <span>ID: {product.externalId}</span>
            <span>Marca: {product.brand?.name || "Sin marca"}</span>
          </div>
        </CardDescription>
      </div>
    </Card>
  );
};

export default CardComponent;
