import React from 'react'

export default function FilterByDate({ filterDate, setFilterDate }) {
    return (
        <>
            <div className="mt-4 sm:mt-0 flex items-center">
                <label className="mr-2 font-medium">Filtrar fecha:</label>
                <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                    className="cursor-text px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
                {filterDate && (
                    <button
                        onClick={() => setFilterDate("")}
                        className="ml-2 text-sm text-gray-600 hover:underline"
                    >
                        Limpiar
                    </button>
                )}
            </div>
        </>
    )
}
