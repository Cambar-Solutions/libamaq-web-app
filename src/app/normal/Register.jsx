import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, User, Lock, CheckCircle, Pencil, BadgeCheck, Eye, EyeOff, Phone } from "lucide-react";
import { register as registerUser } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const steps = [
    {
        key: 'email',
        label: 'Agrega tu correo',
        description: 'No compartiremos tu correo con nadie.',
        icon: Mail,
        completedLabel: (values) => values.email,
        type: 'email',
        validate: (values) => /.+@.+\..+/.test(values.email),
        error: 'Ingresa un e-mail válido.'
    },
    {
        key: 'name',
        label: 'Añade tu nombre completo',
        description: 'Se mostrará en tu perfil.',
        icon: User,
        completedLabel: (values) => `${values.firstName} ${values.lastName}`.trim(),
        type: 'text',
        validate: (values) => values.firstName.trim().length > 0 && values.lastName.trim().length > 0,
        error: 'Nombre y apellido no pueden estar vacíos.'
    },
    {
        key: 'phone',
        label: 'Agrega tu teléfono',
        description: 'Estaremos en contacto contigo.',
        icon: Phone,
        completedLabel: (values) => values.phoneNumber,
        type: 'tel',
        validate: (values) => /^\d{10}$/.test(values.phoneNumber),
        error: 'Ingresa un número de teléfono válido de 10 dígitos.'
    },
    {
        key: 'password',
        label: 'Crea tu contraseña',
        description: 'Ingresa y confirma tu contraseña para proteger tu cuenta.',
        icon: Lock,
        completedLabel: () => '••••••••',
        type: 'password',
        validate: (values) => values.password.length >= 6 && values.password === values.confirmPassword,
        error: 'La contraseña debe tener al menos 6 caracteres y coincidir en ambos campos.'
    },
    {
        key: 'success',
        label: 'Registro exitoso',
        description: '¡Tu cuenta ha sido creada exitosamente!',
        icon: BadgeCheck,
        completedLabel: '',
        type: 'success',
        validate: () => true,
        error: ''
    }
];

