import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NuevoProducto() {
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    title: "",
    model: "",
    description: "",
    features: [],
    highlights: "",
    applications: "",
    downloads: [],
    img: "",
  });

  const [preview, setPreview] = useState(null);
  const [featureInput, setFeatureInput] = useState("");

  const handleChange = (e) => {
    setProducto({
      ...producto,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      setProducto({ ...producto, img: url });
    }
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === "application/pdf");
    const fileNames = files.map(file => file.name);
    setProducto(prev => ({
      ...prev,
      downloads: fileNames
    }));
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setProducto({
        ...producto,
        features: [...producto.features, featureInput.trim()],
      });
      setFeatureInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("nuevoProducto", JSON.stringify(producto));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar nuevo producto</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input name="title" placeholder="Nombre del producto" value={producto.title} onChange={handleChange} className="w-full border p-2 rounded" />
          <input name="model" placeholder="Modelo" value={producto.model} onChange={handleChange} className="w-full border p-2 rounded" />
          <textarea name="description" placeholder="Descripción" value={producto.description} onChange={handleChange} className="w-full border p-2 rounded" />

          <div>
            <label>Características principales</label>
            <div className="flex gap-2 mt-1">
              <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
              <button type="button" onClick={addFeature} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Añadir</button>
            </div>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
              {producto.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          <textarea name="highlights" placeholder="Aspectos destacados" value={producto.highlights} onChange={handleChange} className="w-full border p-2 rounded" />
          <textarea name="applications" placeholder="Equipos y aplicaciones" value={producto.applications} onChange={handleChange} className="w-full border p-2 rounded" />
          
          
          
          <div className="flex-col flex gap-5">
          <input type="file" accept=".pdf" multiple onChange={handlePdfChange} className="border-1 p-2 max-w-3/4 rounded-2xl" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="border-1 p-2 max-w-3/4 rounded-2xl" />
          {preview && <img src={preview} alt="preview" className="mt-4 h-32 object-contain mx-auto" />}
          </div>
       

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </form>
      </div>
    </div>
  );
}
