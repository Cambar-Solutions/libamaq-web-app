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
    <form {...props} className="flex flex-col sm:flex-row gap-4 items-center pl-14">
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

      {/* Filtro por marca */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm  whitespace-nowrap">Filtra por:</h4> 
        <Select name="marca" aria-label="Filtrar por marca">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Marcas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bosch">🔧 Bosch</SelectItem>
            <SelectItem value="hunter">⚙️ Hunter</SelectItem>
            <SelectItem value="system">🔩 System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
}
