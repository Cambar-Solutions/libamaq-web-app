import React, { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button';
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

// Icons
import { Drill, Plus, X, Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

// Importa el nuevo servicio de IA
import { generateDescriptionIA } from '@/services/admin/AIService';
// Importa el componente ImageUploader
import ImageUploader from './ImageUploader';

// --- Form Schema for Validation
const editProductSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'El nombre es obligatorio.'),
    shortDescription: z.string().optional(),
    description: z.string().optional(),
    externalId: z.string().optional(),
    brandId: z.string().min(1, 'La marca es obligatoria.'),
    categoryId: z.string().min(1, 'La categoría es obligatoria.'),
    price: z.preprocess(
        (val) => parseFloat(val),
        z.number().min(0.01, 'El precio debe ser mayor a 0.')
    ),
    cost: z.preprocess(
        (val) => (val === '' ? null : parseFloat(val)),
        z.number().min(0, 'El costo no puede ser negativo.').nullable().optional()
    ),
    discount: z.preprocess(
        (val) => parseFloat(val || 0),
        z.number().min(0, 'El descuento no puede ser negativo.').optional()
    ),
    stock: z.preprocess(
        (val) => parseInt(val, 10),
        z.number().int().min(0, 'El stock no puede ser negativo.')
    ),
    garanty: z.preprocess(
        (val) => parseInt(val || 0, 10),
        z.number().int().min(0, 'La garantía no puede ser negativa.').optional()
    ),
    color: z.string().optional(),
    rentable: z.boolean().default(false),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    functionalities: z.array(z.string()).default([]),
    technicalData: z.array(
        z.object({
            key: z.string().min(1, 'La clave es requerida'),
            value: z.string().min(1, 'El valor es requerido')
        })
    ).default([]),
    downloads: z.array(
        z.object({
            key: z.string().min(1, 'El nombre es requerido'),
            value: z.string().min(1, 'La URL es requerida').url('Debe ser una URL válida')
        })
    ).default([]),
    media: z.array(z.any()).default([])
});

// Helper function to set default values
const getDefaultValues = (product) => ({
    id: product?.id || undefined,
    name: product?.name || '',
    shortDescription: product?.shortDescription || '',
    description: product?.description || '',
    externalId: product?.externalId || '',
    brandId: product?.brandId?.toString() || '',
    categoryId: product?.categoryId?.toString() || '',
    price: product?.price || 0,
    cost: product?.cost || '',
    discount: product?.discount || 0,
    stock: product?.stock || 0,
    garanty: product?.garanty || 0,
    color: product?.color || '',
    rentable: product?.rentable || false,
    status: product?.status || 'ACTIVE',
    functionalities: Array.isArray(product?.functionalities) ? product.functionalities : [],
    technicalData: Array.isArray(product?.technicalData) 
        ? product.technicalData 
        : [{ key: '', value: '' }],
    downloads: Array.isArray(product?.downloads) 
        ? product.downloads 
        : [{ key: '', value: '' }],
    media: Array.isArray(product?.media) ? product.media : []
});

