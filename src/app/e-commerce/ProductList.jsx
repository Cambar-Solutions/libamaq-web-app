import { Button } from "@/components/ui/button"; // Suponiendo que usas tu propio componente Button
import Nav from "./Nav";
import SearchBar from "./SearchBar";

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
      {/* Imagen del producto */}
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        {/* Nombre del producto */}
        <h4 className="text-xl font-semibold text-gray-900 truncate">{product.name}</h4>

        {/* Precio */}
        <p className="text-lg text-gray-700 mt-2 truncate">${product.price}</p>

        {/* Botones */}
        <div className="mt-4 flex flex-col space-y-2 w-3/4  mx-auto ">
          <Button className="bg-white text-blue-700 rounded-full border-2 border-blue-700 py-2 px-4 hover:scale-105">
            Agregar al carrito
          </Button>
          <Button className="bg-blue-700 text-white rounded-full py-2 px-4 hover:bg-blue-600">
            Comprar ahora
          </Button>
        </div>

       
      </div>
    </div>
  );
};

const ProductList = () => {
  // Lista de productos duplicada para más ejemplos
  const products = [
    { name: "Atornillador GDS-18", price: "1400", image: "/path-to-image.jpg" },
    { name: "Amoledora angular GW", price: "6450", image: "/path-to-image.jpg" },
    { name: "Taladro inalámbrico HDX-10", price: "1200", image: "/path-to-image.jpg" },
    { name: "Sierra circular 45", price: "3500", image: "/path-to-image.jpg" },
    { name: "Lijadora orbital 5500", price: "2900", image: "/path-to-image.jpg" },
    { name: "Compresor de aire CA-100", price: "5000", image: "/path-to-image.jpg" },
    { name: "Atornillador GDS-18", price: "1400", image: "/path-to-image.jpg" },
    { name: "Amoledora angular GW", price: "6450", image: "/path-to-image.jpg" },
    { name: "Taladro inalámbrico HDX-10", price: "1200", image: "/path-to-image.jpg" },
    { name: "Sierra circular 45", price: "3500", image: "/path-to-image.jpg" },
    { name: "Lijadora orbital 5500", price: "2900", image: "/path-to-image.jpg" },
    { name: "Compresor de aire CA-100", price: "5000", image: "/path-to-image.jpg" },
  ];

  return (
    <>
      <Nav />
      <div className="mt-[10em]"> {/* Añadimos mt-20 para que el contenido se separe de la barra de búsqueda */}
        <SearchBar />
        <div className="py-10 px-6">
          <h2 className="text-3xl font-bold text-gray-900">Productos destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 mt-8">
            {/* Mostrar solo los primeros 5 productos */}
            {products.slice(0, 5).map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>

          {/* Los mejores */}
          <h2 className="text-3xl font-bold text-gray-900 mt-16">Los mejores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 mt-8">
            {/* Mostrar solo los primeros 5 productos */}
            {products.slice(0, 5).map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductList;
