import React from 'react'
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
import { Plus, Loader2, Search, X, Drill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateProductFormDialog({ isCreateDialogOpen, openCreateDialog, closeCreateDialog, handleCreateSubmit, handleSubmit, isCreating, brands = [], categories = [], fields, register, errors, control }) {
    return (
        <>
            <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => !isOpen && closeCreateDialog()}>
                <DialogTrigger asChild>
                    <Button
                        onClick={openCreateDialog}
                        className="w-full sm:w-auto"
                    >
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
                                        <h2 className="text-xl font-semibold text-gray-900">Nuevo Producto</h2>
                                    </div>
                                </DialogTitle>
                                <DialogDescription className="mt-1 text-sm text-gray-500">
                                    Completa la información del producto. Los campos marcados con * son obligatorios.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-6 pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombre */}
                            <div className="space-y-2 ">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input id="name" {...register('name')} placeholder="Ej: Smartphone Galaxy S21" disabled={isCreating} />
                                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            {/* Descripción Corta */}
                            <div className="space-y-2 ">
                                <Label htmlFor="shortDescription">Descripción Corta</Label>
                                <Input id="shortDescription" {...register('shortDescription')} placeholder="Smartphone de última generación" disabled={isCreating} />
                            </div>

                            {/* Descripción Larga */}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea id="description" {...register('description')} placeholder="El Galaxy S21 cuenta con una pantalla de 6.2 pulgadas..." disabled={isCreating} />
                            </div>

                            {/* ID Externo */}
                            <div className="space-y-2">
                                <Label htmlFor="externalId">ID Externo</Label>
                                <Input id="externalId" {...register('externalId')} placeholder="Ej: PROD-12345" disabled={isCreating} />
                            </div>

                            {/* ID de Marca */}
                            <div className="space-y-2">
                                <Label htmlFor="brandId">Marca *</Label>
                                <Controller
                                    name="brandId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
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

                            {/* ID de Categoría (Ejemplo) */}
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">ID de Categoría *</Label>
                                <Input id="categoryId" {...register('categoryId')} placeholder="Ej: 1 (Smartphones)" disabled={isCreating} />
                                {errors.categoryId && <p className="text-sm text-red-600">{errors.categoryId.message}</p>}
                            </div>

                            {/* Precio */}
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio (MXN) *</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                                    <Input id="price" type="number" step="0.01" {...register('price')} placeholder="0.00" className="pl-7" disabled={isCreating} />
                                </div>
                                {errors.price && <p className="text-sm text-red-600">{errors.price.message}</p>}
                            </div>

                            {/* Costo */}
                            <div className="space-y-2">
                                <Label htmlFor="cost">Costo (MXN)</Label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm">$</span>
                                    <Input id="cost" type="number" step="0.01" {...register('cost')} placeholder="0.00" className="pl-7" disabled={isCreating} />
                                </div>
                                {errors.cost && <p className="text-sm text-red-600">{errors.cost.message}</p>}
                            </div>

                            {/* Stock */}
                            <div className="space-y-2">
                                <Label htmlFor="stock">Stock *</Label>
                                <Input id="stock" type="number" {...register('stock')} placeholder="0" disabled={isCreating} />
                                {errors.stock && <p className="text-sm text-red-600">{errors.stock.message}</p>}
                            </div>

                            {/* Color */}
                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <Input id="color" {...register('color')} placeholder="Ej: Negro" disabled={isCreating} />
                            </div>

                            {/* Estado */}
                            <div className="space-y-2">
                                <Label htmlFor="status">Estado</Label>
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCreating}>
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
                                    control={control}
                                    render={({ field }) => (
                                        <Switch id="rentable" checked={field.value} onCheckedChange={field.onChange} disabled={isCreating} />
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
                                        <Input {...register(`technicalData.${index}.key`)} placeholder="Clave (Ej: Potencia)" className="flex-1" disabled={isCreating} />
                                        <Input {...register(`technicalData.${index}.value`)} placeholder="Valor (Ej: 550w)" className="flex-1" disabled={isCreating} />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={isCreating}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {(errors.technicalData) && <p className="text-sm text-red-600">Ambos campos de datos técnicos son requeridos.</p>}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => append({ key: "", value: "" })}
                                    className="mt-2"
                                    disabled={isCreating}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Añadir Dato Técnico
                                </Button>
                            </div>
                        </div>

                        <DialogFooter className="border-t pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={isCreating}>
                                    Cancelar
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isCreating} className="bg-blue-600 hover:bg-blue-700">
                                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar Producto'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
