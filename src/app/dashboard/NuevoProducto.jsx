import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NuevoProducto() {
  const navigate = useNavigate();

  const [producto, setProducto] = useState({
    title: "",
    model: "",
    brand: "",
    color: "",
    description: "",
    features: [],
    highlights: "",
    applications: "",
    downloads: [],
    img: "",
    price: "", // aseguramos que esté en el objeto
  });

  const [preview, setPreview] = useState(null);
  const [featureInput, setFeatureInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [formError, setFormError] = useState("");

  const brands = [
    { name: "Bosch", color: "#005493" },
    { name: "Makita", color: "#007B8A" },
    { name: "Honda", color: "#DA0019" },
    { name: "Cipsa", color: "#FDB913" },
    { name: "Marshalltown", color: "#990000" },
    { name: "Mpower", color: "#DA291C" },
    { name: "Husqvarna", color: "#003764" },
  ];

  const formatCurrencyMXN = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const floatValue = parseFloat(numericValue) / 100;
    if (isNaN(floatValue)) return "";
    return floatValue.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    });
  };

  const handlePriceChange = (e) => {
    const raw = e.target.value;
    const numericOnly = raw.replace(/[^0-9]/g, "");
    const floatValue = parseFloat(numericOnly) / 100;

    if (!isNaN(floatValue)) {
      setProducto((prev) => ({
        ...prev,
        price: floatValue,
      }));
      setPriceInput(formatCurrencyMXN(numericOnly));
    } else {
      setProducto((prev) => ({ ...prev, price: "" }));
      setPriceInput("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "brand") {
      const selectedBrand = brands.find((b) => b.name === value);
      if (selectedBrand) {
        setProducto((prev) => ({
          ...prev,
          color: selectedBrand.color,
        }));
      }
    }
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
    const files = Array.from(e.target.files).filter((file) => file.type === "application/pdf");
    const fileNames = files.map((file) => file.name);
    setProducto((prev) => ({
      ...prev,
      downloads: fileNames,
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

  const isFormValid = () => {
    return (
      producto.title.trim() &&
      producto.model.trim() &&
      producto.brand.trim() &&
      producto.color.trim() &&
      producto.description.trim() &&
      producto.features.length > 0 &&
      producto.highlights.trim() &&
      producto.applications.trim() &&
      producto.price &&
      producto.img &&
      producto.downloads.length > 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setFormError("Por favor, completa todos los campos antes de guardar.");
      return;
    }
    setFormError(""); // limpiar error si ya está todo bien
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

          <select name="brand" value={producto.brand} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Selecciona una marca</option>
            {brands.map((brand, index) => (
              <option key={index} value={brand.name}>
                {brand.name}
              </option>
            ))}
          </select>

          <div className="flex flex-col items-center gap-2 bg-amber-50 border-1 rounded-2xl">
            <div className="flex items-center bg-white px-3 py-1 rounded w-full rounded-t-2xl">
              <div className="mx-auto flex gap-10 items-center">
                <label>Color de la marca:</label>
                <input type="color" name="color" value={producto.color} onChange={handleChange} className="w-15 h-8 border p-1 rounded-lg" />
              </div>
            </div>
            <p>Recuerda que este color se verá en ciertos componentes de tu producto.</p>
          </div>

          <input
            name="price"
            placeholder="Precio"
            value={priceInput}
            onChange={handlePriceChange}
            className="w-full border p-2 rounded"
          />

          <textarea name="description" placeholder="Descripción" value={producto.description} onChange={handleChange} className="w-full border p-2 rounded" />

          <div>
            <label>Características principales</label>
            <div className="flex gap-2 mt-1">
              <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" />
              <button type="button" onClick={addFeature} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Añadir</button>
            </div>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
              {producto.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <textarea name="highlights" placeholder="Aspectos destacados" value={producto.highlights} onChange={handleChange} className="w-full border p-2 rounded" />
          <textarea name="applications" placeholder="Equipos y aplicaciones" value={producto.applications} onChange={handleChange} className="w-full border p-2 rounded" />

          <div className="flex-col flex gap-2">
            <p className="font-bold mb-0">Selecciona una imagen para tu producto:</p>
            <input type="file" accept="image/*" onChange={handleImageChange} className="border-1 p-2 max-w-3/4 rounded-2xl hover:scale-102 hover:bg-blue-50" />
            <p className="font-bold mb-0">Selecciona archivos para la descargas:</p>
            <input type="file" accept=".pdf" multiple onChange={handlePdfChange} className="border-1 p-2 max-w-3/4 rounded-2xl hover:scale-102 hover:bg-blue-50" />
            {preview && <img src={preview} alt="preview" className="mt-4 h-32 object-contain mx-auto" />}
          </div>

          {formError && (
            <p className="text-red-600 text-sm font-semibold">{formError}</p>
          )}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
        </form>
      </div>
    </div>
  );
}
