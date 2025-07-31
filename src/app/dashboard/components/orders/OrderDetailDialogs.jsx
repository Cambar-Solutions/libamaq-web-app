import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { OrderDetailsDesktop, OrderDetailsMobile } from './OrderDetails';
import { OrderSendGuideDialog } from './OrderSendGuideDialog';

export const OrderDetailDialogs = ({ 
  selectedOrder, 
  isDialogOpen, 
  setIsDialogOpen, 
  isDrawerOpen, 
  setIsDrawerOpen,
  onEditOrder // Nueva prop para manejar la edición
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const handleEdit = () => {
    setIsEditDialogOpen(true);
    // Cerrar el diálogo/drawer de detalles
    setIsDialogOpen(false);
    setIsDrawerOpen(false);
  };

  const handleSaveEdit = (updatedOrder) => {
    setIsEditDialogOpen(false);
    // Aquí podrías actualizar la orden en el estado padre si es necesario
  };

  return (
    <>
      {/* Dialog para desktop */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Pedido {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Información completa del pedido
            </DialogDescription>
          </DialogHeader>
          
          <OrderDetailsDesktop order={selectedOrder} />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cerrar</Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Drawer para móvil */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Pedido {selectedOrder?.id}</DrawerTitle>
            <DrawerDescription>
              Detalles del pedido
            </DrawerDescription>
          </DrawerHeader>
          
          <OrderDetailsMobile order={selectedOrder} />
          
          <DrawerFooter className="flex-row justify-end space-x-2">
            <DrawerClose asChild>
              <Button variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cerrar
              </Button>
            </DrawerClose>
            <Button size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Modal de edición */}
      <OrderSendGuideDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        order={selectedOrder}
        onSave={handleSaveEdit}
        onCancel={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
