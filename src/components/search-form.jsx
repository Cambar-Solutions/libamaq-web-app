import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchForm({ ...props }) {
  return (
    <form {...props} 
    className="flex flex-col sm:flex-row gap-4 items-center justify-between px-4 sm:px-0">
      {/* Input de búsqueda */}
      <div className="relative w-full sm:max-w-[250px] ">
        <Label htmlFor="search" className="sr-only">
          Buscar
        </Label>
        <SidebarInput
          id="search"
          name="search"
          placeholder="Pulsa para buscar..."
          className="h-10 pl-10 w-full "
          aria-label="Buscar"
        />
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 opacity-50" />
      </div>

     
    </form>
  );
}
