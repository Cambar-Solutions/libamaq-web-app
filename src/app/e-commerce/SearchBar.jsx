import { FaSearch } from "react-icons/fa";

const SearchBar = () => {
  return (
    <div className="w-full bg-white py-4 px-6 mt-[1em] fixed top-16 left-0 z-30">
      <div className="flex justify-center items-center w-full max-w-4xl mx-auto">
        <input
          type="search"
          placeholder="Buscar productos..."
          className="w-3/4 p-3 border-2 border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
        />
        <button className="bg-blue-600 text-white p-4 rounded-r-full">
          <FaSearch size={20} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
