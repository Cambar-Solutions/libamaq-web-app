import React, { useState, useEffect } from 'react';
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
  // Inicializar con los valores existentes o una fila vacía
  const [inputRows, setInputRows] = useState(
    values.length > 0 
      ? values.map(item => ({ key: item.key || '', value: item.value || '' })) 
      : [{ key: '', value: '' }]
  );

  // Actualizar los valores cuando cambian los props
  useEffect(() => {
    if (values.length === 0 && inputRows.length === 1 && !inputRows[0].key && !inputRows[0].value) {
      return; // No hacer nada si ambos están vacíos
    }
    
    const validRows = inputRows.filter(row => row.key.trim() || row.value.trim());
    const newValues = validRows.map(row => ({
      key: row.key.trim(),
      value: row.value.trim()
    }));
    
    // Solo actualizar si hay cambios
    if (JSON.stringify(newValues) !== JSON.stringify(values)) {
      onChange(newValues);
    }
  }, [inputRows, values, onChange]);

  // Agregar una nueva fila de inputs
  const addNewRow = (e) => {
    e?.preventDefault?.();
    setInputRows([...inputRows, { key: '', value: '' }]);
  };

  // Actualizar una fila específica
  const updateRow = (index, field, value) => {
    const newRows = [...inputRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setInputRows(newRows);
  };

  // Eliminar una fila específica
  const removeRow = (index) => {
    if (inputRows.length > 1) {
      const newRows = inputRows.filter((_, i) => i !== index);
      setInputRows(newRows);
    }
  };

  const handleRemove = (index) => {
    const newValues = Array.isArray(values) ? [...values] : [];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };
  
  // Asegurarse de que values sea un array
  const safeValues = Array.isArray(values) ? values : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {inputRows.map((row, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder={placeholderKey}
              value={row.key}
              onChange={(e) => updateRow(index, 'key', e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder={placeholderValue}
              value={row.value}
              onChange={(e) => updateRow(index, 'value', e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={() => removeRow(index)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              disabled={inputRows.length <= 1}
              title="Eliminar fila"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex justify-start mt-2">
          <Button
            type="button"
            onClick={addNewRow}
            variant="outline"
            size="sm"
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Agregar más
          </Button>
        </div>
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
