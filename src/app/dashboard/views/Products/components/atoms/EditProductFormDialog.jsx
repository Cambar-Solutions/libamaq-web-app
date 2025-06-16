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

// --- Form Schema for Validation (adjust as per your actual backend schema) ---
const editProductSchema = z.object({
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
        (val) => parseFloat(val),
        z.number().optional().nullable() // Allow optional cost
    ),
    stock: z.preprocess(
        (val) => parseInt(val, 10),
        z.number().int().min(0, 'El stock no puede ser negativo.')
    ),
    color: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], {
        message: 'Selecciona un estado válido.'
    }),
    rentable: z.boolean().default(false),
    technicalData: z.array(
        z.object({
            key: z.string().min(1, 'La clave es obligatoria.'),
            value: z.string().min(1, 'El valor es obligatorio.'),
        })
    ).optional().default([]).refine(data => {
        // Custom refinement to ensure both key and value are present if any are provided
        return data.every(item => (item.key && item.value) || (!item.key && !item.value));
    }, {
        message: "Ambos campos (clave y valor) son requeridos para los datos técnicos.",
        path: ["technicalData"], // This associates the error with the technicalData field
    }),
});


const EditProductFormDialog = ({ product, brands = [], categories = [], onSave, onClose, isCreating }) => {
    const [isUpdating, setIsUpdating] = useState(false); // State for loading during update

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: {
            name: product.name || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            externalId: product.externalId || '',
            brandId: String(product.brand?.id) || '', // Convert to string for Select
            categoryId: String(product.category?.id) || '', // Convert to string for Select
            price: product.price || 0,
            cost: product.cost || 0,
            stock: product.stock || 0,
            color: product.color || '',
            status: product.status || 'ACTIVE',
            rentable: product.rentable || false,
            technicalData: product.technicalData || [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "technicalData",
    });

    // Reset form when product prop changes (useful if the dialog is reused for different products)
    useEffect(() => {
        reset({
            name: product.name || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            externalId: product.externalId || '',
            brandId: String(product.brand?.id) || '',
            categoryId: String(product.category?.id) || '',
            price: product.price || 0,
            cost: product.cost || 0,
            stock: product.stock || 0,
            color: product.color || '',
            status: product.status || 'ACTIVE',
            rentable: product.rentable || false,
            technicalData: product.technicalData || [],
        });
    }, [product, reset]);

    const handleEditSubmit = async (data) => {
        setIsUpdating(true);
        try {
            // Prepare data for API: convert numeric strings back to numbers if needed, ensure correct types
            const payload = {
                ...data,
                price: parseFloat(data.price),
                cost: data.cost ? parseFloat(data.cost) : null,
                stock: parseInt(data.stock, 10),
                // Ensure technicalData is an array of objects with key and value
                technicalData: data.technicalData.filter(item => item.key && item.value),
                // If your API expects brand and category IDs as numbers, convert them here
                brandId: parseInt(data.brandId, 10),
                categoryId: parseInt(data.categoryId, 10),
            };

            await onSave(product.id, payload); // Pass product ID and updated data
            onClose(); // Close the dialog on successful save
        } catch (error) {
            console.error("Error updating product:", error);
            // You might want to show an error message to the user here
        } finally {
            setIsUpdating(false);
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

            <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div className="space-y-2 ">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input id="name" {...register('name')} placeholder="Ej: Smartphone Galaxy S21" disabled={isUpdating} />
                        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                    </div>

                    {/* Descripción Corta */}
                    <div className="space-y-2 ">
                        <Label htmlFor="shortDescription">Descripción Corta</Label>
                        <Input id="shortDescription" {...register('shortDescription')} placeholder="Smartphone de última generación" disabled={isUpdating} />
                    </div>

                    {/* Descripción Larga */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea id="description" {...register('description')} placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..." disabled={isUpdating} />
                    </div>

                    {/* ID Externo */}
                    <div className="space-y-2">
                        <Label htmlFor="externalId">ID Externo</Label>
                        <Input id="externalId" {...register('externalId')} placeholder="Ej: PROD-12345" disabled={isUpdating} />
                    </div>

                    {/* ID de Marca */}
                    <div className="space-y-2">
                        <Label htmlFor="brandId">Marca *</Label>
                        <Controller
                            name="brandId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isUpdating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map(brand => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.brandId && <p className="text-sm text-red-600">{errors.brandId.message}</p>}
                    </div>

                    {/* ID de Categoría */}
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Categoría *</Label>
                        <Controller
                            name="categoryId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                                        ))}
                                        {/* Puedes añadir una opción "Cargando categorías..." si el array está vacío y sabes que se están cargando */}
                                        {categories.length === 0 && (
                                            <SelectItem value="" disabled>Cargando categorías...</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
                    </div>

                    {/* Precio */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio (MXN) *</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                            <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" className="pl-7" disabled={isUpdating} />
                        </div>
                        {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                    </div>

                    {/* Costo */}
                    <div className="space-y-2">
                        <Label htmlFor="cost">Costo (MXN)</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                            <Input id="cost" type="number" step="0.01" {...register('cost')} placeholder="0.00" className="pl-7" disabled={isUpdating} />
                        </div>
                        {errors.cost && <p className="text-sm text-red-600">{errors.cost.message}</p>}
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input id="stock" type="number" {...register('stock')} placeholder="0" disabled={isUpdating} />
                        {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input id="color" {...register('color')} placeholder="Ej: Negro" disabled={isUpdating} />
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isUpdating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">
                                            <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>Activo</div>
                                        </SelectItem>
                                        <SelectItem value="INACTIVE">
                                            <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>Inactivo</div>
                                        </SelectItem>
                                        <SelectItem value="OUT_OF_STOCK">
                                            <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-orange-500 mr-2"></span>Sin Stock</div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Rentable */}
                    <div className="flex items-center space-x-3 pt-5">
                        <Controller
                            name="rentable"
                            control={control}
                            render={({ field }) => (
                                <Switch id="rentable" checked={field.value} onCheckedChange={field.onChange} disabled={isUpdating} />
                            )}
                        />
                        <Label htmlFor="rentable" className="text-sm font-medium text-gray-700 cursor-pointer">
                            ¿Disponible para renta?
                        </Label>
                    </div>

                    {/* Datos Técnicos */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Datos Técnicos</Label>
                            <p className="text-sm text-gray-500">Añade especificaciones técnicas como potencia, voltaje, etc.</p>
                        </div>
                        {fields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                                <Input {...register(`technicalData.${index}.key`)} placeholder="Clave (Ej: Potencia)" className="flex-1" disabled={isUpdating} />
                                <Input {...register(`technicalData.${index}.value`)} placeholder="Valor (Ej: 550w)" className="flex-1" disabled={isUpdating} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isUpdating}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {(errors.technicalData && typeof errors.technicalData.message === 'string') && (
                            <p className="text-sm text-red-600">{errors.technicalData.message}</p>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ key: "", value: "" })}
                            className="mt-2"
                            disabled={isUpdating}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Dato Técnico
                        </Button>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isUpdating}>
                            Cancelar
                        </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
                        {isUpdating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

EditProductFormDialog.propTypes = {
    product: PropTypes.object.isRequired,
    brands: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired, // Function to close the dialog
};

export default EditProductFormDialog;