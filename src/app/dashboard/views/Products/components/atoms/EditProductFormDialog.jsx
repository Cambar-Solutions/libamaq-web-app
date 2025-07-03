import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';

// UI Components from shadcn/ui
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Icons
import { Drill, Plus, X, Loader2, FileText, Download, Settings, Edit } from 'lucide-react';

// Services
import { generateDescriptionIA } from '@/services/admin/AIService';
import { getCategoriesByBrand, getCategoryById } from '@/services/admin/categoryService';
import { getProductById } from '@/services/admin/productService';

// Components
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
        (val) => {
            const parsed = parseFloat(val);
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(0, 'El precio no puede ser negativo.')
    ),
    cost: z.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined) return null;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? null : parsed;
        },
        z.number().min(0, 'El costo no puede ser negativo.').nullable().optional()
    ),
    discount: z.preprocess(
        (val) => {
            const parsed = parseFloat(val || 0);
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().min(0, 'El descuento no puede ser negativo.').optional()
    ),
    stock: z.preprocess(
        (val) => {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().int().min(0, 'El stock no puede ser negativo.')
    ),
    garanty: z.preprocess(
        (val) => {
            const parsed = parseInt(val || 0, 10);
            return isNaN(parsed) ? 0 : parsed;
        },
        z.number().int().min(0, 'La garantía no puede ser negativa.').optional()
    ),
    color: z.string().optional(),
    rentable: z.boolean().default(false),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    functionalities: z.array(z.string()).default([]),
    technicalData: z.array(
        z.object({
            key: z.string().optional(),
            value: z.string().optional()
        })
    ).default([]),
    downloads: z.array(
        z.object({
            key: z.string().optional(),
            value: z.string().optional()
        })
    ).default([]),
    media: z.array(z.any()).default([])
});

// Helper function to set default values
const getProductDefaultValues = (product) => {
    // Helper to format technicalData from various input types to the desired { key: '', value: '' } structure
    const formatTechnicalData = (data) => {
        if (!data) return [{ key: '', value: '' }];
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
            return data.map(item => ({
                key: item.key || '',
                value: item.value || ''
            }));
        }
        return [{ key: '', value: '' }];
    };
    return {
        // Metadatos y campos editables
        id: product?.id ? Number(product.id) : undefined,
        createdBy: product?.createdBy || '',
        updatedBy: product?.updatedBy || '',
        createdAt: product?.createdAt || '',
        updatedAt: product?.updatedAt || '',
        deletedAt: product?.deletedAt || '',
        brandId: product?.brandId ? String(product.brandId) : '',
        categoryId: product?.categoryId ? String(product.categoryId) : '',
        externalId: product?.externalId || '',
        name: product?.name || '',
        shortDescription: product?.shortDescription || '',
        description: product?.description || '',
        price: product?.price ? parseFloat(product.price) : 0,
        cost: product?.cost ? parseFloat(product.cost) : null,
        discount: product?.discount ? parseFloat(product.discount) : 0,
        stock: product?.stock ? parseInt(product.stock, 10) : 0,
        garanty: product?.garanty ? parseInt(product.garanty, 10) : 0,
        color: product?.color || '',
        rentable: Boolean(product?.rentable),
        status: product?.status || 'ACTIVE',
        functionalities: Array.isArray(product?.functionalities) ? product.functionalities.filter(Boolean) : [],
        technicalData: formatTechnicalData(product?.technicalData),
        downloads: Array.isArray(product?.downloads)
            ? product.downloads.map(dl => ({ key: dl.key || '', value: dl.value || '' }))
            : [{ key: '', value: '' }],
        media: Array.isArray(product?.media)
            ? product.media.map(img => ({
                ...img,
                id: img.id || Date.now(),
                url: img.url || '',
                fileType: img.fileType || 'IMAGE',
                entityId: img.entityId || product?.id,
                entityType: 'PRODUCT',
                displayOrder: img.displayOrder || 0
            }))
            : []
    };
};

