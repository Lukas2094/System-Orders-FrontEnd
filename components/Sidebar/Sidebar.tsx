"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaSignOutAlt, FaChevronDown, FaChevronRight } from "react-icons/fa";
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
    const fetchMenus = async (roleId: number) => {
      try {
        const response = await api.get(`/menus/role/${roleId}`);
        if (response.status !== 200) return;

        const menusFromApi = response.data.data || [];
        // Marca menus que têm submenus
        const enhancedMenus = menusFromApi.map((menu: any) => ({
          ...menu,
          hasDropdown: Array.isArray(menu.submenus) && menu.submenus.length > 0,
        }));

        setMenus(enhancedMenus);
      } catch (error) {
        console.error("Erro ao buscar menus:", error);
      }
    };

    if (role) {
      const roleId = typeof role === "object" ? role.id : role;
      if (typeof roleId === "number") fetchMenus(roleId);
    }
  }, [role]);

  useEffect(() => {
    socket.on("menuCreated", (menu) => {
      const enhancedMenu = {
        ...menu,
        hasDropdown: Array.isArray(menu.submenus) && menu.submenus.length > 0,
      };
      setMenus((prev) => [...prev, enhancedMenu]);
    });

    socket.on("menuUpdated", (menu) => {
      const enhancedMenu = {
        ...menu,
        hasDropdown: Array.isArray(menu.submenus) && menu.submenus.length > 0,
      };
      setMenus((prev) => prev.map((m) => (m.id === menu.id ? enhancedMenu : m)));
    });

    socket.on("menuDeleted", (menuId) =>
      setMenus((prev) => prev.filter((m) => m.id !== menuId))
    );

    // 🔥 Submenu atualizado → atualizar apenas dentro do menu correspondente
    socket.on("submenuUpdated", (submenu) => {
      setMenus((prev) =>
        prev.map((menu) =>
          menu.id === submenu.menuId
            ? {
              ...menu,
              submenus: menu.submenus.map((s: any) =>
                s.id === submenu.id ? submenu : s
              ),
            }
            : menu
        )
      );
    });

    // 🔥 Submenu deletado → remover do menu correspondente
    socket.on("submenuDeleted", (submenuId) => {
      setMenus((prev) =>
        prev.map((menu) => ({
          ...menu,
          submenus: menu.submenus.filter((s: any) => s.id !== submenuId),
          hasDropdown: menu.submenus.length > 1, // corrige o hasDropdown
        }))
      );
    });

    return () => {
      socket.off("menuCreated");
      socket.off("menuUpdated");
      socket.off("menuDeleted");
      socket.off("submenuUpdated");
      socket.off("submenuDeleted");
    };
  }, []);

  const toggleDropdown = (menuId: string) => {
    setOpenDropdown(openDropdown === menuId ? null : menuId);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
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
          className={`transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-100 w-10"}`}
        />
      </Link>

      <nav className="flex flex-col gap-1 flex-grow">
        {menus.map((menu) => {
          let Icon;
          Icon = (Icons as any)[menu.icon] || Icons.FaBox;
          
          if (menu.hasDropdown) {
            return (
              <div key={menu.id} className="flex flex-col">
                <button
                  onClick={() => toggleDropdown(menu.id.toString())}
                  className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-700 transition w-full cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                      {menu.name}
                    </span>
                  </div>
                  {isExpanded && (
                    <span className="transition-all duration-300">
                      {openDropdown === menu.id.toString() ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                    </span>
                  )}
                </button>

                {openDropdown === menu.id.toString() && isExpanded && menu.submenus?.length > 0 && (
                  <div className="ml-6 mt-1 flex flex-col gap-1 border-l-2 border-gray-600 pl-3">
                    {menu.submenus.map((submenu: any, index: number) => {
                      const SubIcon = (Icons as any)[submenu.icon] || Icons.FaBox;
                      return (
                        <Link
                          key={submenu.id || `submenu-${menu.id}-${index}`} 
                          href={submenu.path}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition text-sm cursor-pointer"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <SubIcon size={16} />
                          <span className="whitespace-nowrap">{submenu.name}</span>
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
              <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                {menu.name}
              </span>
            </Link>
          );
        })}

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 transition w-full group cursor-pointer"
          >
            <FaSignOutAlt size={20} className="group-hover:text-red-400 transition-colors" />
            <span className={`whitespace-nowrap transition-all duration-300 ${isExpanded ? "opacity-100" : "opacity-0 w-0"} group-hover:text-red-400`}>
              Sair
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
