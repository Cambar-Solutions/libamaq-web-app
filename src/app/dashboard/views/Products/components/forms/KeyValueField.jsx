import React from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const KeyValueField = ({
  label,
  keyName = 'key',
  valueName = 'value',
  keyPlaceholder = 'Clave',
  valuePlaceholder = 'Valor',
  addButtonText = 'Agregar',
  items = [],
  onChange,
  className = '',
  keyValidation,
  valueValidation,
  disabled = false
}) => {
  const [localItems, setLocalItems] = React.useState([{ [keyName]: '', [valueName]: '' }]);
  const [errors, setErrors] = React.useState({});

  // Sincronizar con los items externos cuando cambian
  React.useEffect(() => {
    if (items && items.length > 0) {
      setLocalItems([...items]);
    } else if (localItems.length === 0 || localItems[0][keyName] || localItems[0][valueName]) {
      setLocalItems([{ [keyName]: '', [valueName]: '' }]);
    }
  }, [items]);

  const handleAdd = () => {
    const newItems = [...localItems, { [keyName]: '', [valueName]: '' }];
    setLocalItems(newItems);
    if (onChange) {
      onChange(newItems.filter(item => item[keyName] || item[valueName]));
    }
  };

  const handleRemove = (index) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems.length > 0 ? newItems : [{ [keyName]: '', [valueName]: '' }]);
    
    const newErrors = { ...errors };
    delete newErrors[`${keyName}-${index}`];
    delete newErrors[`${valueName}-${index}`];
    setErrors(newErrors);
    
    if (onChange) {
      onChange(newItems.filter(item => item[keyName] || item[valueName]));
    }
  };

  const handleChange = (index, field, value) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Validación
    const newErrors = { ...errors };
    const fieldKey = `${field}-${index}`;
    
    if (field === keyName && keyValidation) {
      const error = keyValidation(value);
      if (error) {
        newErrors[fieldKey] = error;
      } else {
        delete newErrors[fieldKey];
      }
    } else if (field === valueName && valueValidation) {
      const error = valueValidation(value);
      if (error) {
        newErrors[fieldKey] = error;
      } else {
        delete newErrors[fieldKey];
      }
    }
    
    setErrors(newErrors);
    setLocalItems(newItems);
    
    if (onChange) {
      onChange(newItems.filter(item => item[keyName] || item[valueName]));
    }
  };

  const hasError = Object.keys(errors).length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-medium">{label}</label>}
      
      <div className="space-y-3">
        {localItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Input
                  placeholder={keyPlaceholder}
                  value={item[keyName] || ''}
                  onChange={(e) => handleChange(index, keyName, e.target.value)}
                  disabled={disabled}
                  className={errors[`${keyName}-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`${keyName}-${index}`] && (
                  <p className="text-xs text-red-500">{errors[`${keyName}-${index}`]}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  placeholder={valuePlaceholder}
                  value={item[valueName] || ''}
                  onChange={(e) => handleChange(index, valueName, e.target.value)}
                  disabled={disabled}
                  className={errors[`${valueName}-${index}`] ? 'border-red-500' : ''}
                />
                {errors[`${valueName}-${index}`] && (
                  <p className="text-xs text-red-500">{errors[`${valueName}-${index}`]}</p>
                )}
              </div>
            </div>
            {(!disabled || index > 0) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={handleAdd}
          disabled={disabled || hasError}
        >
          <Plus className="mr-2 h-4 w-4" />
          {addButtonText}
        </Button>
      </div>
    </div>
  );
};
