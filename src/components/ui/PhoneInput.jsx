import * as React from "react";
import { Input } from "./input";

const COUNTRY_CODES = [
  { code: "+52", label: "MX" },
  { code: "+1", label: "US/CA" },
  { code: "+54", label: "AR" },
  { code: "+57", label: "CO" },
  { code: "+56", label: "CL" },
  // Puedes agregar más países aquí
];

/**
 * Componente reutilizable para capturar números de teléfono mexicanos (+52).
 * Props:
 * - value: string (debe incluir o anteponer +52)
 * - onChange: function (recibe el valor completo, incluyendo +52)
 * - error: boolean (si hay error de validación)
 * - disabled, required, placeholder, name, id, ...rest
 * - maxDigits: número de dígitos después de +52 (default: 10)
 * - helperText: texto de ayuda opcional
 * - errorText: texto de error opcional
 * - showPrefix: boolean para mostrar u ocultar el prefijo +52
 */
export function PhoneInput({
  value = '',
  onChange,
  error = false,
  disabled = false,
  required = false,
  placeholder = '10 dígitos',
  name = 'telefono',
  id = 'telefono',
  maxDigits = 10,
  helperText = '',
  errorText = `El número de teléfono debe tener ${maxDigits} dígitos`,
  ...rest
}) {
  // Extraer lada y número
  let lada = '';
  let numero = '';
  // Si el valor empieza con una lada válida, úsala
  const ladaMatch = COUNTRY_CODES.find(opt => value.startsWith(opt.code));
  if (ladaMatch) {
    lada = ladaMatch.code;
    numero = value.slice(lada.length).replace(/\D/g, '').slice(0, 10);
  } else {
    // Si no hay lada válida, asume la primera opción
    lada = COUNTRY_CODES[0].code;
    numero = value.replace(/\D/g, '').slice(0, 10);
  }

  // Cambiar lada
  const handleLadaChange = (e) => {
    const newLada = e.target.value;
    // Siempre recorta a 10 dígitos
    const cleanNumero = numero.replace(/\D/g, '').slice(0, 10);
    if (onChange) {
      onChange(newLada + cleanNumero);
    }
  };

  // Cambiar número
  const handleInput = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (onChange) {
      onChange(lada + digits);
    }
  };

  return (
    <div>
      <div className="flex rounded-md shadow-sm">
        <select
          value={lada}
          onChange={handleLadaChange}
          disabled={disabled}
          className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minWidth: 70 }}
        >
          {COUNTRY_CODES.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.label} {opt.code}</option>
          ))}
        </select>
        <Input
          id={id}
          name={name}
          value={numero}
          onChange={handleInput}
          className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border-l-0 ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
          maxLength={10}
          type="tel"
          pattern={`[0-9]{10}`}
          title={`Ingresa un número de 10 dígitos`}
          disabled={disabled}
          required={required}
          aria-invalid={error}
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{errorText}</p>
      )}
    </div>
  );
} 