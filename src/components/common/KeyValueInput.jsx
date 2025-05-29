import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const KeyValueInput = ({ 
  values = [], 
  onChange, 
  placeholderKey = 'Clave', 
  placeholderValue = 'Valor' 
}) => {
  // Convertir valores iniciales a un formato consistente
  const initialValues = Array.isArray(values) ? values : [];
  
  // Estado local para manejar las filas de entrada
  const [inputRows, setInputRows] = useState(() => {
    return initialValues.length > 0 
      ? initialValues.map(item => ({ 
          key: item.key || '', 
          value: item.value || '' 
        })) 
      : [{ key: '', value: '' }];
  });

  // Sincronizar con los valores externos solo cuando cambian externamente
  useEffect(() => {
    // Solo actualizar si hay cambios reales
    const currentValues = inputRows
      .filter(row => row.key.trim() || row.value.trim())
      .map(row => ({
        key: row.key.trim(),
        value: row.value.trim()
      }));

    const newValues = initialValues.map(item => ({
      key: (item.key || '').trim(),
      value: (item.value || '').trim()
    }));

    if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
      setInputRows(
        initialValues.length > 0
          ? initialValues.map(item => ({
              key: item.key || '',
              value: item.value || ''
            }))
          : [{ key: '', value: '' }]
      );
    }
  }, [JSON.stringify(initialValues)]);

  // Actualizar el estado padre cuando cambian las filas
  const updateParent = useCallback((rows) => {
    const validRows = rows.filter(row => row.key.trim() || row.value.trim());
    const newValues = validRows.map(row => ({
      key: row.key.trim(),
      value: row.value.trim()
    }));
    
    onChange(newValues);
  }, [onChange]);

  // Agregar una nueva fila de inputs
  const addNewRow = (e) => {
    e?.preventDefault?.();
    const newRows = [...inputRows, { key: '', value: '' }];
    setInputRows(newRows);
  };

  // Actualizar una fila específica
  const updateRow = (index, field, value) => {
    const newRows = inputRows.map((row, i) => 
      i === index ? { ...row, [field]: value } : row
    );
    setInputRows(newRows);
    updateParent(newRows);
  };

  // Eliminar una fila específica
  const removeRow = (index) => {
    if (inputRows.length <= 1) return;
    
    const newRows = inputRows.filter((_, i) => i !== index);
    setInputRows(newRows);
    updateParent(newRows);
  };

  // Eliminar una fila de la tabla
  const handleRemove = (index) => {
    const newValues = [...initialValues];
    newValues.splice(index, 1);
    onChange(newValues);
  };
  
  // Asegurarse de que values sea un array
  const safeValues = initialValues;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {inputRows.map((row, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <Input
                placeholder={placeholderKey}
                value={row.key}
                onChange={(e) => updateRow(index, 'key', e.target.value)}
                className="flex-1 min-w-0"
              />
              <Input
                placeholder={placeholderValue}
                value={row.value}
                onChange={(e) => updateRow(index, 'value', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
            <div className="flex justify-end sm:justify-start">
              <Button
                type="button"
                onClick={() => removeRow(index)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 h-10 w-10"
                disabled={inputRows.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto mt-2"
          onClick={addNewRow}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar {placeholderKey}
        </Button>
      </div>

      {safeValues.length > 0 && (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Característica</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeValues.map((item, index) => (
                <TableRow key={`${item.key}-${index}`}>
                  <TableCell className="font-medium">{item.key}</TableCell>
                  <TableCell>{item.value}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default KeyValueInput;
