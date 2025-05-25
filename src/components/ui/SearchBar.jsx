import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SearchBar = ({ 
  value, 
  onChange, 
  onSearchClick, // New prop for when the search button is clicked
  placeholder = 'Buscar...', 
  className,
  inputClassName
  // clearable prop is removed as it's not in the new design
}) => {
  const handleSearch = () => {
    if (onSearchClick) {
      onSearchClick(value);
    }
    // If no onSearchClick is provided, the button click might do nothing
    // or you could add default behavior here, e.g., form submission if wrapped in a form
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-md border border-gray-300 rounded-full shadow-sm bg-white overflow-hidden", className)}>
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "flex-grow w-full py-2.5 pl-4 pr-2 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none focus:outline-none focus:ring-0",
          inputClassName
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      <button
        type="button"
        onClick={handleSearch}
        className="flex items-center justify-center px-4 py-1.5 m-1 rounded-full bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 transition-colors duration-150"
      >
        <Search className="h-4 w-4 mr-2" />
        Buscar
      </button>
    </div>
  );
};
