"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaSignOutAlt, FaChevronDown, FaChevronRight, FaCog } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRole } from "@/utils/RoleContext";
import io from "socket.io-client";
import { api } from "@/utils/api";

const socket = io(api.defaults.baseURL);

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const { role, name } = useRole();
  const [menus, setMenus] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await api.get("/menus");

        if (response.status !== 200) {
          console.error("Erro ao buscar menus:", response.statusText);
          return;
        }

        const filtered = response.data.filter((menu: any) =>
          menu.roles.some((r: any) => r.id === role)
        );

        const enhancedMenus = filtered.map((menu: any) => {
          if (menu.id === 3) {
            return {
              ...menu,
              hasDropdown: true,
              submenus: [
                { id: 31, name: "Lista de Usuários", path: "/users", icon: "FaUsers" },
                { id: 32, name: "Gerenciar Menu", path: "/menu", icon: "FaBars" }
              ]
            };
          }
          return {
            ...menu,
            hasDropdown: false
          };
        });

        setMenus(enhancedMenus);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
      }
    };

    if (role) fetchMenus();
  }, [role]);

  useEffect(() => {
    socket.on("menuCreated", (menu) => {
      const enhancedMenu = menu.id === 3
        ? {
          ...menu, hasDropdown: true, submenus: [
            { id: 31, name: "Lista de Usuários", path: "/users", icon: "FaUsers" },
            { id: 32, name: "Gerenciar Menu", path: "/menu", icon: "FaBars" }
          ]
        }
        : { ...menu, hasDropdown: false };

      setMenus((prev: any[]) => [...prev, enhancedMenu]);
    });

    socket.on("menuUpdated", (menu) => {
      const enhancedMenu = menu.id === 3
        ? {
          ...menu, hasDropdown: true, submenus: [
            { id: 31, name: "Lista de Usuários", path: "/users", icon: "FaUsers" },
            { id: 32, name: "Gerenciar Menu", path: "/menu", icon: "FaBars" }
          ]
        }
        : { ...menu, hasDropdown: false };

      setMenus((prev: any[]) => prev.map((m: any) => (m.id === menu.id ? enhancedMenu : m)));
    });

    socket.on("menuDeleted", (menuId) =>
      setMenus((prev: any[]) => prev.filter((m) => m.id !== menuId))
    );

    return () => {
      socket.off("menuCreated");
      socket.off("menuUpdated");
      socket.off("menuDeleted");
    };
  }, []);

  const toggleDropdown = (menuId: string) => {
    setOpenDropdown(openDropdown === menuId ? null : menuId);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  function Avatar({ name, isExpanded }: { name: string | null; isExpanded: boolean }) {
    if (!name) return null;
    const initials = name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");

    return (
      <div className="flex items-center mb-4 transition-all duration-300">
        <div
          className={`flex items-center justify-center bg-blue-600 text-white rounded-full h-12 text-lg font-bold 
            transition-all duration-300 ${isExpanded ? "px-4 w-auto rounded-full" : "w-12"}`}
        >
          {isExpanded ? name : initials}
        </div>
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setOpenDropdown(null);
      }}
      className={`h-screen bg-gray-800 text-white flex flex-col p-4 transition-all duration-300 
        ${isExpanded ? "w-64" : "w-20"} cursor-pointer`}
    >
      <Avatar name={name} isExpanded={isExpanded} />
      <Link href="/" className="flex items-center mb-6 cursor-pointer">
        <Image
          src="/imgs/png/order.png"
          alt="Sidebar Logo"
          unoptimized
          width={isExpanded ? 150 : 50}
          height={isExpanded ? 150 : 50}
          className={`text-2xl font-bold mb-6 whitespace-nowrap overflow-hidden transition-all duration-300 
            ${isExpanded ? "opacity-100" : "opacity-100 w-10"}`}
        />
      </Link>

      {/* Menus dinâmicos */}
      <nav className="flex flex-col gap-1 flex-grow">
        {menus.map((menu: any) => {
          // Use FaCog especificamente para o menu "Configurações"
          let Icon;
          if (menu.id === 3) {
            Icon = FaCog;
          } else {
            Icon = (Icons as any)[menu.icon as keyof typeof Icons] || Icons.FaBox;
          }

          if (menu.hasDropdown) {
            return (
              <div key={menu.id} className="flex flex-col">
                <button
                  onClick={() => toggleDropdown(menu.id.toString())}
                  className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-700 transition w-full cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span
                      className={`whitespace-nowrap transition-all duration-300 
                        ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}
                    >
                      {menu.name}
                    </span>
                  </div>
                  {isExpanded && (
                    <span className="transition-all duration-300">
                      {openDropdown === menu.id.toString() ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {/* Submenu Dropdown */}
                {openDropdown === menu.id.toString() && isExpanded && (
                  <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-gray-600 pl-3">
                    {menu.submenus.map((submenu: any) => {
                      const SubIcon = (Icons as any)[submenu.icon as keyof typeof Icons] || Icons.FaBox;
                      return (
                        <Link
                          key={submenu.id}
                          href={submenu.path}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition text-sm cursor-pointer"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <SubIcon size={16} />
                          <span className="whitespace-nowrap">
                            {submenu.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={menu.id}
              href={menu.path}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition cursor-pointer"
            >
              <Icon size={20} />
              <span
                className={`whitespace-nowrap transition-all duration-300 
                  ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}
              >
                {menu.name}
              </span>
            </Link>
          );
        })}

        {/* Botão de Logout */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition w-full group cursor-pointer"
          >
            <FaSignOutAlt size={20} className="group-hover:text-red-400 transition-colors" />
            <span
              className={`whitespace-nowrap transition-all duration-300 
                ${isExpanded ? "opacity-100" : "opacity-0 w-0"} 
                group-hover:text-red-400`}
            >
              Sair
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}