const EditProductFormDialog = ({ 
    product, 
    brands = [], 
    categories = [], 
    onSave, 
    onClose,
    open,
    onOpenChange,
    isUpdating = false 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [fullProduct, setFullProduct] = useState(null);
    const firstErrorRef = useRef(null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        getValues,
        formState: { errors, isDirty }
    } = useForm({
        resolver: zodResolver(editProductSchema),
        defaultValues: getProductDefaultValues(product)
    });

    const watchedBrandId = watch('brandId');
    const watchedCost = watch('cost');
    const watchedPrice = watch('price');
    const watchedDiscount = watch('discount');
    const watchedColor = watch('color');
    const watchedProductName = watch('name');

    // DEBUG: Log de valores del formulario
    console.log('📊 FORM VALUES:', {
        brandId: watchedBrandId,
        categoryId: watch('categoryId'),
        name: watchedProductName,
        price: watchedPrice,
        isDirty,
        errors: Object.keys(errors),
        errorDetails: errors
    });

    // Field arrays for dynamic inputs
    const { fields: functionalityFields, append: appendFunctionality, remove: removeFunctionality } = useFieldArray({
        control,
        name: 'functionalities'
    });

    const { fields: technicalDataFields, append: appendTechnicalData, remove: removeTechnicalData } = useFieldArray({
        control,
        name: 'technicalData'
    });

    const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
        control,
        name: 'downloads'
    });

    // Fetch product details when dialog opens
    useEffect(() => {
        if (open && product?.id) {
            setLoadingProduct(true);
            getProductById(product.id)
                .then((data) => {
                    const prod = data.data ? data.data : data;
                    setFullProduct(prod);
                })
                .catch((err) => {
                    alert('Error al cargar el producto: ' + (err?.message || err));
                })
                .finally(() => setLoadingProduct(false));
        }
    }, [open, product]);

    // Reset form only when fullProduct cambia y está listo
    useEffect(() => {
        if (fullProduct) {
            reset(getProductDefaultValues(fullProduct));
        }
    }, [fullProduct, reset]);

    // --- Data Loading Effects ---
    useEffect(() => {
        const loadInitialCategories = async () => {
            if (fullProduct?.brandId) {
                try {
                    const response = await getCategoriesByBrand(fullProduct.brandId);
                    let categories = response.data || [];
                    // Si la categoría original no está en la lista, hacer fetch y agregarla
                    const currentCategoryId = fullProduct.categoryId;
                    if (
                        currentCategoryId &&
                        !categories.some(cat => String(cat.id) === String(currentCategoryId))
                    ) {
                        try {
                            const catResp = await getCategoryById(currentCategoryId);
                            const originalCategory = catResp?.data || catResp;
                            if (originalCategory && originalCategory.id) {
                                categories = [originalCategory, ...categories];
                            }
                        } catch (catErr) {
                            // Si falla, solo deja la lista filtrada
                        }
                    }
                    setFilteredCategories(categories);
                } catch (error) {
                    setFilteredCategories([]);
                }
            } else {
                setFilteredCategories([]);
            }
        };
        loadInitialCategories();
    }, [fullProduct]);

    // Effect to react to brandId changes for category filtering
    useEffect(() => {
        const fetchCategories = async () => {
            if (watch('brandId')) {
                try {
                    const response = await getCategoriesByBrand(parseInt(watch('brandId'), 10));
                    let categories = response.data || [];
                    // Si la categoría seleccionada no está en la nueva lista
                    const currentCategoryId = watch('categoryId');
                    // fullProduct?.categoryId es la original
                    const isOriginalCategory = fullProduct && String(currentCategoryId) === String(fullProduct.categoryId);
                    // Si la categoría seleccionada no está en la lista filtrada
                    const categoryInList = categories.some(cat => String(cat.id) === String(currentCategoryId));
                    // Si la categoría seleccionada es la original y no está en la lista, la agregamos manualmente
                    if (isOriginalCategory && !categoryInList && fullProduct?.categoryId) {
                        try {
                            const catResp = await getCategoryById(fullProduct.categoryId);
                            const originalCategory = catResp?.data || catResp;
                            if (originalCategory && originalCategory.id) {
                                categories = [originalCategory, ...categories];
                            }
                        } catch (catErr) {
                            // Si falla, solo deja la lista filtrada
                        }
                        setFilteredCategories(categories);
                        // No borrar el categoryId
                        return;
                    }
                    setFilteredCategories(categories);
                    // Solo borrar el categoryId si NO es la original y no está en la lista
                    if (!isOriginalCategory && !categoryInList) {
                        setValue('categoryId', '');
                    }
                } catch (error) {
                    setFilteredCategories([]);
                    // Solo borrar si no es la original
                    const currentCategoryId = watch('categoryId');
                    const isOriginalCategory = fullProduct && String(currentCategoryId) === String(fullProduct.categoryId);
                    if (!isOriginalCategory) {
                        setValue('categoryId', '');
                    }
                }
            } else {
                setFilteredCategories([]);
                // Solo borrar si no es la original
                const currentCategoryId = watch('categoryId');
                const isOriginalCategory = fullProduct && String(currentCategoryId) === String(fullProduct.categoryId);
                if (!isOriginalCategory) {
                    setValue('categoryId', '');
                }
            }
        };
        fetchCategories();
    }, [watch('brandId'), setValue, watch, fullProduct]);

    // --- Price Calculation Logic ---
    const calculatePriceWithIVA = useCallback((price) => {
        return price * 1.16; // Assuming 16% IVA
    }, []);

    const calculatePublicPrice = useCallback((cost) => {
        const parsedCost = parseFloat(cost);
        if (isNaN(parsedCost) || parsedCost <= 0) return 0;
        const basePrice = parsedCost / 0.8; // 20% profit margin
        return calculatePriceWithIVA(basePrice);
    }, [calculatePriceWithIVA]);

    const calculateFrequentPrice = useCallback((cost) => {
        const parsedCost = parseFloat(cost);
        if (isNaN(parsedCost) || parsedCost <= 0) return 0;
        const basePrice = parsedCost / 0.9; // 10% profit margin for frequent customers
        return calculatePriceWithIVA(basePrice);
    }, [calculatePriceWithIVA]);

    const handleCostChange = (e) => {
        const costValue = e.target.value;
        setValue('cost', costValue);

        if (costValue && parseFloat(costValue) > 0) {
            const publicPrice = calculatePublicPrice(costValue);
            setValue('price', parseFloat(publicPrice.toFixed(2)), { shouldValidate: true });

            const frequentPrice = calculateFrequentPrice(costValue);
            const discountPercentage = ((publicPrice - frequentPrice) / publicPrice * 100);
            setValue('discount', parseFloat(discountPercentage.toFixed(2)), { shouldValidate: true });
        } else {
            setValue('price', 0);
            setValue('discount', 0);
        }
    };

    // --- Form Submission ---
    const handleEditSubmit = async (data) => {
        console.log('🚀 handleEditSubmit INICIADO', { data });
        setIsSubmitting(true);
        try {
            console.log('SUBMIT DATA', data);
            // Extraer archivos reales de media
            const files = (data.media || [])
                .filter(m => m.file instanceof File)
                .map(m => m.file);

            // Track media to delete (images that were removed)
            const originalMediaIds = (fullProduct?.media || []).map(m => m.id).filter(Boolean);
            const currentMediaIds = (data.media || [])
                .filter(m => m.id && !m.file)
                .map(m => m.id);
            const mediaToDelete = originalMediaIds.filter(id => !currentMediaIds.includes(id));

            // Clean media field to only include metadata (without file field)
            const cleanMedia = (data.media || []).map(({ file, ...rest }) => rest);

            // Payload con TODOS los campos del producto
            const payload = {
                ...data,
                id: data.id,
                createdBy: data.createdBy,
                updatedBy: data.updatedBy,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                deletedAt: data.deletedAt,
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
                functionalities: data.functionalities.filter(f => f),
                technicalData: data.technicalData
                    .filter(item => item.key && item.value)
                    .map(item => ({ key: item.key, value: item.value })),
                downloads: data.downloads.filter(item => item.key && item.value),
                media: cleanMedia
            };

            console.log('📞 LLAMANDO onSave con:', { id: data.id, payload, files, mediaToDelete });
            // Llamar a onSave pasando los argumentos como parámetros separados
            await onSave(
                data.id,
                payload,
                files,
                mediaToDelete
            );
            console.log('✅ onSave completado exitosamente');
            if (onClose) onClose();
            toast.success('Producto actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            toast.error(error.message || 'Error al actualizar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Accesibilidad: scroll y focus al primer error ---
    const onInvalid = (formErrors) => {
        console.log('❌ VALIDACIÓN FALLIDA:', formErrors);
        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey) {
            const errorField = document.querySelector(`[name="${firstErrorKey}"]`);
            if (errorField) {
                errorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorField.focus();
            }
        }
        toast.error('Por favor corrige los campos marcados en rojo.');
    };

    // --- AI Description Generation ---
    const handleGenerateDescription = async () => {
        if (!watchedProductName) {
            alert('Por favor, ingresa un nombre de producto para generar la descripción.');
            return;
        }

        setIsGenerating(true);
        try {
            const description = await generateDescriptionIA(watchedProductName, "PRODUCT");
            setValue('description', description, { shouldValidate: true });
        } catch (error) {
            console.error('Error al generar la descripción:', error);
            alert(`Error al generar la descripción: ${error.message || error}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Image Upload Handlers ---
    const handleImageUpload = (files) => {
        const existingMedia = getValues('media') || [];
        const newMedia = files.map((file, index) => ({
            id: `new-${Date.now()}-${index}`, // Temporary ID for new files
            url: URL.createObjectURL(file),
            fileType: file.type.startsWith('image/') ? 'IMAGE' : 'OTHER',
            entityType: 'PRODUCT',
            displayOrder: existingMedia.length + index,
            file // Keep the file reference for upload
        }));
        
        // Combine existing media with new files
        const combinedMedia = [...existingMedia, ...newMedia];
        setValue('media', combinedMedia);
    };

    const handleImageDelete = (index) => {
        const currentMedia = [...getValues('media')];
        currentMedia.splice(index, 1);
        setValue('media', currentMedia);
    };

    // Asegura que la marca del producto esté en la lista de marcas
    let brandsWithCurrent = brands;
    if (
        fullProduct?.brandId &&
        !brands.some(b => String(b.id) === String(fullProduct.brandId))
    ) {
        brandsWithCurrent = [
            { id: fullProduct.brandId, name: fullProduct.brandName || `Marca ${fullProduct.brandId}` },
            ...brands
        ];
    }



    // Asegura que la categoría del producto esté en la lista de categorías
    let categoriesWithCurrent = filteredCategories;
    if (
        fullProduct?.categoryId &&
        !filteredCategories.some(c => String(c.id) === String(fullProduct.categoryId))
    ) {
        categoriesWithCurrent = [
            { id: fullProduct.categoryId, name: fullProduct.categoryName || `Categoría ${fullProduct.categoryId}` },
            ...filteredCategories
        ];
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="sm:text-center">
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                <div className="flex items-center space-x-3">
                                    <Drill className="h-6 w-6 text-blue-600" />
                                    <h2>Editar Producto</h2>
                                </div>
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm text-gray-500">
                                Realiza cambios en los detalles del producto <strong>{fullProduct?.name || product?.name}</strong>. Los campos marcados con * son obligatorios.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                {loadingProduct ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-4 text-blue-600 font-semibold">Cargando producto...</span>
                    </div>
                ) : (
                    <>
                        <form onSubmit={handleSubmit(handleEditSubmit, onInvalid)} className="space-y-6 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        placeholder="Ej: Smartphone Galaxy S21"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && <p className="text-sm text-red-600" role="alert">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="externalId">ID Externo</Label>
                                    <Input
                                        id="externalId"
                                        {...register('externalId')}
                                        placeholder="Ej: PROD-12345"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brandId">Marca *</Label>
                                    <Controller
                                        name="brandId"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={isSubmitting}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una marca" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {brandsWithCurrent && brandsWithCurrent.length > 0 ? (
                                                        brandsWithCurrent
                                                            .filter(brand => brand && brand.id != null)
                                                            .map(brand => (
                                                                <SelectItem key={String(brand.id)} value={String(brand.id)}>
                                                                    {brand.name}
                                                                </SelectItem>
                                                            ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                            No hay marcas disponibles
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.brandId && <p className="text-sm text-red-600">{errors.brandId.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Categoría *</Label>
                                    <Controller
                                        name="categoryId"
                                        control={control}
                                        rules={{
                                            required: 'La categoría es requerida',
                                            validate: value => {
                                                if (!watchedBrandId) {
                                                    return 'Selecciona una marca primero';
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchedBrandId || isSubmitting || filteredCategories.length === 0}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue
                                                        placeholder={
                                                            !watchedBrandId
                                                                ? "Selecciona una marca primero"
                                                                : filteredCategories.length === 0
                                                                    ? "No hay categorías disponibles"
                                                                    : "Selecciona una categoría"
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categoriesWithCurrent && categoriesWithCurrent.length > 0 ? (
                                                        categoriesWithCurrent
                                                            .filter(category => category && category.id != null)
                                                            .map(category => (
                                                                <SelectItem key={String(category.id)} value={String(category.id)}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))
                                                    ) : (
                                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                                            {
                                                                !watchedBrandId
                                                                    ? "Selecciona una marca primero"
                                                                    : "No hay categorías disponibles para esta marca"
                                                            }
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cost">Costo (sin IVA)</Label>
                                    <div className="relative">
                                        <Input
                                            id="cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('cost')}
                                            onChange={handleCostChange}
                                            disabled={isSubmitting}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    {errors.cost && <span className="text-sm text-red-500">{errors.cost.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio Público General (con IVA)</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={watchedPrice.toFixed(2)}
                                            readOnly
                                            disabled={isSubmitting}
                                            className="pl-3 bg-gray-50"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Precio calculado automáticamente (Costo / 0.8 + 16% IVA)
                                    </p>
                                    {errors.price && <span className="text-sm text-red-500">{errors.price.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="discount">Descuento Cliente Frecuente</Label>
                                        <span className="text-sm text-gray-500">
                                            Precio: ${(watchedPrice * (1 - (watchedDiscount || 0) / 100)).toFixed(2)} MXN
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            {...register('discount')}
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
                                    {errors.discount && <span className="text-sm text-red-500">{errors.discount.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        {...register('stock')}
                                        placeholder="0"
                                        disabled={isSubmitting}
                                    />
                                    {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="garanty">Garantía (meses)</Label>
                                    <Input
                                        id="garanty"
                                        type="number"
                                        {...register('garanty')}
                                        placeholder="12"
                                        disabled={isSubmitting}
                                    />
                                    {errors.garanty && <p className="text-sm text-red-600">{errors.garanty.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="color">Color</Label>
                                        {watchedBrandId && (
                                            <span
                                                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                                                onClick={() => {
                                                    const selectedBrand = brands.find(b => String(b.id) === watchedBrandId);
                                                    if (selectedBrand?.color) {
                                                        setValue('color', selectedBrand.color, { shouldDirty: true });
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
                                                {...register('color')}
                                                placeholder="Ej: #1428A0 o Negro"
                                                disabled={isSubmitting}
                                                className="pl-10"
                                            />
                                            <input
                                                type="color"
                                                value={watchedColor || '#ffffff'}
                                                onChange={(e) => setValue('color', e.target.value, { shouldDirty: true })}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded overflow-hidden border border-gray-300 cursor-pointer"
                                                title="Seleccionar color"
                                            />
                                        </div>
                                        <div
                                            className="w-10 h-10 rounded-md border flex-shrink-0"
                                            style={{
                                                backgroundColor: watchedColor || 'transparent',
                                                borderColor: 'hsl(var(--border))'
                                            }}
                                            title={watchedColor || 'Sin color'}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3 pt-6">
                                    <Controller
                                        name="rentable"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                id="rentable"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        )}
                                    />
                                    <Label htmlFor="rentable" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        ¿Disponible para renta?
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-3 pt-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium">Inactivo</span>
                                        <Controller
                                            name="status"
                                            control={control}
                                            render={({ field }) => (
                                                <Switch
                                                    id="status"
                                                    checked={field.value === 'ACTIVE'}
                                                    onCheckedChange={(checked) => field.onChange(checked ? 'ACTIVE' : 'INACTIVE')}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        />
                                        <span className="text-sm font-medium">Activo</span>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                    Descripciones
                                </h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="shortDescription">Descripción Corta</Label>
                                        <Input
                                            id="shortDescription"
                                            {...register('shortDescription')}
                                            placeholder="Smartphone de última generación"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="description">Descripción Larga</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleGenerateDescription}
                                                disabled={isGenerating || isSubmitting}
                                                className="bg-gradient-to-l from-cyan-500 from via-violet-500 to-purple-500 text-white hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition cursor-pointer w-full sm:w-auto"
                                            >
                                                {isGenerating ? (
                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                                ) : (
                                                    'Generar con Gemini'
                                                )}
                                            </Button>
                                        </div>
                                        <Textarea
                                            id="description"
                                            {...register('description')}
                                            placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..."
                                            disabled={isSubmitting || isGenerating}
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                    Imágenes del Producto
                                </h3>
                                <div className="space-y-4">
                                    <ImageUploader
                                        existingImages={watch('media') || []}
                                        onImagesChange={handleImageUpload}
                                        onImageDelete={handleImageDelete}
                                        maxFiles={5}
                                    />
                                    {errors.media && <p className="text-sm text-red-600">{errors.media.message}</p>}
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                                    Funcionalidades
                                </h3>
                                <div className="space-y-4">
                                    {functionalityFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <Input
                                                {...register(`functionalities.${index}`)}
                                                placeholder="Ej: Reconocimiento facial"
                                                className="flex-1"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeFunctionality(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => appendFunctionality('')}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Funcionalidad
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                    <Settings className="h-5 w-5 mr-2 text-blue-600" />
                                    Datos Técnicos
                                </h3>
                                <div className="space-y-4">
                                    {technicalDataFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <Input
                                                {...register(`technicalData.${index}.key`)}
                                                placeholder="Clave (Ej: Potencia)"
                                                className="flex-1"
                                                disabled={isSubmitting}
                                            />
                                            <Input
                                                {...register(`technicalData.${index}.value`)}
                                                placeholder="Valor (Ej: 500W)"
                                                className="flex-1"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeTechnicalData(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => appendTechnicalData({ key: '', value: '' })}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Datos Técnicos
                                    </Button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-lg font-medium mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                    Descargas
                                </h3>
                                <div className="space-y-4">
                                    {downloadFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <Input
                                                {...register(`downloads.${index}.key`)}
                                                placeholder="Nombre"
                                                className="flex-1"
                                                disabled={isSubmitting}
                                            />
                                            <Input
                                                {...register(`downloads.${index}.value`)}
                                                placeholder="URL"
                                                className="flex-1"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeDownload(index)}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => appendDownload({ key: '', value: '' })}
                                        disabled={isSubmitting}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Descarga
                                    </Button>
                                </div>
                            </div>
                        </form>
                        <DialogFooter className="border-t pt-4">
                            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange ? onOpenChange(false) : onClose && onClose()}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    console.log('🔧 FORZANDO ENVÍO SIN VALIDACIÓN');
                                    const formData = getValues();
                                    console.log('📋 DATOS DEL FORMULARIO:', formData);
                                    handleEditSubmit(formData);
                                }}
                                disabled={isSubmitting || isUpdating}
                            >
                                {(isSubmitting || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Actualizar Producto
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

EditProductFormDialog.propTypes = {
    product: PropTypes.object,
    brands: PropTypes.array,
    categories: PropTypes.array,
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    onOpenChange: PropTypes.func,
    isUpdating: PropTypes.bool,
};

export default EditProductFormDialog;
