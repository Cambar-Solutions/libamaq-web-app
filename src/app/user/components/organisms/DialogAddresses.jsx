import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { MapPin, ChevronRight, Pencil, Plus, Trash } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import BtnSave from "../atoms/BtnSave";
import useLocationStore from "@/stores/useLocationStore";
import { getAllShippingAddresses, createShippingAddress, updateShippingAddress, deleteShippingAddress } from "@/services/customer/shippingAddresses";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter as AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

// Elimina el mockUserId y usa el userId real del localStorage
const userData = JSON.parse(localStorage.getItem("user_data"));
const userId = userData?.id;

const initialFormState = {
    receiver: "",
    street: "",
    exteriorNumber: "",
    interiorNumber: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    phoneNumber: "",
    referencesText: "",
    isSelected: false,
    status: "ACTIVE",
};

// Helper para limpiar el payload antes de enviar
function cleanAddressPayload(payload) {
    const cleaned = {};
    Object.entries(payload).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            !(typeof value === "string" && value.trim() === "")
        ) {
            if (key === "userId") {
                cleaned[key] = String(value);
            } else if (key === "id") {
                cleaned[key] = Number(value);
            } else {
                cleaned[key] = value;
            }
        }
    });
    return cleaned;
}

export default function DialogAddresses({ isDialogOpen, setIsDialogOpen, onCloseLocationDialog }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null); // null = crear, objeto = editar
    const [form, setForm] = useState(initialFormState);
    const [animKey, setAnimKey] = useState(0);
    const [formErrors, setFormErrors] = useState({});

    // Eliminar dirección
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    // Cargar direcciones al abrir el diálogo
    useEffect(() => {
        if (isDialogOpen) {
            fetchAddresses();
            setShowForm(false);
            setEditingAddress(null);
            setForm(initialFormState);
        }
    }, [isDialogOpen]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            if (!userId) {
                setAddresses([]);
                setLoading(false);
                alert("No se encontró el usuario. Por favor inicia sesión.");
                return;
            }
            const all = await getAllShippingAddresses();
            const addressesArray = all?.data || [];
            // Debug: log de direcciones y userId
            console.log("Direcciones recibidas:", addressesArray, "userId actual:", userId);
            if (Array.isArray(addressesArray)) {
                addressesArray.forEach(addr => console.log("userId en dirección:", addr.userId, typeof addr.userId));
            }
            // Filtrar por userId robusto
            setAddresses(Array.isArray(addressesArray) ? addressesArray.filter(addr => String(addr.userId).trim() === String(userId).trim()) : []);
        } catch (e) {
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    // Animación slide
    const slideVariants = {
        hidden: { x: 400, opacity: 0 },
        visible: { x: 0, opacity: 1 },
        exit: { x: -400, opacity: 0 },
    };

    // Manejo de cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Validaciones de solo números
    const validateForm = () => {
        const errors = {};
        if (!/^\d{10,}$/.test(form.phoneNumber)) {
            errors.phoneNumber = "El teléfono debe ser solo números (mínimo 10 dígitos)";
        }
        if (!/^\d{5}$/.test(form.postalCode)) {
            errors.postalCode = "El código postal debe ser de 5 dígitos numéricos";
        }
        if (form.exteriorNumber && !/^\d+$/.test(form.exteriorNumber)) {
            errors.exteriorNumber = "El número exterior debe ser solo números";
        }
        if (form.interiorNumber && !/^\d+$/.test(form.interiorNumber)) {
            errors.interiorNumber = "El número interior debe ser solo números";
        }
        return errors;
    };

    // Guardar dirección (crear o editar)
    const handleSave = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;
        if (!userId) {
            alert("No se encontró el usuario. Por favor inicia sesión.");
            return;
        }
        try {
            if (editingAddress) {
                // PUT
                const updatePayload = cleanAddressPayload({
                    ...form,
                    id: editingAddress.id,
                    updatedBy: "ADMIN",
                    updatedAt: new Date().toISOString(),
                    userId
                });
                delete updatePayload.createdBy;
                delete updatePayload.createdAt;
                // userId como string (según Swagger)
                updatePayload.userId = String(updatePayload.userId);
                console.log("Payload enviado al PUT:", updatePayload);
                await updateShippingAddress(updatePayload);
            } else {
                // POST
                await createShippingAddress(cleanAddressPayload({ ...form, createdBy: "ADMIN", createdAt: new Date().toISOString(), userId }));
            }
            await fetchAddresses();
            setShowForm(false);
            setEditingAddress(null);
            setForm(initialFormState);
            setFormErrors({});
        } catch (err) {
            console.error("Error al guardar dirección:", err?.response?.data || err.message);
            alert("Error al guardar dirección: " + (err?.response?.data?.message || err.message));
        }
    };

    // Editar dirección
    const handleEdit = (address) => {
        setEditingAddress(address);
        setForm({ ...address });
        setShowForm(true);
        setAnimKey(k => k + 1);
    };

    // Agregar nueva dirección
    const handleAddNew = () => {
        setEditingAddress(null);
        setForm(initialFormState);
        setShowForm(true);
        setAnimKey(k => k + 1);
    };

    // Cancelar formulario
    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
        setForm(initialFormState);
        setAnimKey(k => k + 1);
    };

    // Eliminar dirección
    const handleDelete = async () => {
        if (!addressToDelete) return;
        try {
            await deleteShippingAddress(addressToDelete.id);
            toast.success("Dirección eliminada correctamente");
            setAddressToDelete(null);
            setDeleteDialogOpen(false);
            await fetchAddresses();
        } catch (err) {
            toast.error("Error al eliminar dirección");
            setDeleteDialogOpen(false);
        }
    };

    return (
        <>
            <Toaster />
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) onCloseLocationDialog && onCloseLocationDialog();
                }}
            >
                <DialogTrigger asChild>
                    <button className="h-[50%] flex items-center justify-between bg-white hover:bg-gray-200 transition-colors duration-400 p-4 w-full rounded-t-lg">
                        <div className="flex items-center space-x-4">
                            <MapPin className="w-8 h-8 ml-5 text-blue-500" />
                            <div>
                                <h3 className="font-medium text-gray-800 text-lg text-start">Direcciones</h3>
                                <p className="text-sm text-gray-500">Agrega y administra tus direcciones de envío</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[725px]">
                    <DialogHeader>
                        <DialogTitle className="flex text-2xl gap-1 items-center">
                            <MapPin className="w-6 h-6 text-blue-500" />
                            Direcciones
                        </DialogTitle>
                        <DialogDescription>
                            Administra tus direcciones de envío.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 min-h-[350px]">
                        <AnimatePresence initial={false} mode="wait">
                            {!showForm ? (
                                <motion.div
                                    key={"cards-" + animKey}
                                    variants={slideVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {loading ? (
                                        <div className="text-center text-gray-500">Cargando direcciones...</div>
                                    ) : addresses.length === 0 ? (
                                        <div className="text-center text-gray-500 mb-4">No hay ubicaciones registradas.</div>
                                    ) : (
                                        <div className="flex flex-col gap-4 mb-4 h-[400px] overflow-y-auto">
                                            {addresses.map(addr => (
                                                <div key={addr.id} className="relative bg-blue-0 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-2 shadow">
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-blue-900 text-lg">{addr.receiver}</div>
                                                        <div className="text-gray-800">{addr.street} #{addr.exteriorNumber}{addr.interiorNumber ? (", Int. " + addr.interiorNumber) : ""}, {addr.neighborhood}</div>
                                                        <div className="text-gray-700">{addr.city}, {addr.state}, CP {addr.postalCode}</div>
                                                        <div className="text-gray-700">Tel: {addr.phoneNumber}</div>
                                                        {addr.referencesText && <div className="text-blue-600 text-sm">Referencia: {addr.referencesText}</div>}
                                                        <div className="text-xs text-gray-500 mt-1">{addr.status === "ACTIVE" ? "Activa" : "Inactiva"} {addr.isSelected && <span className="ml-2 px-2 py-0.5 bg-green-200 text-green-800 rounded">Seleccionada</span>}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            className="absolute top-2 right-2 p-2 rounded-full hover:bg-blue-100 cursor-pointer transition-colors duration-600"
                                                            onClick={() => handleEdit(addr)}
                                                            aria-label="Editar dirección"
                                                        >
                                                            <Pencil className="w-5 h-5 text-blue-600" />
                                                        </button>
                                                        
                                                        <button
                                                            className="absolute top-2 right-10 p-2 rounded-full hover:bg-red-100 cursor-pointer transition-colors duration-600"
                                                            onClick={() => { setAddressToDelete(addr); setDeleteDialogOpen(true); }}
                                                            aria-label="Eliminar dirección"
                                                        >
                                                            <Trash className="w-5 h-5 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex justify-center">
                                        <button
                                            className="flex items-center gap-2 px-4 py-2 border border-blue-500 bg-white hover:bg-gradient-to-r from-blue-500 from via-blue-400 to-blue-300  text-blue-500 hover:text-white rounded shadow transition-all duration-600"
                                            onClick={handleAddNew}
                                        >
                                            <Plus className="w-4 h-4" /> Agregar nueva dirección
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key={"form-" + animKey}
                                    variants={slideVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    onSubmit={handleSave}
                                    className="bg-white rounded-lg p-4 flex flex-col gap-4 h-[400px] overflow-y-auto"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="receiver">Nombre del receptor</Label>
                                            <Input id="receiver" name="receiver" value={form.receiver} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="phoneNumber">Teléfono</Label>
                                            <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required inputMode="numeric" pattern="\d*" maxLength={10} />
                                            {formErrors.phoneNumber && <span className="text-red-500 text-xs">{formErrors.phoneNumber}</span>}
                                        </div>
                                        <div>
                                            <Label htmlFor="street">Calle</Label>
                                            <Input id="street" name="street" value={form.street} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="exteriorNumber">Número exterior</Label>
                                            <Input id="exteriorNumber" name="exteriorNumber" value={form.exteriorNumber} onChange={handleChange} required inputMode="numeric" pattern="\d*" />
                                            {formErrors.exteriorNumber && <span className="text-red-500 text-xs">{formErrors.exteriorNumber}</span>}
                                        </div>
                                        <div>
                                            <Label htmlFor="interiorNumber">Número interior</Label>
                                            <Input id="interiorNumber" name="interiorNumber" value={form.interiorNumber} onChange={handleChange} inputMode="numeric" pattern="\d*" />
                                            {formErrors.interiorNumber && <span className="text-red-500 text-xs">{formErrors.interiorNumber}</span>}
                                        </div>
                                        <div>
                                            <Label htmlFor="neighborhood">Colonia</Label>
                                            <Input id="neighborhood" name="neighborhood" value={form.neighborhood} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="city">Ciudad</Label>
                                            <Input id="city" name="city" value={form.city} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="state">Estado</Label>
                                            <Input id="state" name="state" value={form.state} onChange={handleChange} required />
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Código Postal</Label>
                                            <Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleChange} required inputMode="numeric" pattern="\d*" maxLength={5} />
                                            {formErrors.postalCode && <span className="text-red-500 text-xs">{formErrors.postalCode}</span>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="referencesText">Referencias</Label>
                                            <Input id="referencesText" name="referencesText" value={form.referencesText} onChange={handleChange} />
                                        </div>
                                        <div className="flex items-center gap-2 md:col-span-2">
                                            <input type="checkbox" id="isSelected" name="isSelected" checked={form.isSelected} onChange={handleChange} />
                                            <Label htmlFor="isSelected">Seleccionar como principal</Label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Label htmlFor="status">Estado</Label>
                                            <select id="status" name="status" value={form.status} onChange={handleChange} className="w-full border rounded p-2">
                                                <option value="ACTIVE">Activa</option>
                                                <option value="INACTIVE">Inactiva</option>
                                            </select>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex gap-2 mt-4">
                                        <BtnSave type="submit" />
                                        <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg cursor-pointer transition-all duration-600">Cancelar</button>
                                    </DialogFooter>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar dirección?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas eliminar esta dirección? Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer" onClick={() => setDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white cursor-pointer" onClick={handleDelete}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}