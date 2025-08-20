import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2, X, Drill, FileText, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from '../../../SpareParts/components/molecules/ImageUploader';
import PdfUploader from './PdfUploader';
import { generateDescriptionIA } from '@/services/admin/AIService';
import mediaService from '@/services/admin/mediaService';
import toast from 'react-hot-toast';

export default function CreateProductFormDialog({ 
    isCreateDialogOpen, 
    openCreateDialog, 
    closeCreateDialog, 
    handleCreateSubmit, 
    isCreating, 
    brands = [], 
    categories = [] 
}) {
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingPdfs, setIsUploadingPdfs] = useState(false);

    const { register, handleSubmit, control, watch, setValue, getValues, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            shortDescription: '',
            description: '',
            externalId: '',
            brandId: '',
            categoryId: '',
            price: '',
            minimumPrice: '',
            ecommercePrice: '',
            cost: '',
            discount: 0,
            stock: 0,
            garanty: 12,
            color: '',
            rentable: false,
            status: 'ACTIVE',
            functionalities: [],
            technicalData: [],
            downloads: [],
            media: []
        }
    });

    const { fields: technicalFields, append: appendTechnical, remove: removeTechnical } = useFieldArray({
        control,
        name: 'technicalData'
    });

    const { fields: functionalityFields, append: appendFunctionality, remove: removeFunctionality } = useFieldArray({
        control,
        name: 'functionalities'
    });

    const { fields: downloadFields, append: appendDownload, remove: removeDownload } = useFieldArray({
        control,
        name: 'downloads'
    });

    useEffect(() => {
        setFilteredCategories(categories);
    }, [categories]);

    useEffect(() => {
        if (!isCreateDialogOpen) {
            reset({
                name: '',
                shortDescription: '',
                description: '',
                externalId: '',
                brandId: '',
                categoryId: '',
                price: '',
                minimumPrice: '',
                ecommercePrice: '',
                cost: '',
                discount: 0,
                stock: 0,
                garanty: 12,
                color: '',
                rentable: false,
                status: 'ACTIVE',
                functionalities: [],
                technicalData: [],
                downloads: [],
                media: []
            });
            setFilteredCategories(categories);
        }
    }, [isCreateDialogOpen, reset, categories]);

    const handleBrandChange = (brandId) => {
        // Si no hay marca seleccionada, mostrar todas las categorías
        if (!brandId) {
            setFilteredCategories(categories);
            return;
        }

        // Encontrar la marca seleccionada
        const selectedBrand = brands.find(brand => brand.id === brandId);
        
        // Si la marca tiene categorías asociadas, filtrar por ellas
        if (selectedBrand) {
            // Si la marca tiene categorías, filtrarlas
            if (selectedBrand.brandCategories && selectedBrand.brandCategories.length > 0) {
                const brandCategoryIds = selectedBrand.brandCategories.map(bc => bc.category.id);
                const filtered = categories.filter(cat => 
                    brandCategoryIds.includes(cat.id)
                );
                setFilteredCategories(filtered);
            } else {
                setFilteredCategories([]);
            }
            
            // Establecer el color de la marca si tiene uno definido
            if (selectedBrand.color) {
                setValue('color', selectedBrand.color, { shouldDirty: true });
            }
        } else {
            setFilteredCategories(categories);
        }
        
        // Resetear la categoría seleccionada
        setValue('categoryId', '');
    };

    const handleGenerateDescription = async () => {
        const productName = getValues('name');
        if (!productName) {
            alert('Por favor, ingresa un nombre de producto para generar la descripción.');
            return;
        }

        setIsGeneratingDescription(true);
        try {
            const description = await generateDescriptionIA(productName, "PRODUCT");
            setValue('description', description, { shouldValidate: true });
        } catch (error) {
            console.error('Error al generar la descripción:', error);
            alert(`Error al generar la descripción: ${error}`);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const handleImageUpload = (files) => {
        const existingMedia = getValues('media') || [];
        // Filtrar solo las imágenes existentes (con id válido y sin file)
        const currentExisting = existingMedia.filter(img => (img.id && (typeof img.id === 'number' || !isNaN(Number(img.id)))) && !img.file);
        // Filtrar solo las imágenes nuevas (con file)
        const currentNew = existingMedia.filter(img => img.file);
        
        const newMedia = files.map((file, index) => ({
            id: `new-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            fileType: file.type.startsWith('image/') ? 'IMAGE' : 'OTHER',
            entityType: 'PRODUCT',
            displayOrder: currentExisting.length + currentNew.length + index,
            file
        }));
        // Combinar existentes y nuevas
        const combinedMedia = [...currentExisting, ...currentNew, ...newMedia];
        setValue('media', combinedMedia);
    };

    const handleImageDelete = (index) => {
        const currentMedia = [...getValues('media')];
        // Si la imagen que se va a eliminar tiene una URL temporal (blob), la revocamos
        const imageToDelete = currentMedia[index];
        if (imageToDelete?.url && imageToDelete.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToDelete.url);
        }
        currentMedia.splice(index, 1);
        setValue('media', currentMedia);
    };

    // --- PDF Upload Handlers ---
    // Los PDFs se suben inmediatamente al servidor y se añaden a la lista con las URLs reales
    const handlePdfUpload = async (files) => {
        if (!files || files.length === 0) return;
        
        setIsUploadingPdfs(true);
        try {
            // Subir los archivos PDF inmediatamente
            const uploadedFiles = await mediaService.uploadImages(files);
            
            const existingDownloads = getValues('downloads') || [];
            // Filtrar solo las descargas existentes (sin file)
            const currentExisting = existingDownloads.filter(dl => !dl.file);
            // Filtrar solo las descargas nuevas (con file)
            const currentNew = existingDownloads.filter(dl => dl.file);
            
            // Crear nuevas entradas con las URLs reales del servidor
            const newPdfs = uploadedFiles.map((uploadedFile, index) => ({
                key: files[index].name.replace('.pdf', ''),
                value: uploadedFile.url // URL real del servidor
            }));
            
            // Combinar existentes y nuevos (sin files temporales)
            const combinedDownloads = [...currentExisting, ...currentNew, ...newPdfs];
            setValue('downloads', combinedDownloads);
            
            toast.success(`${files.length} PDF${files.length > 1 ? 's' : ''} subido${files.length > 1 ? 's' : ''} correctamente`);
        } catch (error) {
            console.error('Error al subir PDFs:', error);
            toast.error('Error al subir los PDFs. Inténtalo de nuevo.');
        } finally {
            setIsUploadingPdfs(false);
        }
    };

    const handlePdfDelete = (index) => {
        const currentDownloads = [...getValues('downloads')];
        currentDownloads.splice(index, 1);
        setValue('downloads', currentDownloads);
    };

    // Funciones de manejo de cambios simplificadas
    const handleCostChange = (e) => {
        setValue('cost', e.target.value);
    };

    const handlePriceChange = (e) => {
        setValue('price', e.target.value);
    };

    const handleMinimumPriceChange = (e) => {
        setValue('minimumPrice', e.target.value);
    };

    const handleEcommercePriceChange = (e) => {
        setValue('ecommercePrice', e.target.value);
    };

    const handleDiscountChange = (e) => {
        setValue('discount', e.target.value);
    };

    const onSubmit = async (data) => {
        if (isSubmitting) return; // Evita doble submit
        setIsSubmitting(true);
        const toastId = toast.loading('Guardando producto...');
        try {
            // Extraer archivos reales de media
            const files = (data.media || [])
                .filter(m => m.file instanceof File)
                .map(m => m.file);

            // Limpiar el campo media para solo dejar los metadatos (sin el campo file)
            const cleanMedia = (data.media || []).map(({ file, ...rest }) => rest);

            // Downloads field ya contiene URLs reales del servidor (no archivos temporales)
            const cleanDownloads = (data.downloads || []);

            const formattedData = {
                ...data,
                brandId: String(data.brandId),
                categoryId: String(data.categoryId),
                price: parseFloat(data.price) || 0,
                minimumPrice: parseFloat(data.minimumPrice) || 0,
                ecommercePrice: parseFloat(data.ecommercePrice) || 0,
                cost: parseFloat(data.cost) || 0,
                discount: parseFloat(data.discount) || 0,
                stock: parseInt(data.stock, 10),
                garanty: parseInt(data.garanty, 10) || 0,
                functionalities: data.functionalities.filter(f => f && f.trim() !== ''),
                technicalData: data.technicalData.filter(td => td.key && td.value),
                downloads: cleanDownloads,
                media: cleanMedia
            };
            await handleCreateSubmit(formattedData, files);
            toast.success('Producto creado exitosamente', { id: toastId });
        } catch (error) {
            toast.error('Error al crear producto', { id: toastId });
        } finally {
            setIsSubmitting(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                closeCreateDialog();
            }
        }}>
            <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="w-full sm:w-auto cursor-pointer">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="sm:text-center">
                            <DialogTitle className="text-xl font-semibold text-gray-900">
                                <div className="flex items-center space-x-3">
                                    <Drill className="h-6 w-6 text-blue-600" />
                                    <h2>Nuevo Producto</h2>
                                </div>
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-sm text-gray-500">
                                Completa la información del producto. Los campos marcados con * son obligatorios.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sección de información básica */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                                Información Básica
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre *</Label>
                                    <Input 
                                        id="name" 
                                        {...register('name', { required: 'El nombre es requerido' })} 
                                        placeholder="Ej: Revolvedora CIPSA MAXI" 
                                        disabled={isCreating} 
                                    />
                                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="externalId">ID Externo</Label>
                                    <Input 
                                        id="externalId" 
                                        {...register('externalId')} 
                                        placeholder="Ej: PROD-12345" 
                                        disabled={isCreating} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brandId">Marca *</Label>
                                    <Controller
                                        name="brandId"
                                        control={control}
                                        rules={{ required: 'La marca es requerida' }}
                                        render={({ field }) => (
                                            <Select 
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    handleBrandChange(value);
                                                }} 
                                                value={field.value} 
                                                disabled={isCreating}
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
                                                if (!watch('brandId')) {
                                                    return 'Selecciona una marca primero';
                                                }
                                                return true;
                                            }
                                        }}
                                        render={({ field }) => (
                                            <Select 
                                                onValueChange={field.onChange} 
                                                value={field.value} 
                                                disabled={!watch('brandId') || isCreating}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        placeholder={!watch('brandId') 
                                                            ? "Selecciona una marca primero" 
                                                            : filteredCategories.length === 0 
                                                                ? "No hay categorías disponibles"
                                                                : "Selecciona una categoría"
                                                        } 
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredCategories.length > 0 ? (
                                                        filteredCategories.map(category => (
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
                                    {errors.categoryId && (
                                        <p className="text-sm text-red-600">
                                            {errors.categoryId.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="stock">Stock *</Label>
                                    <Input 
                                        id="stock" 
                                        type="number" 
                                        {...register('stock', { 
                                            required: 'El stock es requerido',
                                            min: { value: 0, message: 'El stock no puede ser negativo' }
                                        })} 
                                        placeholder="0" 
                                        disabled={isCreating} 
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
                                        disabled={isCreating} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="color">Color</Label>
                                        {watch('brandId') && (
                                            <span 
                                                className="text-xs text-muted-foreground cursor-pointer hover:underline"
                                                onClick={() => {
                                                    const selectedBrand = brands.find(b => b.id === watch('brandId'));
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
                                                disabled={isCreating}
                                                className="pl-10"
                                            />
                                            <input 
                                                type="color" 
                                                value={watch('color') || '#ffffff'}
                                                onChange={(e) => setValue('color', e.target.value, { shouldDirty: true })}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded overflow-hidden border border-gray-300 cursor-pointer"
                                                title="Seleccionar color"
                                            />
                                        </div>
                                        <div 
                                            className="w-10 h-10 rounded-md border flex-shrink-0"
                                            style={{ 
                                                backgroundColor: watch('color') || 'transparent',
                                                borderColor: 'hsl(var(--border))'
                                            }}
                                            title={watch('color') || 'Sin color'}
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
                                                disabled={isCreating} 
                                            />
                                        )}
                                    />
                                    <Label htmlFor="rentable" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        ¿Disponible para renta?
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-3 pt-6">
                                    <div className="flex items-center space-x-2">
                                        <Switch 
                                            id="status" 
                                            checked={true} 
                                            disabled={true}
                                            className="opacity-70"
                                        />
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                                            Activo
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sección de descripciones */}
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
                                        placeholder="Herramienta profesional para construcción" 
                                        disabled={isCreating} 
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
                                            disabled={isGeneratingDescription || isCreating}
                                            className=" bg-gradient-to-l from-cyan-500 from via-violet-500 to-purple-500 text-white hover:text-white text-sm font-semibold px-4 py-2 rounded-full transition cursor-pointer w-full sm:w-auto"
                                        >
                                            {isGeneratingDescription ? (
                                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                            ) : (
                                                'Generar con Gemini'
                                            )}
                                        </Button>
                                    </div>
                                    <Textarea 
                                        id="description" 
                                        {...register('description')} 
                                        placeholder="Esta herramienta cuenta con motor de alta potencia y diseño ergonómico para uso profesional." 
                                        disabled={isCreating} 
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sección de imágenes */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Imágenes del Producto
                            </h3>
                            <div className="space-y-4">
                                <ImageUploader
                                    onImagesChange={handleImageUpload}
                                    onImageDelete={handleImageDelete}
                                />
                            </div>
                        </div>

                        {/* Sección de funcionalidades */}
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
                                            placeholder="Ej: Alta potencia"
                                            className="flex-1"
                                            disabled={isCreating}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeFunctionality(index)}
                                            disabled={isCreating}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendFunctionality('')}
                                    disabled={isCreating}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Funcionalidad
                                </Button>
                            </div>
                        </div>

                        {/* Sección de datos técnicos */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                                Datos Técnicos
                            </h3>
                            <div className="space-y-4">
                                {technicalFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Input
                                            {...register(`technicalData.${index}.key`)}
                                            placeholder="Clave (Ej: Potencia)"
                                            className="flex-1"
                                            disabled={isCreating}
                                        />
                                        <Input
                                            {...register(`technicalData.${index}.value`)}
                                            placeholder="Valor (Ej: 550w)"
                                            className="flex-1"
                                            disabled={isCreating}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeTechnical(index)}
                                            disabled={isCreating}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendTechnical({ key: '', value: '' })}
                                    disabled={isCreating}
                                    className="cursor-pointer"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Dato Técnico
                                </Button>
                            </div>
                        </div>

                        {/* Sección de descargas por URL */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                                Descargas por URL
                            </h3>
                            <div className="space-y-4">
                                {downloadFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Input
                                            {...register(`downloads.${index}.key`)}
                                            placeholder="Nombre del documento"
                                            className="flex-1"
                                            disabled={isCreating}
                                        />
                                        <Input
                                            {...register(`downloads.${index}.value`)}
                                            placeholder="URL del documento"
                                            className="flex-1"
                                            disabled={isCreating}
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeDownload(index)}
                                            disabled={isCreating}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => appendDownload({ key: '', value: '' })}
                                    disabled={isCreating}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Descarga por URL
                                </Button>
                            </div>
                        </div>

                        {/* Sección de descargas PDF */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-green-600" />
                                Descargas PDF
                            </h3>
                            <div className="space-y-4">
                                <PdfUploader
                                    existingDownloads={watch('downloads') || []}
                                    onPdfsChange={handlePdfUpload}
                                    onPdfDelete={handlePdfDelete}
                                    isUploading={isUploadingPdfs}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border">
                            <h3 className="text-md font-semibold mb-4 text-gray-700">Precios del Producto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Precio *</Label>
                                    <div className="relative">
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('price', {
                                                required: 'El precio es requerido',
                                                min: { value: 0, message: 'El precio no puede ser negativo' }
                                            })}
                                            onChange={handlePriceChange}
                                            disabled={isCreating}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    {errors.price && (
                                        <span className="text-sm text-red-500">
                                            {errors.price.message}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="minimumPrice">Precio Mínimo *</Label>
                                    <div className="relative">
                                        <Input
                                            id="minimumPrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('minimumPrice', {
                                                required: 'El precio mínimo es requerido',
                                                min: { value: 0, message: 'El precio mínimo no puede ser negativo' }
                                            })}
                                            onChange={handleMinimumPriceChange}
                                            disabled={isCreating}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    {errors.minimumPrice && (
                                        <span className="text-sm text-red-500">
                                            {errors.minimumPrice.message}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="ecommercePrice">Precio E-commerce *</Label>
                                    <div className="relative">
                                        <Input
                                            id="ecommercePrice"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('ecommercePrice', {
                                                required: 'El precio e-commerce es requerido',
                                                min: { value: 0, message: 'El precio e-commerce no puede ser negativo' }
                                            })}
                                            onChange={handleEcommercePriceChange}
                                            disabled={isCreating}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    {errors.ecommercePrice && (
                                        <span className="text-sm text-red-500">
                                            {errors.ecommercePrice.message}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Costo *</Label>
                                    <div className="relative">
                                        <Input
                                            id="cost"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('cost', {
                                                required: 'El costo es requerido',
                                                min: { value: 0, message: 'El costo no puede ser negativo' }
                                            })}
                                            onChange={handleCostChange}
                                            disabled={isCreating}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            MXN
                                        </span>
                                    </div>
                                    {errors.cost && (
                                        <span className="text-sm text-red-500">
                                            {errors.cost.message}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="discount">Descuento *</Label>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            {...register('discount', {
                                                required: 'El descuento es requerido',
                                                min: { value: 0, message: 'El descuento no puede ser negativo' }
                                            })}
                                            onChange={handleDiscountChange}
                                            disabled={isCreating}
                                            className="pl-3"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                            %
                                        </span>
                                    </div>
                                    {errors.discount && (
                                        <span className="text-sm text-red-500">
                                            {errors.discount.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" disabled={isCreating} className="cursor-pointer">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting || isCreating} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                            {isSubmitting || isCreating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar Producto'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
