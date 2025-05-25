import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Edit, X } from "lucide-react";
import { OrderDetailsDesktop, OrderDetailsMobile } from './OrderDetails';

export const OrderDetailDialogs = ({ 
  selectedOrder, 
  isDialogOpen, 
  setIsDialogOpen, 
  isDrawerOpen, 
  setIsDrawerOpen 
}) => {
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
            <Button>Editar Pedido</Button>
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
            <Button size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
