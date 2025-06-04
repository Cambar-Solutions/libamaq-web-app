import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Componente para ingresar datos técnicos en formato clave:valor
 * @param {Object} props - Propiedades del componente
 * @param {string|Array} props.value - Valor actual (string separado por comas o array de objetos {key, value})
 * @param {Function} props.onChange - Función que se llama cuando cambia el valor
 * @param {string} [props.placeholder] - Texto de ejemplo a mostrar
 * @returns {JSX.Element} Componente de entrada de texto para datos técnicos
 */
const InputData = ({ 
  value = '', 
  onChange, 
  placeholder = 'Ejemplo: Poder:75w' 
}) => {
  const [pairs, setPairs] = useState([{ id: 1, key: '', value: '' }]);
  const [isDirty, setIsDirty] = useState(false);

  // Función para convertir el valor de entrada a un array de pares
  const parseValueToPairs = (val) => {
    if (!val) return [{ id: 1, key: '', value: '' }];
    
    // Si es un array de objetos
    if (Array.isArray(val)) {
      return val.length > 0 
        ? val.map((item, index) => ({
            id: index + 1,
            key: typeof item === 'object' ? (item.key || '') : '',
            value: typeof item === 'object' ? (item.value || '') : String(item)
          }))
        : [{ id: 1, key: '', value: '' }];
    }
    
    // Si es un string
    if (typeof val === 'string') {
      const pairsArray = val
        .split(',')
        .filter(pair => pair.includes(':'))
        .map((pair, index) => {
          const [key, ...valueParts] = pair.split(':');
          return {
            id: index + 1,
            key: key?.trim() || '',
            value: valueParts.join(':').trim()
          };
        });
      
      return pairsArray.length > 0 ? pairsArray : [{ id: 1, key: '', value: '' }];
    }
    
    return [{ id: 1, key: '', value: '' }];
  };

  // Inicializar con el valor proporcionado
  useEffect(() => {
    if (value !== undefined && !isDirty) {
      setPairs(parseValueToPairs(value));
    }
  }, [value, isDirty]);

  // Manejar cambios en un campo de entrada
  const handlePairChange = (id, field, newValue) => {
    setIsDirty(true);
    setPairs(prevPairs =>
      prevPairs.map(pair =>
        pair.id === id ? { ...pair, [field]: newValue } : pair
      )
    );
  };

  // Agregar un nuevo campo de entrada
  const addNewPair = () => {
    const newId = pairs.length > 0 ? Math.max(...pairs.map(p => p.id)) + 1 : 1;
    setPairs(prevPairs => [...prevPairs, { id: newId, key: '', value: '' }]);
  };

  // Eliminar un campo de entrada
  const removePair = (id) => {
    if (pairs.length > 1) {
      setPairs(prevPairs => prevPairs.filter(pair => pair.id !== id));
      setIsDirty(true);
    }
  };

  // Convertir los pares al formato de salida
  const handleSaveChanges = () => {
    // Filtrar pares vacíos
    const validPairs = pairs
      .filter(pair => pair.key.trim() !== '' || pair.value.trim() !== '')
      .map(pair => ({
        key: pair.key.trim(),
        value: pair.value.trim()
      }));
    
    // Si no hay pares válidos, devolver string vacío
    if (validPairs.length === 0) {
      onChange('');
      return;
    }
    
    // Si el valor original era un array, devolver un array de objetos
    if (Array.isArray(value) || (typeof value === 'string' && value.trim() === '')) {
      onChange(validPairs);
    } else {
      // Si el valor original era un string, devolver string separado por comas
      const resultString = validPairs
        .map(pair => `${pair.key}:${pair.value}`)
        .join(',');
      onChange(resultString);
    }
    
    setIsDirty(false);
  };

  // Manejar el evento de teclado para agregar automáticamente un nuevo campo al presionar Enter
  const handleKeyDown = (e, id, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'value') {
        addNewPair();
      } else if (field === 'key' && pairs.find(p => p.id === id)?.value) {
        // Si estamos en el campo de clave y ya hay un valor, mover al siguiente campo
        const nextInput = e.target.closest('.pair-input')?.querySelector('.value-input');
        if (nextInput) nextInput.focus();
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="pair-input flex items-center gap-2">
            <div className="flex gap-2 flex-1">
              <div className="flex-1">
                <Input
                  type="text"
                  value={pair.key}
                  onChange={(e) => handlePairChange(pair.id, 'key', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, pair.id, 'key')}
                  placeholder={index === 0 ? 'Clave' : ''}
                  className="key-input"
                />
              </div>
              <div className="flex items-center text-gray-400">:</div>
              <div className="flex-1">
                <Input
                  type="text"
                  value={pair.value}
                  onChange={(e) => handlePairChange(pair.id, 'value', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, pair.id, 'value')}
                  placeholder={index === 0 ? 'Valor' : ''}
                  className="value-input"
                />
              </div>
              {pairs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePair(pair.id)}
                  className="text-muted-foreground hover:text-destructive flex items-center justify-center w-8"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewPair}
          className="text-xs h-8"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Agregar característica
        </Button>

        <Button
          type="button"
          onClick={handleSaveChanges}
          variant="default"
          size="sm"
          className="text-xs h-8"
          disabled={!isDirty}
        >
          Guardar cambios
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Escriba cada característica con el formato <code>clave:valor</code>
      </p>
    </div>
  );
};

export default InputData;
