// ProductoDetalle.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProductoDetalle() {
  const [producto, setProducto] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("detalleProducto");
    if (stored) {
      setProducto(JSON.parse(stored));
    } else {
      navigate("/dashboard");
    }
  }, []);

  if (!producto) return null;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <button onClick={() => navigate("/dashboard")} className="text-blue-600 mb-4 hover:underline">← Volver</button>
        
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{producto.title}</h1>
          <span className="text-xl font-semibold text-green-700">
            {Number(producto.price).toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          </span>
        </div>

        <p className="text-gray-600">Modelo: {producto.model}</p>
        <p className="text-gray-600">Marca: {producto.brand}</p>
        
        {producto.color && (
          <div className="flex items-center gap-2 my-2">
            <span className="text-sm text-gray-700">Color de marca:</span>
            <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: producto.color }} />
          </div>
        )}

        <img src={producto.img} alt={producto.title} className="h-48 object-contain mx-auto my-4" />
        <p className="mb-4 text-gray-700">{producto.description}</p>

        {producto.features?.length > 0 && (
          <div className="mb-4">
            <strong>Características:</strong>
            <ul className="list-disc ml-6">
              {producto.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        {producto.highlights && <p><strong>Destacados:</strong> {producto.highlights}</p>}
        {producto.applications && <p className="mt-2"><strong>Aplicaciones:</strong> {producto.applications}</p>}

        {producto.downloads?.length > 0 && (
          <div className="mt-4">
            <strong>Archivos PDF:</strong>
            <ul className="list-disc ml-6">
              {producto.downloads.map((pdf, i) => <li key={i}>{pdf}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
