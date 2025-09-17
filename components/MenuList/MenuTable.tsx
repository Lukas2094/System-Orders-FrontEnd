'use client';

import React, { useEffect, useState } from 'react';
import { FaBars, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { Menu } from '@/types/menus';
import MenuModal from './MenuModal';
import { api } from '@/utils/api';
import { io } from "socket.io-client"; // ✅
import { useToast } from '../Toast/Toast';

type MenuTableProps = {
    menusList: Menu[];
    rolesList: Role[];
}

type Role = {
    id: number;
    name: string;
};

export default function MenuTable({ menusList, rolesList }: MenuTableProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [menus, setMenus] = useState<Menu[]>(menusList);
    const { showToast, showConfirm } = useToast();

    useEffect(() => {
        const socket = io(api.defaults.baseURL!, {
            transports: ["websocket"],
        });

        socket.on("menuCreated", (menu: Menu) => {
            setMenus(prev => [...prev, menu]);
        });

        socket.on("menuUpdated", (menu: Menu) => {
            setMenus(prev => prev.map(m => (m.id === menu.id ? menu : m)));
        });

        socket.on("menuDeleted", (id: number) => {
            setMenus(prev => prev.filter(m => m.id !== id));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleDelete = async (id: number) => {
        const ok = await showConfirm('Tem certeza que deseja excluir este menu?');
        if (!ok) return;

        try {
            const res = await api.delete(`/menus/${id}`);
            if (res.status === 200) {
                showToast('Menu excluído com sucesso!', 'success');
            } else {
                showToast('Erro ao excluir menu.', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Erro de conexão com o servidor.', 'error');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 inline-flex items-center">
                    <FaBars className='mr-3' color='red' /> Lista de Menus
                </h2>
                <button
                    onClick={() => {
                        setSelectedMenu(null);
                        setModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                >
                    <FaPlus /> Novo Menu
                </button>
            </div>

            {/* Tabela */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">Path</th>
                            <th className="px-4 py-3">Icon</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {menus.map(menu => (
                            <tr key={menu.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{menu.name}</td>
                                <td className="px-4 py-3">{menu.path}</td>
                                <td className="px-4 py-3">{menu.icon}</td>
                                <td className="px-4 py-3 flex justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedMenu(menu);
                                            setModalOpen(true);
                                        }}
                                        className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                                    >
                                        <FaEdit size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(menu.id)}
                                        title="Excluir"
                                        className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <MenuModal
                rolesList={rolesList}
                isOpen={modalOpen}
                menu={selectedMenu}
                onClose={() => setModalOpen(false)}
                onSave={async (data) => {
                    console.log("Dados enviados:", data);
                    try {
                        if (data.id) {
                            await api.put(`/menus/${data.id}`, data);
                            showToast('Menu atualizado com sucesso!', 'success');
                        } else {
                            await api.post(`/menus`, data);
                            showToast('Menu criado com sucesso!', 'success');
                        }
                    } catch (err) {
                        console.error(err);
                        showToast('Erro ao salvar menu.', err instanceof Error ? 'error' : 'warning');
                    }
                }}
            />
        </div>
    );
}
