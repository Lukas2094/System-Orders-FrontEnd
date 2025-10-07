"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaSignOutAlt, FaChevronDown, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import * as Icons from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRole } from "@/utils/RoleContext";
import io from "socket.io-client";
import { api } from "@/utils/api";

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  transports: ["websocket"],
});

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { role, name } = useRole();
  const [menus, setMenus] = useState<any[]>([]);

  useEffect(() => {
    const fetchMenus = async (roleId: number) => {
      try {
        const response = await api.get(`/menus/role/${roleId}`);
        if (response.status !== 200) return;

        const menusFromApi = response.data.data || [];
        const enhancedMenus = menusFromApi.map((menu: any) => ({
          ...menu,
          hasDropdown: Array.isArray(menu.submenus) && menu.submenus.length > 0,
        }));

        const orderedMenus = enhancedMenus.sort((a: any, b: any) => {
          if (a.id === 3) return 1;
          if (b.id === 3) return -1;
          return 0;
        });

        setMenus(orderedMenus);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        document.cookie = `token=; path=/; max-age=0; Secure; SameSite=Strict`;
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
            transition-all duration-300 ${isExpanded ? "px-4 w-auto" : "w-12"}`}
        >
          {isExpanded ? name : initials}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* HEADER MOBILE */}
      <header className="lg:hidden fixed top-0 left-0 w-full bg-gray-900 text-white flex items-center justify-between flex-row-reverse px-4 py-3 shadow-md z-50">
        <div className="flex items-center gap-2">
          <Image src="/imgs/png/order.png" alt="Logo" width={40} height={40} />
          <span className="font-semibold">{name || "Painel"}</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white focus:outline-none"
        >
          {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </header>

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setOpenDropdown(null);
        }}
        className={`fixed top-0 left-0 h-screen bg-gray-800 text-white flex flex-col p-4 transition-all duration-300 
          ${isExpanded ? "w-64" : "w-20"} 
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static z-40`}
      >
        {/* Só exibe Avatar e Logo no Desktop */}
        <div className="hidden lg:block">
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
        </div>

        <nav className="flex flex-col gap-1 flex-grow mt-12 lg:mt-0.5 justify-center">
          {menus.map((menu) => {
            const Icon = (Icons as any)[menu.icon] || Icons.FaBox;

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
                            className="flex gap-1 p-2 rounded hover:bg-gray-700 transition text-sm cursor-pointer"
                            onClick={() => {
                              setOpenDropdown(null);
                              setIsMobileMenuOpen(false);
                            }}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
    </>
  );
}