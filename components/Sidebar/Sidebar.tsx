"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaBox, FaHome, FaUsers } from "react-icons/fa";

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`h-screen bg-gray-800 text-white flex flex-col p-4 transition-all duration-300 
                ${isExpanded ? "w-64" : "w-20"}`}
        >
            <Link href="/" className="flex items-center mb-6">
                <Image
                    src="/imgs/png/order.png"
                    alt="Sidebar Logo" 
                    width={isExpanded ? 150 : 50}
                    height={isExpanded ? 150 : 50}
                    className={`text-2xl font-bold mb-6 whitespace-nowrap overflow-hidden transition-all duration-300 
                        ${isExpanded ? "opacity-100" : "opacity-100 w-10"}`}
                />
            </Link>
            
            
            <nav className="flex flex-col gap-4">
                <Link href="/" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition">
                    <FaHome size={20} />
                    <span
                        className={`whitespace-nowrap transition-all duration-300 
                            ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                        Pedidos
                    </span>
                </Link>

                <Link href="/products" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition">
                    <FaBox size={20} />
                    <span
                        className={`whitespace-nowrap transition-all duration-300 
                            ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                        Produtos
                    </span>
                </Link>

                <Link href="/users" className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition">
                    <FaUsers size={20} />
                    <span
                        className={`whitespace-nowrap transition-all duration-300 
                            ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                        Usuários
                    </span>
                </Link>
            </nav>
        </div>
    );
}
