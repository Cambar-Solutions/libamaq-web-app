import React from 'react'

export default function FilterByDate({ filterDate, setFilterDate }) {
    return (
        <>
            <div className="mt-4 sm:mt-0 flex items-center">
                <label className="mr-2 font-medium text-gray-700">Filtrar fecha:</label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="bg-white cursor-text px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring focus:ring-blue-700"
                />
                {filterDate && (
                    <button
                        onClick={() => setFilterDate("")}
                        className="ml-2 text-sm text-indigo-500 font-medium hover:underline cursor-pointer"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </>
    )
}
