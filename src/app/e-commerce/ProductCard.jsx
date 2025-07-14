import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProductCard({ product }) {
  return (
    <Link to={`/producto/${product.id}`} className="w-full">
      <Card className="h-[25em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden mx-auto w-full cursor-pointer group">
        <CardHeader className="flex items-center justify-center p-0 h-[10em] overflow-hidden">
          <img
            src={product.media && product.media.length > 0 ? product.media[0].url : "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-108 transition-all duration-800"
          />
        </CardHeader>
        <CardContent className="flex flex-col flex-grow justify-between p-3 mt-2">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2" title={product.name}>{product.name}</CardTitle>
          <CardDescription className="text-gray-600 mt-1 line-clamp-3" title={product.description}>{product.description}</CardDescription>
          {product.price && <p className="mt-auto pt-2 font-bold text-2xl text-blue-700">${product.price.toLocaleString()}</p>}
        </CardContent>
      </Card>
    </Link>
  );
} 