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
    
    const form = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: getDefaultValues(product)
    });

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

    const handleEditSubmit = async (data) => {
        setIsSubmitting(true);
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
                    <div className="space-y-2 ">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input id="name" {...form.register('name')} placeholder="Ej: Smartphone Galaxy S21" disabled={isSubmitting} />
                        {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
                    </div>

                    {/* Descripción Corta */}
                    <div className="space-y-2 ">
                        <Label htmlFor="shortDescription">Descripción Corta</Label>
                        <Input id="shortDescription" {...form.register('shortDescription')} placeholder="Smartphone de última generación" disabled={isSubmitting} />
                    </div>

                    {/* Descripción Larga */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">Descripción</Label>
                        <div className="flex flex-col sm:flex-row gap-2"> {/* Contenedor para textarea y botón */}
                            <Textarea id="description" {...form.register('description')} placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..." disabled={isSubmitting} className="flex-grow" />
                            <Button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || isSubmitting}
                                className="whitespace-nowrap"
                            >
                                {isGenerating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    'Generar descripción con Gemini'
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* ID Externo */}
                    <div className="space-y-2">
                        <Label htmlFor="externalId">ID Externo</Label>
                        <Input id="externalId" {...form.register('externalId')} placeholder="Ej: PROD-12345" disabled={isSubmitting} />
                    </div>

                    {/* ID de Marca */}
                    <div className="space-y-2">
                        <Label htmlFor="brandId">Marca *</Label>
                        <Controller
                            name="brandId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                        {form.formState.errors.brandId && <p className="text-sm text-red-600">{form.formState.errors.brandId.message}</p>}
                    </div>

                    {/* ID de Categoría */}
                    <div className="space-y-2">
                        <Label htmlFor="categoryId">Categoría *</Label>
                        <Controller
                            name="categoryId"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(category => (
                                            <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {form.formState.errors.categoryId && <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>}
                    </div>

                    {/* Precio */}
                    <div className="space-y-2">
                        <Label htmlFor="price">Precio (MXN) *</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                            <Input id="price" type="number" step="0.01" {...form.register('price')} placeholder="0.00" className="pl-7" disabled={isSubmitting} />
                        </div>
                        {form.formState.errors.price && <p className="text-sm text-red-600">{form.formState.errors.price.message}</p>}
                    </div>

                    {/* Costo */}
                    <div className="space-y-2">
                        <Label htmlFor="cost">Costo (MXN)</Label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                            <Input id="cost" type="number" step="0.01" {...form.register('cost')} placeholder="0.00" className="pl-7" disabled={isSubmitting} />
                        </div>
                        {form.formState.errors.cost && <p className="text-sm text-red-600">{form.formState.errors.cost.message}</p>}
                    </div>

                    {/* Descuento */}
                    <div className="space-y-2">
                        <Label htmlFor="discount">Descuento (%)</Label>
                        <Input id="discount" type="number" {...form.register('discount')} placeholder="0" disabled={isSubmitting} />
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Stock *</Label>
                        <Input id="stock" type="number" {...form.register('stock')} placeholder="0" disabled={isSubmitting} />
                        {form.formState.errors.stock && <p className="text-sm text-red-600">{form.formState.errors.stock.message}</p>}
                    </div>

                    {/* Garantía */}
                    <div className="space-y-2">
                        <Label htmlFor="garanty">Garantía (meses)</Label>
                        <Input id="garanty" type="number" {...form.register('garanty')} placeholder="0" disabled={isSubmitting} />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input id="color" {...form.register('color')} placeholder="Ej: Negro" disabled={isSubmitting} />
                    </div>

                    {/* Estado */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Controller
                            name="status"
                            control={form.control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    {/* Rentable */}
                    <div className="flex items-center space-x-3 pt-5">
                        <Controller
                            name="rentable"
                            control={form.control}
                            render={({ field }) => (
                                <Switch id="rentable" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                            )}
                        />
                        <Label htmlFor="rentable" className="text-sm font-medium text-gray-700 cursor-pointer">
                            ¿Disponible para renta?
                        </Label>
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

                    {/* Medios */}
                    <div className="space-y-4 md:col-span-2">
                        <div>
                            <Label className="text-base font-semibold">Medios</Label>
                            <p className="text-sm text-gray-500">Añade imágenes o videos del producto.</p>
                        </div>
                        {mediaFields.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                                <Input {...form.register(`media.${index}`)} placeholder="URL del medio" className="flex-1" disabled={isSubmitting} />
                                <Button type="button" variant="destructive" size="icon" onClick={() => removeMedia(index)} disabled={isSubmitting}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => appendMedia('')}
                            className="mt-2"
                            disabled={isSubmitting}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Medio
                        </Button>
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