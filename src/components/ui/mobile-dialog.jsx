import React from "react";
import { Dialog as ShadcnDialog } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const MobileDialog = ShadcnDialog;

const MobileDialogTrigger = DialogPrimitive.Trigger;

const MobileDialogClose = DialogPrimitive.Close;

const MobileDialogPortal = DialogPrimitive.Portal;

const MobileDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
MobileDialogOverlay.displayName = "MobileDialogOverlay";

const MobileDialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <MobileDialogPortal>
      <MobileDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-3 md:p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg md:max-w-[800px]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </MobileDialogPortal>
  )
);
MobileDialogContent.displayName = "MobileDialogContent";

const MobileDialogHeader = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-left p-3 md:p-6",
      className
    )}
    {...props}
  />
);
MobileDialogHeader.displayName = "MobileDialogHeader";

const MobileDialogFooter = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-3 md:p-6",
      className
    )}
    {...props}
  />
);
MobileDialogFooter.displayName = "MobileDialogFooter";

const MobileDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-xl md:text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
MobileDialogTitle.displayName = "MobileDialogTitle";

const MobileDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-xs md:text-sm text-muted-foreground", className)}
    {...props}
  />
));
MobileDialogDescription.displayName = "MobileDialogDescription";

export {
  MobileDialog,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
  MobileDialogClose,
};
