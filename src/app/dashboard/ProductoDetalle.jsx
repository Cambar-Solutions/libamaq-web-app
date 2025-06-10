import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [producto, setProducto] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    // Agrega más campos según sea necesario
  });

  useEffect(() => {
    if (id && id !== 'nuevo') {
      cargarProducto();
    } else {
      setLoading(false);
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      // Aquí iría la llamada a tu API para obtener los detalles del producto
      // const response = await obtenerProductoPorId(id);
      // setProducto(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar el producto:', error);
      toast.error('No se pudo cargar el producto');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Aquí iría la lógica para guardar/actualizar el producto
      // if (id === 'nuevo') {
      //   await crearProducto(producto);
      // } else {
      //   await actualizarProducto(id, producto);
      // }
      toast.success(`Producto ${id === 'nuevo' ? 'creado' : 'actualizado'} correctamente`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id === 'nuevo' ? 'Nuevo Producto' : 'Editar Producto'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={producto.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={producto.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={producto.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={producto.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            {/* Agrega más campos según sea necesario */}
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/productos')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProductoDetalle;
