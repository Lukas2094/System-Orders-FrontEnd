'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as GiIcons from 'react-icons/gi';
import * as IoIcons from 'react-icons/io5';

import { Menu } from '@/types/menus';

type Role = {
    id: number;
    name: string;
};

type MenuModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Menu>) => void;
    menu?: Menu | null;
    rolesList: Role[];
};

// Mesclando todas as famílias de ícones
const AllIcons = {
    ...FaIcons,
    ...AiIcons,
    ...MdIcons,
    ...BiIcons,
    ...GiIcons,
    ...IoIcons,
};

export default function MenuModal({ isOpen, onClose, onSave, menu, rolesList }: MenuModalProps) {
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [icon, setIcon] = useState('');
    const [iconSearch, setIconSearch] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    const isEdit = !!menu;

    useEffect(() => {
        if (menu) {
            setName(menu.name);
            setPath(menu.path);
            setIcon(menu.icon);
            setSelectedRoles(menu.roleIds || []);
            setIconSearch(menu.icon);
        } else {
            setName('');
            setPath('');
            setIcon('');
            setSelectedRoles([]);
            setIconSearch('');
        }
    }, [menu, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: menu?.id, name, path, icon, roleIds: selectedRoles });
        onClose();
    };

    // Filtra todos os ícones
    const filteredIcons = Object.keys(AllIcons).filter((key) =>
        key.toLowerCase().includes(iconSearch.toLowerCase())
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-semibold">
                        {isEdit ? 'Editar Menu' : 'Novo Menu'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Path</label>
                        <input
                            type="text"
                            value={path}
                            onChange={e => setPath(e.target.value)}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Icon</label>
                        <input
                            type="text"
                            placeholder="Buscar ícone..."
                            value={iconSearch}
                            onChange={e => {
                                const val = e.target.value.replace(/\s+/g, '');
                                setIconSearch(val);
                                setIcon(val);
                            }}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                            required
                        />
                        {/* Lista de ícones filtrados */}
                        <div className="grid grid-cols-6 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                            {filteredIcons.slice(0, 50).map((iconName) => {
                                const IconComp = (AllIcons as any)[iconName];
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => {
                                            setIcon(iconName);
                                            setIconSearch(iconName);
                                        }}
                                        className={`flex flex-col items-center justify-center p-1 border rounded hover:bg-gray-100 ${icon === iconName ? 'bg-blue-100 border-blue-400' : ''
                                            }`}
                                    >
                                        <IconComp size={20} />
                                        <span className="text-xs">{iconName}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roles</label>
                        <select
                            multiple
                            value={selectedRoles.map(String)}
                            onChange={e => {
                                const options = Array.from(e.target.selectedOptions);
                                setSelectedRoles(options.map(o => Number(o.value)));
                            }}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                        >
                            {rolesList.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {isEdit ? 'Salvar' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};