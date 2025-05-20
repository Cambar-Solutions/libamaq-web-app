import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { createProduct } from "@/services/admin/productService";
import { getAllBrands } from "@/services/admin/brandService";
import { getAllCategories } from "@/services/admin/categoryService";
import { createMultimedia } from "@/services/admin/multimediaService";

export default function NuevoProducto() {
  const navigate = useNavigate();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [producto, setProducto] = useState({
    externalId: "",
    name: "",
    color: "#000000",
    shortDescription: "",
    description: JSON.stringify({
      caracteristicas: "",
      details: "",
      aplicaciones: "",
      destacados: "",
    }),
    type: "",
    productUsage: "",
    cost: 0,
    price: 0,
    discount: 0,
    stock: 0,
    garanty: 0,
    technicalData: { potencia: "", peso: "", impactos: "", velocidad: "" },
    functionalities: { modos: "", control: "", encastre: "" },
    downloads: { manual: "", ficha_tecnica: "" },
    status: "ACTIVE",
    brandId: "",
    productCategories: [],
    productMultimediaDto: [],
    multimedia: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [brandsResponse, categoriesResponse] = await Promise.all([getAllBrands(), getAllCategories()]);
        
        // Verificar si la respuesta de marcas tiene la estructura esperada
        const brandsData = Array.isArray(brandsResponse) 
          ? brandsResponse 
          : (brandsResponse?.data || []);

        // Verificar si la respuesta de categorías tiene la estructura esperada
        const categoriesData = Array.isArray(categoriesResponse) 
          ? categoriesResponse 
          : (categoriesResponse?.result || []);
        
        console.log('Marcas procesadas:', brandsData);
        console.log('Categorías procesadas:', categoriesData);
        
        setBrands(brandsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error al cargar marcas o categorías:', err);
        toast.error("Error al cargar marcas o categorías");
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "brandId") {
      const sel = brands.find((b) => b.id === +value);
      setProducto((p) => ({ ...p, brandId: value, color: sel?.color || p.color }));
    } else {
      setProducto((p) => ({ ...p, [name]: value }));
    }
  };

  const handleJsonFieldChange = (section, key, value) => {
    setProducto((p) => ({ ...p, [section]: { ...p[section], [key]: value } }));
  };

  const handleAddField = (section) => {
    setProducto((p) => ({ ...p, [section]: { ...p[section], [`nueva_${Date.now()}`]: "" } }));
  };

  const handleRemoveField = (section, key) => {
    setProducto((p) => {
      const sec = { ...p[section] };
      delete sec[key];
      return { ...p, [section]: sec };
    });
  };

  const renderJsonFields = (section, title) => (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <button
          type="button"
          onClick={() => handleAddField(section)}
          className="text-blue-600 hover:underline text-sm"
        >
          + Agregar campo
        </button>
      </div>
      <div className="space-y-3">
        {Object.entries(producto[section]).map(([key, val]) => (
          <div key={key} className="flex gap-2 items-start">
            <Input
              value={key}
              onChange={(e) => {
                const newKey = e.target.value;
                const oldVal = producto[section][key];
                handleRemoveField(section, key);
                handleJsonFieldChange(section, newKey, oldVal);
              }}
              className="flex-1"
              placeholder="Clave"
            />
            <Textarea
              value={val}
              onChange={(e) => handleJsonFieldChange(section, key, e.target.value)}
              className="flex-1 "
              rows={2}
              placeholder="Valor"
            />
            <button
              type="button"
              onClick={() => handleRemoveField(section, key)}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const handleCategoryChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (o) => +o.value
    ).map((id) => ({ productId: 0, categoryId: id }));
    setProducto((p) => ({ ...p, productCategories: selected }));
  };

  const handleDescriptionChange = ({ target: { name, value } }) => {
    try {
      const desc = JSON.parse(producto.description);
      desc[name] = value;
      setProducto((p) => ({ ...p, description: JSON.stringify(desc) }));
    } catch {
      // no op
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setIsLoading(true);
    try {
      const results = await Promise.all(
        files.map((f) => createMultimedia(f))
      );
      setUploadedImages((u) => [...u, ...results]);
      setProducto((p) => {
        const base = p.productMultimediaDto.length;
        const novos = results.map((img, i) => ({
          id: 0,
          displayOrder: base + i + 1,
          productId: 0,
          multimediaId: img.id,
        }));
        return {
          ...p,
          productMultimediaDto: [...p.productMultimediaDto, ...novos],
          multimedia: [...p.multimedia, ...results],
        };
      });
      toast.success("Imágenes subidas");
    } catch (err) {
      console.error(err);
      toast.error("Error al subir imágenes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (idx) => {
    setUploadedImages((u) => u.filter((_, i) => i !== idx));
    setProducto((p) => ({
      ...p,
      productMultimediaDto: p.productMultimediaDto.filter((_, i) => i !== idx),
      multimedia: p.multimedia.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        id: 0,
        externalId: producto.externalId,
        name: producto.name,
        color: producto.color,
        shortDescription: producto.shortDescription,
        description: JSON.parse(producto.description),
        type: producto.type,
        productUsage: producto.productUsage,
        cost: +producto.cost,
        price: +producto.price,
        discount: +producto.discount,
        stock: +producto.stock,
        garanty: +producto.garanty,
        technicalData: producto.technicalData,
        functionalities: producto.functionalities,
        downloads: producto.downloads,
        status: producto.status,
        brandId: +producto.brandId,
        categoryId: producto.productCategories[0]?.categoryId ?? 0,
        productMultimediaDto: producto.productMultimediaDto.map((m, i) => ({
          ...m,
          displayOrder: i + 1,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
      };
      await createProduct(payload);
      toast.success("Producto creado");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Error al crear producto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Agregar nuevo producto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="basicos" className="border border-gray-300 rounded-lg mb-4 shadow-sm">
              <AccordionTrigger className="
        px-4 py-3 
        bg-gray-50 hover:bg-gray-100 
        transition 
        data-[state=open]:bg-blue-50 
        data-[state=open]:text-blue-800 
        data-[state=open]:font-semibold
      ">Datos básicos</AccordionTrigger>
              <AccordionContent className="bg-white p-4 border-t border-gray-800 rounded-b-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="externalId">ID Externo</Label>
                    <Input
                      id="externalId"
                      name="externalId"
                      value={producto.externalId}
                      onChange={handleChange}
                      placeholder="EJ: EXT-123"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      name="name"
                      value={producto.name}
                      onChange={handleChange}
                      placeholder="Nombre del producto"
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      type="color"
                      name="color"
                      value={producto.color}
                      onChange={handleChange}
                      className="mt-1 h-10 p-0"
                    />
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <Select
                      onValueChange={(v) =>
                        handleChange({ target: { name: "brandId", value: v } })
                      }
                      value={producto.brandId}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands
                          .filter(b => b.status === 'ACTIVE')
                          .map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {b.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</	Label>
                    <Input
                      id="type"
                      name="type"
                      value={producto.type}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="productUsage">Uso</Label>
                    <Input
                      id="productUsage"
                      name="productUsage"
                      value={producto.productUsage}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost">Costo</Label>
                    <Input
                      id="cost"
                      type="number"
                      name="cost"
                      value={producto.cost}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      name="price"
                      value={producto.price}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Descuento (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      name="discount"
                      value={producto.discount}
                      onChange={handleChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      name="stock"
                      value={producto.stock}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="garanty">Garantía (años)</Label>
                    <Input
                      id="garanty"
                      type="number"
                      name="garanty"
                      value={producto.garanty}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="descripciones" className="border border-gray-300 rounded-lg mb-4 shadow-sm">
              <AccordionTrigger  className="
        px-4 py-3 
        bg-gray-50 hover:bg-gray-100 
        transition 
        data-[state=open]:bg-blue-50 
        data-[state=open]:text-blue-800 
        data-[state=open]:font-semibold
      ">Descripciones</AccordionTrigger>
              <AccordionContent className="bg-white p-4 border-t border-gray-800 rounded-b-2xl">
                <div>
                  <Label htmlFor="shortDescription">Descripción corta</Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={producto.shortDescription}
                    onChange={handleChange}
                    className="mt-1"
                    rows={2}
                    required
                  />
                </div>
                {renderJsonFields("technicalData", "Datos técnicos")}
                {renderJsonFields("functionalities", "Funcionalidades")}
                {renderJsonFields("downloads", "Descargas")}
                <div className="mt-4">
                  <Label>Descripción completa</Label>
                  <div className="space-y-3 mt-2">
                    {Object.entries(JSON.parse(producto.description)).map(
                      ([key, val]) => (
                        <div key={key}>
                          <Label className="capitalize">{key}</Label>
                          <Textarea
                            value={val}
                            onChange={(e) =>
                              handleDescriptionChange({
                                target: { name: key, value: e.target.value },
                              })
                            }
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="clasificacion" className="border border-gray-300 rounded-lg mb-4 shadow-sm">
              <AccordionTrigger className="
        px-4 py-3 
        bg-gray-50 hover:bg-gray-100 
        transition 
        data-[state=open]:bg-blue-50 
        data-[state=open]:text-blue-800 
        data-[state=open]:font-semibold
      ">Clasificación e imágenes</AccordionTrigger>
              <AccordionContent className="bg-white p-4 border-t border-gray-800 rounded-b-2xl">
                <div>
                  <Label>Categorías</Label>
                  <select
                    multiple
                    value={producto.productCategories.map((c) => c.categoryId)}
                    onChange={handleCategoryChange}
                    className="w-full mt-1 border rounded p-2 h-32"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-4">
                  <Label>Imágenes del producto</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.webp"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.url}
                          alt={`Preview ${i + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 text-red-600 opacity-0 group-hover:opacity-100 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
