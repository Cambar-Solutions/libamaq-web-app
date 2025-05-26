import { useState, useEffect } from 'react';
import { getAllSpareParts, deleteSparePart, getSparePartById } from '@/services/admin/sparePartService';
import { toast } from 'sonner';

export const useSpareParts = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'ACTIVE',
    page: 1,
    pageSize: 10
  });

  const fetchSpareParts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllSpareParts(
        filters.page || 1,
        filters.pageSize || 10,
        { 
          search: filters.search || '',
          status: filters.status || 'ACTIVE'
        }
      );
      setSpareParts(response.data || []);
    } catch (err) {
      console.error('Error al cargar repuestos:', err);
      setError('Error al cargar los repuestos');
      toast.error('No se pudieron cargar los repuestos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este repuesto?')) return;
    
    try {
      await deleteSparePart(id);
      toast.success('Repuesto eliminado correctamente');
      fetchSpareParts();
    } catch (err) {
      console.error('Error al eliminar repuesto:', err);
      toast.error('No se pudo eliminar el repuesto');
    }
  };

  useEffect(() => {
    fetchSpareParts();
  }, [filters]);

  return {
    spareParts,
    isLoading,
    error,
    filters,
    setFilters,
    handleDelete,
    refetch: fetchSpareParts
  };
};

export const useSparePartDetail = (sparePartId) => {
  const [sparePart, setSparePart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSparePartDetail = async () => {
    if (!sparePartId) {
      setSparePart(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getSparePartById(sparePartId);
      setSparePart(response.data || null);
    } catch (err) {
      console.error('Error al cargar detalle del repuesto:', err);
      setError('Error al cargar el repuesto');
      toast.error('No se pudo cargar el repuesto');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSparePartDetail();
  }, [sparePartId]);

  return {
    sparePart,
    isLoading,
    error,
    refetch: fetchSparePartDetail
  };
};
