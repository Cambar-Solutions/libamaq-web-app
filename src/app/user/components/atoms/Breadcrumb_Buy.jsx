import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    ShoppingBag
} from "lucide-react"

export default function Breadcrumb_Buy({ setSelected }) {
    return (
        <>
            <div className="text-sm lg:text-base max-w-6xl mx-auto px-4 mb-4">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink
                                onClick={() => setSelected(null)}
                                className="flex items-center text-gray-700 hover:text-blue-700 cursor-default">
                                <ShoppingBag size={18} className="mr-1" />
                                Mis Compras
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="transition-colors duration-300 font-semibold text-blue-700 select-none">
                                Estado del pedido
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </>
    )
}
