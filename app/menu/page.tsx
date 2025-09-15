import MenuTable from "@/components/MenuList/MenuTable";
import { Menu } from "@/types/menus";
import { api } from "@/utils/api";
import React from "react";

export default async function MenuPage() { 

    const res = await api.get('/menus');
    const menusSSR: Menu[] = res.data;

    const roles = await api.get('/roles');
    const rolesSSR = roles.data;

    return (
        <div className="flex">
            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Menu</h2>
                <MenuTable menusList={menusSSR} rolesList={rolesSSR} />
            </main>
        </div>
    );
}