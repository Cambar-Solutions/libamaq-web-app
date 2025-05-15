import React from "react";
import {
    FiShoppingCart,
    FiClipboard,
    FiDollarSign,
    FiChevronLeft,
    FiChevronRight,
    FiUser,
    FiShoppingBag
} from "react-icons/fi";
import { MdOutlineShoppingBag } from "react-icons/md";


const menuItems = [
    { key: "compras", label: "Mis compras", icon: <MdOutlineShoppingBag /> },
    { key: "pedidos", label: "Mis pedidos", icon: < FiClipboard /> },
    { key: "rentas", label: "Ver rentas", icon: <FiDollarSign /> },
    { key: "carrito", label: "Ver carrito", icon: <FiShoppingCart /> },
    { key: "perfil", label: "Perfil", icon: <FiUser /> },
];

export default function SidebarCustomer({ activeKey, onSelect, children }) {

    // Inicializa desde localStorage (si no existe, default false)
  const [isOpen, setIsOpen] = React.useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored === null ? false : JSON.parse(stored);
  });

  const toggle = () => {
    setIsOpen(o => {
      const next = !o;
      localStorage.setItem("sidebarOpen", JSON.stringify(next));
      return next;
    });
  };

    return (
        <div className="flex h-screen">
            <aside className={`mt-20 bg-gradient-to-b from-blue-950 to-gray-100 border-r
                ${isOpen ? "w-50" : "w-16"} transition-width duration-300 flex flex-col`}>
                <button
                    onClick={toggle}
                    className={`p-2 m-2 mb-4
                        ${isOpen ? "self-end" : "self-center"} 
                        rounded hover:bg-gray-400 flex items-center justify-center text-white`}>
                        {isOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
                </button>
                {isOpen && (
                    <div className="px-4 mb-5">
                        <span className="text-lg font-bold text-white">Mi cuenta</span>
                    </div>
                )}

                <nav className="flex-1">
                    <ul>
                        {menuItems.map(item => {
                            const isActive = item.key === activeKey;
                            return (
                                <li key={item.key}>
                                    <button
                                        onClick={() => onSelect(item.key)}
                                        className={`flex items-center w-full p-2 mb-5 rounded hover:bg-gray-400
                                            ${isActive? "bg-blue-50 text-blue-600": "text-white"}
                                            ${isOpen ? "justify-start" : "justify-center"}`}>
                                        <span className="text-xl">{item.icon}</span>
                                        {isOpen && <span className="ml-3">{item.label}</span>}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

            </aside>

            {/* Aquí se renderea todo lo que le pases como children */}
            <main className="flex-1 overflow-auto bg-stone-100">
                {children}
            </main>
        </div>
    );
}
