import NavCustomer from "@/components/NavCustomer";
import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAllPublicProducts } from "@/services/public/productService";
import { getAllBrandsWithCategories } from "@/services/public/brandService";
import { toast } from "sonner";
import { GrUserWorker } from "react-icons/gr";
import SidebarCustomer from '@/components/SidebarCustomer';
import ProfilePanel from "@/app/user/sidebar/ProfilePanel";
import BuyPanel from "@/app/user/sidebar/BuyPanel";
import OrderPanel from "@/app/user/sidebar/OrderPanel";
import RentalPanel from "@/app/user/sidebar/RentalPanel";
import CarPanel from "@/app/user/sidebar/CarPanel";

export default function Account() {
    const [activeSection, setActiveSection] = useState("perfil");

    const panels = {
        perfil: <ProfilePanel />,
        compras: <BuyPanel />,
        pedidos: <OrderPanel />,
        rentas: <RentalPanel />,
        carrito: <CarPanel />,
    };

    return (
        <>
            <NavCustomer />

            <SidebarCustomer
                activeKey={activeSection}
                onSelect={setActiveSection}
            >
                {panels[activeSection]}
            </SidebarCustomer>
        </>
    );
}