export default function Register() {
    const [values, setValues] = useState({ email: '', firstName: '', lastName: '', phoneNumber: '', password: '', confirmPassword: '' });
    const [completed, setCompleted] = useState({ email: false, name: false, phone: false, password: false, success: false });
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showCompletedPassword, setShowCompletedPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const navigate = useNavigate();
    const [animatingStep, setAnimatingStep] = useState(currentStep);
    const prevStepRef = useRef(currentStep);

    useEffect(() => {
        if (prevStepRef.current !== currentStep) {
            setAnimatingStep(-1); // reset
            setTimeout(() => setAnimatingStep(currentStep), 10);
            prevStepRef.current = currentStep;
        }
    }, [currentStep]);

    const handleNext = () => {
        const step = steps[currentStep];
        const isValid = step.validate(values);
        if (!isValid) {
            setError(step.error);
            return;
        }
        setError('');
        setCompleted((prev) => ({ ...prev, [step.key]: true }));
        setCurrentStep((prev) => prev + 1);
    };

    const handleEdit = (idx) => {
        setCurrentStep(idx);
        setCompleted((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((k, i) => {
                if (i >= idx) updated[k] = false;
            });
            return updated;
        });
        setError('');
    };

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleConfirm = async () => {
        setLoading(true);
        setRegisterError('');
        try {
            await registerUser({
                email: values.email,
                password: values.password,
                name: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber,
                role: 'GENERAL_CUSTOMER',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                createdBy: 'ADMIN',
            });
            setLoading(false);
            toast.success('¡Registro exitoso!');
            navigate('/user-home');
        } catch (err) {
            setLoading(false);
            setRegisterError(typeof err === 'string' ? err : (err?.message || 'Error al registrar usuario.'));
            toast.error(typeof err === 'string' ? err : (err?.message || 'Error al registrar usuario.'));
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 via-yellow-50 to-white px-2">
                <div className="bg-transparent p-2 sm:p-8 w-full max-w-2xl mx-auto">
                    <div className="flex justify-center items-center">
                        <img
                            src="/Tipografia_LIBAMAQ.png"
                            alt="Libamaq"
                            className="h-20 sm:h-28 mb-0"
                        />
                    </div>
                    <div className="flex flex-col gap-0">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isCompleted = completed[step.key];
                            const isActive = currentStep === idx;
                            return (
                                <div key={step.key} className="flex items-stretch relative group w-full">
                                    {/* Línea arriba */}
                                    {idx > 0 && (
                                        <div className={`absolute left-7 top-0 w-0.5 h-1/2 z-0 ${isCompleted || currentStep > idx ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                                    )}
                                    {/* Icono timeline */}
                                    <div className="flex flex-col items-center z-10 min-w-[56px]">
                                        <div className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-colors
                    ${isCompleted || (isActive && step.key === 'success') ? 'bg-green-100 border-green-500' : isActive ? 'bg-blue-50 border-blue-500' : 'bg-gray-100 border-gray-300'}`}
                                        >
                                            {(isCompleted || (isActive && step.key === 'success')) ? (
                                                <CheckCircle className="w-7 h-7 text-green-500" />
                                            ) : (
                                                <Icon className={`w-7 h-7 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                            )}
                                        </div>
                                        {/* Línea abajo */}
                                        {idx < steps.length - 1 && !(idx === steps.length - 2 && completed.success) && (
                                            <div className={`w-1 flex-1 ${completed[steps[idx + 1].key] || currentStep > idx ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                                        )}
                                    </div>
                                    {/* Contenido del paso */}
                                    <div
                                        className={`flex-1 ml-4 sm:ml-6 py-2 flex flex-col justify-center ${isActive ? 'z-10' : ''}
                    ${isActive && animatingStep === idx ? 'transition-all duration-500 ease-in-out opacity-100 translate-x-0' : ''}
                    ${isActive && animatingStep !== idx ? 'opacity-0 translate-x-4' : ''}`}
                                        style={{ minHeight: '80px' }}
                                    >
                                        {isActive ? (
                                            step.key === 'success' ? (
                                                <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col items-center w-full">
                                                    <BadgeCheck className="w-13 h-13 text-green-500 mb-0" />
                                                    <div className="w-full sm:w-[80%] text-lg sm:text-xl font-bold text-green-700 mb-6 text-center">
                                                        ¡Asegurate de que tus datos sean correctos antes de confirmar!
                                                    </div>
                                                    {registerError && <div className="text-red-500 text-sm mb-4">{registerError}</div>}
                                                    <Button
                                                        className="w-full max-w-xs cursor-pointer bg-white hover:bg-blue-700 border border-blue-600 text-blue-600 hover:text-white transition-all duration-600"
                                                        size="lg"
                                                        onClick={handleConfirm}
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Registrando...' : 'Confirmar datos'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-xl shadow p-4 sm:p-6 w-full">
                                                    <form
                                                        onSubmit={e => {
                                                            e.preventDefault();
                                                            handleNext();
                                                        }}
                                                    >
                                                        <div className="font-semibold text-base sm:text-lg mb-1">{step.label}</div>
                                                        <div className="text-gray-500 text-xs sm:text-sm mb-4">{step.description}</div>
                                                        {step.key === 'email' && (
                                                            <Input
                                                                name="email"
                                                                type="email"
                                                                autoComplete="email"
                                                                value={values.email}
                                                                onChange={handleChange}
                                                                className="mb-4 w-full"
                                                            />
                                                        )}
                                                        {step.key === 'name' && (
                                                            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                                                                <Input
                                                                    name="firstName"
                                                                    type="text"
                                                                    placeholder="Nombre"
                                                                    autoComplete="given-name"
                                                                    value={values.firstName}
                                                                    onChange={handleChange}
                                                                    className="w-full"
                                                                />
                                                                <Input
                                                                    name="lastName"
                                                                    type="text"
                                                                    placeholder="Apellido"
                                                                    autoComplete="family-name"
                                                                    value={values.lastName}
                                                                    onChange={handleChange}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                        )}
                                                        {step.key === 'phone' && (
                                                            <Input
                                                                name="phoneNumber"
                                                                type="tel"
                                                                placeholder="Teléfono (10 dígitos)"
                                                                autoComplete="tel"
                                                                value={values.phoneNumber}
                                                                onChange={handleChange}
                                                                className="mb-4 w-full"
                                                                maxLength={10}
                                                            />
                                                        )}
                                                        {step.key === 'password' && (
                                                            <>
                                                                <div className="relative mb-4">
                                                                    <Input
                                                                        name="password"
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="Contraseña"
                                                                        autoComplete="new-password"
                                                                        value={values.password}
                                                                        onChange={handleChange}
                                                                        className="w-full"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                                                        tabIndex={-1}
                                                                        onClick={() => setShowPassword((v) => !v)}
                                                                    >
                                                                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                                <div className="relative mb-4">
                                                                    <Input
                                                                        name="confirmPassword"
                                                                        type={showConfirmPassword ? "text" : "password"}
                                                                        placeholder="Confirmar contraseña"
                                                                        autoComplete="new-password"
                                                                        value={values.confirmPassword}
                                                                        onChange={handleChange}
                                                                        className="w-full"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                                                                        tabIndex={-1}
                                                                        onClick={() => setShowConfirmPassword((v) => !v)}
                                                                    >
                                                                        {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                        {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
                                                        <div className="flex justify-center items-center">
                                                            <Button
                                                                type="submit"
                                                                className="w-full sm:w-[40%] cursor-pointer bg-white hover:bg-blue-700 border border-blue-600 text-blue-600 hover:text-white transition-all duration-600">
                                                                {idx === steps.length - 2 ? 'Registrar' : 'Agregar'}
                                                            </Button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )
                                        ) : (
                                            <div className="pl-2 flex flex-col justify-center h-full">
                                                <div className="font-semibold text-base sm:text-lg mb-0">{step.label}</div>
                                                <div className="text-gray-500 text-xs sm:text-sm mb-1">{step.description}</div>
                                                {completed[step.key] && step.key !== 'success' && (
                                                    <div className="flex items-center gap-2 mt-0">
                                                        <span className="text-green-600 font-medium">
                                                            {step.key === 'password' ? (
                                                                <>
                                                                    {showCompletedPassword ? values.password : '••••••••'}
                                                                    <Button
                                                                        type="button"
                                                                        className="ml-2 text-gray-900 hover:bg-orange-100 transition-all duration-600 rounded-full bg-transparent border-none shadow-none"
                                                                        onClick={() => setShowCompletedPassword((v) => !v)}
                                                                    >
                                                                        {showCompletedPassword ? <Eye className="w-5 h-5 inline" /> : <EyeOff className="w-5 h-5 inline" />}
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                typeof step.completedLabel === 'function' ? step.completedLabel(values) : step.completedLabel
                                                            )}
                                                        </span>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(idx)} className="hover:bg-orange-100 transition-all duration-600 rounded-full">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Toaster position="top-center"
                reverseOrder={false}
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                        },
                    },
                }} />
        </>
    );
}
