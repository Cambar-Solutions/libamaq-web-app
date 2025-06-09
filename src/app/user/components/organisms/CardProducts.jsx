import React, { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function CardProducts({ sectionRef, brand, selectedCategory, isLoading, filteredProducts }) {
    return (
        <div className="max-w-full mx-auto">
            <div ref={sectionRef} className="max-w-8xl w-full mx-auto px-4">
                <div className="mb-6 mt-8 w-full">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                        {brand
                            ? selectedCategory
                                ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} - ${selectedCategory.replace(/-/g, ' ')}`
                                : `Productos ${brand.charAt(0).toUpperCase() + brand.slice(1)}`
                            : selectedCategory
                                ? selectedCategory.replace(/-/g, ' ')
                                : 'Todos los productos'}
                    </h1>
                </div>
                <div className="bg-gray-100 min-h-[90vh] rounded-t-[3rem] shadow-inner px-6 py-10 mt-6 w-full mx-auto flex-grow">
                    <div className="w-full mx-auto">
                        {isLoading ? (
                            <p className="text-center">Cargando productos...</p>
                        ) : filteredProducts.length > 0 ? (
                            <div className="cursor-pointer grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 mb-8">
                                {filteredProducts.map((item, index) => (
                                    <Link to={`/producto/${item.id}`} key={index} className="w-full">
                                        <Card className="h-[25em] flex flex-col bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden mx-auto w-full cursor-pointer">
                                            <CardHeader>
                                                <img
                                                    src={item.images && item.images.length > 0 ? item.images[0] : "/placeholder-product.png"}
                                                    alt={item.name}
                                                    className="w-full h-50 object-contain"
                                                />
                                            </CardHeader>
                                            <CardContent className="flex flex-col flex-grow justify-between p-3 mb-5">
                                                <CardTitle className="text-lg "> {item.name} </CardTitle>
                                                <CardDescription className="truncate">{item.shortDescription}</CardDescription>
                                                <p className="mt-2 font-bold text-2xl text-blue-700">${item.price?.toLocaleString()}</p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
                                <button onClick={() => setSearchTerm('')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Ver todos los productos</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