const EditProductFormDialog = ({ product, brands = [], categories = [], onSave, onClose }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [productCategories, setProductCategories] = useState([]);
    const [selectedBrandId, setSelectedBrandId] = useState('');
    
    const form = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: getDefaultValues(product)
    });

    // Cargar categorías cuando cambie la marca seleccionada
    useEffect(() => {
        if (product?.brandId) {
            setSelectedBrandId(String(product.brandId));
            loadCategoriesByBrand(product.brandId);
        }
    }, [product]);

    const loadCategoriesByBrand = async (brandId) => {
        try {
            const response = await getCategoriesByBrand(brandId);
            setProductCategories(response.data || []);
        } catch (error) {
            console.error('Error al cargar categorías:', error);
            setProductCategories([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Efecto para actualizar los valores del formulario cuando cambie el producto
    useEffect(() => {
        if (product) {
            console.log('Producto recibido:', product); // Debug
            
            // Formatear technicalData si es un array de strings
            const formatTechnicalData = (data) => {
                if (!data) return [];
                if (Array.isArray(data) && data.length > 0) {
                    if (typeof data[0] === 'string') {
                        return data.map(item => {
                            const [key, ...valueParts] = item.split(':');
                            return {
                                key: key?.trim() || '',
                                value: valueParts.join(':').trim() || ''
                            };
                        });
                    }
                    // Si ya es un array de objetos, asegurarse de que tengan el formato correcto
                    return data.map(item => ({
                        key: item.key || '',
                        value: item.value || ''
                    }));
                }
                return [{ key: '', value: '' }];
            };

            // Asegurarse de que los valores sean correctos antes de resetear
            const defaultValues = {
                ...product,
                // Asegurar que los IDs sean strings
                brandId: String(product.brandId || ''),
                categoryId: String(product.categoryId || ''),
                // Asegurar que los valores numéricos estén presentes
                price: product.price || 0,
                cost: product.cost || '',
                discount: product.discount || 0,
                stock: product.stock || 0,
                garanty: product.garanty || 0,
                // Asegurar que los arrays estén definidos y en el formato correcto
                functionalities: Array.isArray(product.functionalities) 
                    ? product.functionalities 
                    : [],
                technicalData: formatTechnicalData(product.technicalData),
                downloads: Array.isArray(product.downloads) 
                    ? product.downloads.map(dl => ({
                        key: dl.key || '',
                        value: dl.value || ''
                    })) 
                    : [{ key: '', value: '' }],
                // Asegurar que las imágenes tengan la estructura correcta
                media: Array.isArray(product.media) 
                    ? product.media.map(img => ({
                        ...img,
                        id: img.id || Date.now(),
                        url: img.url || '',
                        fileType: img.fileType || 'IMAGE',
                        entityId: img.entityId || product.id,
                        entityType: 'PRODUCT',
                        displayOrder: img.displayOrder || 0
                    })) 
                    : []
            };
            
            console.log('Valores por defecto del formulario:', defaultValues); // Debug
            
            // Usar setTimeout para asegurar que el reset se realice después de que el componente esté montado
            const timer = setTimeout(() => {
                form.reset(defaultValues);
                
                // Si hay un costo, calcular el precio
                if (product.cost) {
                    const precioPublico = calcularPrecioPublico(product.cost);
                    form.setValue('price', precioPublico.toFixed(2));
                    // No sobreescribir el descuento existente
                }
            }, 0);
            
            return () => clearTimeout(timer);
        }
    }, [product, form]);

    const { fields: functionalityFields, append: appendFunctionality, remove: removeFunctionality } = useFieldArray({
        control: form.control,
        name: 'functionalities'
    });

    const { fields: technicalDataFields, append: appendTechnicalData, remove: removeTechnicalData } = useFieldArray({
        control: form.control,
        name: 'technicalData'
    });

    const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
        control: form.control,
        name: 'downloads'
    });

    const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
        control: form.control,
        name: 'media'
    });

    const calcularPrecioConIVA = (precio) => {
        return precio * 1.16;
    };

    const calcularPrecioPublico = (costo) => {
        if (!costo) return 0;
        const precioBase = parseFloat(costo) / 0.8; // División entre 0.8 (20% de ganancia)
        return calcularPrecioConIVA(precioBase);
    };

    const calcularPrecioFrecuente = (costo) => {
        if (!costo) return 0;
        const precioBase = parseFloat(costo) / 0.9; // División entre 0.9 (10% de ganancia)
        return calcularPrecioConIVA(precioBase);
    };

    const handleCostoChange = (e) => {
        const costo = e.target.value;
        form.setValue('cost', costo);
        
        if (costo && parseFloat(costo) > 0) {
            // Calcular y establecer el precio público general
            const precioPublico = calcularPrecioPublico(costo);
            form.setValue('price', precioPublico.toFixed(2));
            
            // Calcular y establecer el descuento para clientes frecuentes
            const precioFrecuente = calcularPrecioFrecuente(costo);
            const descuento = ((precioPublico - precioFrecuente) / precioPublico * 100).toFixed(2);
            form.setValue('discount', parseFloat(descuento));
        } else {
            // Limpiar los campos si el costo es 0 o vacío
            form.setValue('price', '');
            form.setValue('discount', 0);
        }
    };

    const handleEditSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            // Preparar los datos para la API
            const payload = {
                id: product.id, // Asegurarse de incluir el ID del producto
                brandId: data.brandId,
                categoryId: data.categoryId,
                externalId: data.externalId,
                name: data.name,
                shortDescription: data.shortDescription,
                description: data.description,
                price: parseFloat(data.price),
                cost: data.cost ? parseFloat(data.cost) : null,
                discount: parseFloat(data.discount) || 0,
                stock: parseInt(data.stock, 10),
                garanty: parseInt(data.garanty, 10) || 0,
                color: data.color || '',
                rentable: data.rentable || false,
                status: data.status || 'ACTIVE',
                functionalities: data.functionalities || [],
                // Formatear technicalData como array de strings si es necesario
                technicalData: data.technicalData 
                    ? data.technicalData
                        .filter(item => item.key && item.value)
                        .map(item => `${item.key}: ${item.value}`)
                    : [],
                downloads: data.downloads || [],
                // Incluir solo los campos necesarios para las imágenes
                media: data.media.map(media => ({
                    id: media.id,
                    url: media.url,
                    fileType: media.fileType || 'IMAGE',
                    entityId: media.entityId || product.id,
                    entityType: 'PRODUCT',
                    displayOrder: media.displayOrder || 0
                }))
            };

            await onSave(payload); // Enviar los datos al componente padre
            onClose(); // Cerrar el diálogo
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert(`Error al actualizar el producto: ${error.message || error}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateDescription = async () => {
        const productName = form.getValues('name'); // Obtiene el valor del campo 'name'
        if (!productName) {
            alert('Por favor, ingresa un nombre de producto para generar la descripción.');
            return;
        }

        setIsGenerating(true);
        try {
            // Puedes ajustar el 'type' basado en alguna lógica si tienes una forma de detectarlo
            const description = await generateDescriptionIA(productName, "PRODUCT"); // Llama al servicio
            form.setValue('description', description, { shouldValidate: true }); // Establece la descripción en el textarea
        } catch (error) {
            console.error('Error al generar la descripción:', error);
            alert(`Error al generar la descripción: ${error.message || error}`); // Muestra un mensaje de error al usuario
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-4">
                <div className="flex items-center space-x-3">
                    <div className="sm:text-center">
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                            <div className="flex items-center space-x-3">
                                <Drill className="h-6 w-6 text-blue-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Editar Producto</h2>
                            </div>
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm text-gray-500">
                            Realiza cambios en los detalles del producto **{product.name}**. Los campos marcados con * son obligatorios.
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input 
                            id="name" 
                            {...form.register('name', { required: 'El nombre es requerido' })} 
                            placeholder="Ej: Smartphone Galaxy S21" 
                            disabled={isSubmitting} 
                        />
                        {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
                    </div>

                    {/* ID Externo */}
                    <div className="space-y-2">
                        <Label htmlFor="externalId">ID Externo</Label>
                        <Input 
                            id="externalId" 
                            {...form.register('externalId')} 
                            placeholder="Ej: PROD-12345" 
                            disabled={isSubmitting} 
                        />
                    </div>

                    {/* Marca */}
                    <div className="space-y-2">
                        <Label htmlFor="brandId">Marca *</Label>
                        <Controller
                            name="brandId"
                            control={form.control}
                            rules={{ required: 'La marca es requerida' }}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        // Aquí iría la lógica de handleBrandChange si es necesaria
                                    }} 
                                    value={field.value} 
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map(brand => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.brandId && <p className="text-sm text-red-600">{form.formState.errors.brandId.message}</p>}
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Categoría *</Label>
                        <Controller
                            name="categoryId"
                            control={form.control}
                            rules={{ 
                                required: 'La categoría es requerida',
                                validate: value => {
                                    if (!form.watch('brandId')) {
                                        return 'Selecciona una marca primero';
                                    }
                                    return true;
                                }
                            }}
                            render={({ field }) => (
                                <Select 
                                    onValueChange={field.onChange} 
                                    value={field.value} 
                                    disabled={!form.watch('brandId') || isSubmitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue 
                                            placeholder={!form.watch('brandId') 
                                                ? "Selecciona una marca primero" 
                                                : categories.length === 0 
                                                    ? "No hay categorías disponibles"
                                                    : "Selecciona una categoría"
                                            } 
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.length > 0 ? (
                                            categories.map(category => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                No hay categorías disponibles para esta marca
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.categoryId && (
                            <p className="text-sm text-red-600">
                                {form.formState.errors.categoryId.message}
                            </p>
                        )}
                    </div>

                    {/* Costo */}
                    <div className="space-y-2">
                        <Label htmlFor="cost">Costo (sin IVA)</Label>
                        <div className="relative">
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register('cost', { 
                                    required: 'El costo es requerido',
                                    min: { value: 0, message: 'El costo no puede ser negativo' }
                                })}
                                onChange={handleCostoChange}
                                disabled={isSubmitting}
                                className="pl-3"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                MXN
                            </span>
                        </div>
                        {form.formState.errors.cost && (
                            <span className="text-sm text-red-500">
                                {form.formState.errors.cost.message}
                            </span>
                        )}
                    </div>

                    {/* Precio */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio Público General (con IVA)</Label>
                        <div className="relative">
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register('price', { 
                                    required: 'El precio es requerido',
                                    min: { value: 0, message: 'El precio no puede ser negativo' }
                                })}
                                readOnly
                                className="pl-3 bg-gray-50"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                MXN
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Precio calculado automáticamente (Costo / 0.8 + 16% IVA)
                        </p>
                    </div>

                    {/* Descuento */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="discount">Descuento Cliente Frecuente</Label>
                            <span className="text-sm text-gray-500">
                                Precio: ${(form.watch('price') * (1 - (form.watch('discount') || 0) / 100)).toFixed(2)} MXN
                            </span>
                        </div>
                        <div className="relative">
                            <Input
                                id="discount"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                {...form.register('discount', { 
                                    min: { value: 0, message: 'El descuento no puede ser negativo' },
                                    max: { value: 100, message: 'El descuento no puede ser mayor a 100%' }
                                })}
                                disabled={isSubmitting}
                                className="pl-3"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                %
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">
                            Descuento calculado para precio de cliente frecuente (Costo / 0.9 + 16% IVA)
                        </p>
                        {form.formState.errors.discount && (
                            <span className="text-sm text-red-500">
                                {form.formState.errors.discount.message}
                            </span>
                        )}
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input 
                            id="stock" 
                            type="number" 
                            {...form.register('stock', { 
                                required: 'El stock es requerido',
                                min: { value: 0, message: 'El stock no puede ser negativo' }
                            })} 
                            placeholder="0" 
                            disabled={isSubmitting} 
                        />
                        {form.formState.errors.stock && <p className="text-sm text-red-600">{form.formState.errors.stock.message}</p>}
                    </div>

                    {/* Garantía */}
                    <div className="space-y-2">
                        <Label htmlFor="garanty">Garantía (meses)</Label>
                        <Input 
                            id="garanty" 
                            type="number" 
                            {...form.register('garanty', {
                                min: { value: 0, message: 'La garantía no puede ser negativa' }
                            })} 
                            placeholder="12" 
                            disabled={isSubmitting} 
                        />
                        {form.formState.errors.garanty && <p className="text-sm text-red-600">{form.formState.errors.garanty.message}</p>}
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="color">Color</Label>
                            {form.watch('brandId') && (
                                <span 
                                    className="text-xs text-muted-foreground cursor-pointer hover:underline"
                                    onClick={() => {
                                        const selectedBrand = brands.find(b => b.id === form.watch('brandId'));
                                        if (selectedBrand?.color) {
                                            form.setValue('color', selectedBrand.color, { shouldDirty: true });
                                        }
                                    }}
                                >
                                    Usar color de la marca
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Input 
                                    id="color" 
                                    type="text"
                                    {...form.register('color')} 
                                    placeholder="Ej: #1428A0 o Negro" 
                                    disabled={isSubmitting}
                                    className="pl-10"
                                />
                                <input 
                                    type="color" 
                                    value={form.watch('color') || '#ffffff'}
                                    onChange={(e) => form.setValue('color', e.target.value, { shouldDirty: true })}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded overflow-hidden border border-gray-300 cursor-pointer"
                                    title="Seleccionar color"
                                />
                            </div>
                            <div 
                                className="w-10 h-10 rounded-md border flex-shrink-0"
                                style={{ 
                                    backgroundColor: form.watch('color') || 'transparent',
                                    borderColor: 'hsl(var(--border))'
                                }}
                                title={form.watch('color') || 'Sin color'}
                            />
                        </div>
                    </div>

                    {/* Estado y Renta */}
                    <div className="flex items-center justify-between pt-6 md:col-span-2">
                        {/* Estado */}
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Inactivo</span>
                                <Controller
                                    name="status"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Switch
                                            id="status"
                                            checked={field.value === 'ACTIVE'}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked ? 'ACTIVE' : 'INACTIVE');
                                            }}
                                            disabled={isSubmitting}
                                        />
                                    )}
                                />
                                <span className="text-sm font-medium">Activo</span>
                            </div>
                        </div>

                        {/* Rentable */}
                        <div className="flex items-center space-x-2">
                            <Label htmlFor="rentable" className="text-sm font-medium text-gray-700">
                                ¿Disponible para renta?
                            </Label>
                            <Controller
                                name="rentable"
                                control={form.control}
                                render={({ field }) => (
                                    <Switch 
                                        id="rentable" 
                                        checked={field.value} 
                                        onCheckedChange={field.onChange} 
                                        disabled={isSubmitting} 
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Descripción Corta */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="shortDescription">Descripción Corta</Label>
                        <Input 
                            id="shortDescription" 
                            {...form.register('shortDescription')} 
                            placeholder="Smartphone de última generación" 
                            disabled={isSubmitting} 
                        />
                    </div>

                    {/* Descripción Larga */}
                    <div className="space-y-2 md:col-span-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="description">Descripción Larga</Label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || isSubmitting}
                                className="bg-gradient-to-l from-cyan-500 via-violet-500 to-purple-500 text-white hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition cursor-pointer w-full sm:w-auto"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="mr-1 h-3 w-3 animate-spin inline-block" />
                                        Generando...
                                    </>
                                ) : (
                                    'Generar con Gemini'
                                )}
                            </Button>
                        </div>
                        <Textarea 
                            id="description" 
                            {...form.register('description')} 
                            placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..."
                            disabled={isSubmitting}
                            className="min-h-[100px]"
                        />
                    </div>

                    {/* Funcionalidades */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Funcionalidades</Label>
                            <p className="text-sm text-gray-500">Añade funcionalidades del producto.</p>
                        </div>
                        {functionalityFields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                                <Input {...form.register(`functionalities.${index}`)} placeholder="Funcionalidad" className="flex-1" disabled={isSubmitting} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeFunctionality(index)} disabled={isSubmitting}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendFunctionality('')}
                            className="mt-2"
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Funcionalidad
                        </Button>
                    </div>

                    {/* Datos Técnicos */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Datos Técnicos</Label>
                            <p className="text-sm text-gray-500">Añade especificaciones técnicas como potencia, voltaje, etc.</p>
                        </div>
                        {technicalDataFields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                                <Input {...form.register(`technicalData.${index}.key`)} placeholder="Clave (Ej: Potencia)" className="flex-1" disabled={isSubmitting} />
                                <Input {...form.register(`technicalData.${index}.value`)} placeholder="Valor (Ej: 550w)" className="flex-1" disabled={isSubmitting} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeTechnicalData(index)} disabled={isSubmitting}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {(form.formState.errors.technicalData && typeof form.formState.errors.technicalData.message === 'string') && (
                            <p className="text-sm text-red-600">{form.formState.errors.technicalData.message}</p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendTechnicalData({ key: "", value: "" })}
                            className="mt-2"
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Dato Técnico
                        </Button>
                    </div>

                    {/* Descargas */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Descargas</Label>
                            <p className="text-sm text-gray-500">Añade enlaces de descarga para el producto.</p>
                        </div>
                        {downloadFields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                                <Input {...form.register(`downloads.${index}.key`)} placeholder="Nombre del archivo" className="flex-1" disabled={isSubmitting} />
                                <Input {...form.register(`downloads.${index}.value`)} placeholder="URL de descarga" className="flex-1" disabled={isSubmitting} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeDownload(index)} disabled={isSubmitting}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {(form.formState.errors.downloads && typeof form.formState.errors.downloads.message === 'string') && (
                            <p className="text-sm text-red-600">{form.formState.errors.downloads.message}</p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendDownload({ key: "", value: "" })}
                            className="mt-2"
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Descarga
                        </Button>
                    </div>

                    {/* Imágenes del Producto */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Imágenes del Producto</Label>
                            <p className="text-sm text-gray-500">Sube imágenes del producto (máx. 5 imágenes, formato JPG, PNG o WEBP).</p>
                        </div>
                        <Controller
                            name="media"
                            control={form.control}
                            render={({ field: { onChange, value = [] } }) => (
                                <ImageUploader
                                    existingImages={value.filter(m => m?.url)}
                                    onImagesChange={(files) => {
                                        // Convertir archivos a formato compatible con el backend
                                        onChange([...value, ...files.map(file => ({ file }))]);
                                    }}
                                    onImageDelete={(index) => {
                                        // Eliminar la imagen del array
                                        const newMedia = [...value];
                                        newMedia.splice(index, 1);
                                        onChange(newMedia);
                                    }}
                                    maxFiles={5}
                                />
                            )}
                        />
                        {form.formState.errors.media && (
                            <p className="text-sm text-red-600">{form.formState.errors.media.message}</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isSubmitting}>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

EditProductFormDialog.propTypes = {
    product: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        shortDescription: PropTypes.string,
        description: PropTypes.string,
        externalId: PropTypes.string,
        brandId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        categoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        price: PropTypes.number,
        cost: PropTypes.number,
        discount: PropTypes.number,
        stock: PropTypes.number,
        garanty: PropTypes.number,
        color: PropTypes.string,
        rentable: PropTypes.bool,
        status: PropTypes.string,
        functionalities: PropTypes.arrayOf(PropTypes.string),
        technicalData: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string,
                value: PropTypes.string
            })
        ),
        downloads: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string,
                value: PropTypes.string
            })
        ),
        media: PropTypes.arrayOf(PropTypes.any)
    }).isRequired,
    brands: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired
        })
    ),
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired
        })
    ),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

EditProductFormDialog.defaultProps = {
    brands: [],
    categories: []
};

export default EditProductFormDialog;