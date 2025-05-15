import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { GrUserWorker } from "react-icons/gr";

export default function BuyPanel() {

    return (
        <>
            <div className="w-full bg-stone-100 min-h-screen pb-10 pt-1">
                <div className="max-w-6xl mx-auto px-4 mt-32 sticky top-16 z-10 bg-stone-200 shadow-md rounded-lg mb-6 p-3">
                    Compras aquí
                </div>
            </div>
        </>
    );
}