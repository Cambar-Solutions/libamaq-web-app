import React from 'react'

export default function CardCarProducts({ filtered, setSelected }) {
    return (
        <>
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {filtered.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">
                        No hay compras en esa fecha.
                    </p>
                )}
                {filtered.map(order => (
                    <div
                        key={order.id}
                        className="bg-white rounded-lg shadow-sm hover:shadow-lg duration-500 cursor-pointer overflow-hidden"
                        onClick={() => setSelected(order)}
                    >
                        <div className="mt-2 flex items-center text-xl text-gray-600 pl-5 py-3 border-b-2">
                            <span className="font-medium">{order.deliveredAt}</span>
                        </div>
                        <div className="px-10 sm:px-10 py-4 flex flex-col sm:flex-row items-center sm:items-center">
                            <img
                                src={order.img}
                                alt={order.name}
                                className="w-40 h-40 sm:h-48 object-cover rounded"
                            />
                            <div className="flex-1 ml-4 sm:mt-0 sm:ml-4">
                                <h2 className="text-2xl font-semibold">{order.name}</h2>
                                <p className="text-lg text-gray-600">{order.brand}</p>
                                <p className="mt-1 text-gray-700 line-clamp-3 w-[80%] text-justify">
                                    {order.description}
                                </p>
                            </div>
                            <div className="flex flex-col items-center sm:mt-0">
                                <span className="text-xl font-semibold">
                                    ${order.price.toLocaleString()}
                                </span>
                                <span
                                    className={`mt-2 px-2 py-1 rounded-full text-sm font-medium ${order.status === "Entregado"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                        }`}
                                >
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}