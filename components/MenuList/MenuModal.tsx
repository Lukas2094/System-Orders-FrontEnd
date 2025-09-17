'use client';

import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as MdIcons from 'react-icons/md';
import * as BiIcons from 'react-icons/bi';
import * as GiIcons from 'react-icons/gi';
import * as IoIcons from 'react-icons/io5';
import * as RiIcons from 'react-icons/ri';
import * as SiIcons from 'react-icons/si';

import { Menu } from '@/types/menus';
import { useToast } from '../Toast/Toast';

type Role = { id: number; name: string; };
type SubmenuData = { id?: number; name: string; path: string; icon?: string };

type MenuModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Menu>) => void;
    menu?: Menu | null;
    rolesList: Role[];
};

// Ícones separados por família
const IconFamilies = {
    Fa: { name: 'Font Awesome', icons: FaIcons },
    Ai: { name: 'Ant Design', icons: AiIcons },
    Md: { name: 'Material Design', icons: MdIcons },
    Bi: { name: 'BoxIcons', icons: BiIcons },
    Gi: { name: 'Game Icons', icons: GiIcons },
    Io: { name: 'Ionicons', icons: IoIcons },
    Ri: { name: 'Remix Icon', icons: RiIcons },
    Si: { name: 'Simple Icons', icons: SiIcons },
};
const AllIcons = { ...FaIcons, ...AiIcons, ...MdIcons, ...BiIcons, ...GiIcons, ...IoIcons, ...RiIcons, ...SiIcons };

export default function MenuModal({ isOpen, onClose, onSave, menu, rolesList }: MenuModalProps) {
    const [name, setName] = useState('');
    const [path, setPath] = useState('');
    const [icon, setIcon] = useState('');
    const [iconSearch, setIconSearch] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [submenus, setSubmenus] = useState<SubmenuData[]>([]);
    const [showIconSuggestions, setShowIconSuggestions] = useState(false);
    const { showToast } = useToast();
    const isEdit = !!menu;

    useEffect(() => {
        if (menu) {
            setName(menu.name);
            setPath(menu.path);
            setIcon(menu.icon);
            setSelectedRoles(menu.roleIds || []);
            setIconSearch(menu.icon);
            setSubmenus(menu.submenus || []);
        } else {
            setName('');
            setPath('');
            setIcon('');
            setSelectedRoles([]);
            setIconSearch('');
            setSubmenus([]);
        }
    }, [menu, isOpen]);

    if (!isOpen) return null;

    const handleAddSubmenu = () => setSubmenus(prev => [...prev, { name: '', path: '' }]);
    const handleRemoveSubmenu = (index: number) => setSubmenus(prev => prev.filter((_, i) => i !== index));
    const handleSubmenuChange = (index: number, field: 'name' | 'path' | 'icon', value: string) =>
        setSubmenus(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !path.trim() || !icon.trim()) {
            showToast("Preencha todos os campos obrigatórios (Nome, Path e Icon).");
            return;
        }
        if (selectedRoles.length === 0) {
            showToast("Selecione pelo menos uma Role.");
            return;
        }
        onSave({ id: menu?.id, name, path, icon, roleIds: selectedRoles, submenus });
        onClose();
    };

    // Filtro de ícones
    const filteredIcons = Object.keys(AllIcons).filter((key) => {
        const searchTerm = iconSearch.toLowerCase().trim();
        if (!searchTerm) return false;
        if (key.toLowerCase().includes(searchTerm)) return true;
        const [prefix, ...rest] = searchTerm.split(' ');
        const iconName = rest.join('');
        if (Object.keys(IconFamilies).includes(prefix.toUpperCase())) {
            return key.toLowerCase().includes(iconName.toLowerCase()) && key.startsWith(prefix.toUpperCase());
        }
        return false;
    });

    const getSearchSuggestions = () => {
        if (iconSearch.length < 1) return [];
        const searchTerm = iconSearch.toLowerCase().trim();
        const suggestions: string[] = [];
        for (const [prefix, family] of Object.entries(IconFamilies)) {
            if (prefix.toLowerCase().includes(searchTerm) || family.name.toLowerCase().includes(searchTerm)) {
                suggestions.push(`${prefix} [${family.name}]`);
            }
        }
        Object.keys(AllIcons).forEach(iconName => {
            if (iconName.toLowerCase().includes(searchTerm)) suggestions.push(iconName);
        });
        return suggestions.slice(0, 10);
    };

    const searchSuggestions = getSearchSuggestions();
    const handleSuggestionClick = (suggestion: string) => {
        if (suggestion.includes('[')) {
            const familyPrefix = suggestion.split(' ')[0];
            setIconSearch(familyPrefix + ' ');
            setShowIconSuggestions(false);
        } else {
            setIcon(suggestion);
            setIconSearch(suggestion);
            setShowIconSuggestions(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-lg font-semibold ">{isEdit ? 'Editar Menu' : 'Novo Menu'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nome */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300" required />
                    </div>

                    {/* Path */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Path</label>
                        <input type="text" value={path} onChange={e => setPath(e.target.value)}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300" required />
                    </div>

                    {/* Icon */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700">Icon</label>
                        <input type="text"
                            placeholder="Ex: FaHome, AiOutlineUser"
                            value={iconSearch}
                            onChange={e => {
                                const val = e.target.value;
                                setIconSearch(val);
                                setShowIconSuggestions(val.length > 1);
                                if (Object.keys(AllIcons).includes(val)) setIcon(val);
                            }}
                            onFocus={() => setShowIconSuggestions(iconSearch.length > 1)}
                            onBlur={() => setTimeout(() => setShowIconSuggestions(false), 200)}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300"
                            required
                        />
                        {showIconSuggestions && searchSuggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                {searchSuggestions.map((suggestion, index) => (
                                    <button key={index} type="button" onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}


                        {/* Legenda das famílias */}
                        <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Famílias disponíveis: </span>
                            {Object.entries(IconFamilies).map(([prefix, family], index) => (
                                <span key={prefix}>
                                    {index > 0 && ', '}
                                    <span className="font-mono">{prefix}</span> ({family.name})
                                </span>
                            ))}
                        </div>

                        {/* Lista de ícones filtrados */}
                        {iconSearch.length > 0 && (
                            <div className="mt-3 border rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                        {filteredIcons.length} ícones encontrados
                                    </span>
                                    {filteredIcons.length > 50 && (
                                        <span className="text-xs text-gray-500">
                                            Mostrando os 50 primeiros
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                                    {filteredIcons.slice(0, 50).map((iconName) => {
                                        const IconComp = (AllIcons as any)[iconName];
                                        return (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => {
                                                    setIcon(iconName);
                                                    setIconSearch(iconName);
                                                    setShowIconSuggestions(false);
                                                }}
                                                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${icon === iconName
                                                        ? 'bg-blue-100 border-2 border-blue-400 shadow-inner'
                                                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                                                    }`}
                                                title={iconName}
                                            >
                                                <IconComp size={18} className={
                                                    icon === iconName ? "text-blue-600" : "text-gray-700"
                                                } />
                                                <span className="mt-1 text-[0.6rem] font-medium text-gray-600 truncate w-full text-center">
                                                    {iconName}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {filteredIcons.length === 0 && (
                                    <div className="text-center py-3 text-gray-500 text-sm">
                                        Nenhum ícone encontrado. Tente digitar o prefixo da família (Fa, Ai, Md, etc.)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Roles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Roles</label>
                        <select multiple value={selectedRoles.map(String)}
                            onChange={e => setSelectedRoles(Array.from(e.target.selectedOptions).map(o => Number(o.value)))}
                            className="mt-1 block w-full border rounded-lg p-2 focus:ring focus:ring-blue-300">
                            {rolesList.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </div>

                    {/* Submenus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Submenus</label>
                        {submenus.map((s, i) => (
                            <div key={i} className="flex flex-col gap-1 mt-2 border p-2 rounded">
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Nome" value={s.name}
                                        onChange={e => handleSubmenuChange(i, 'name', e.target.value)}
                                        className="border rounded p-2 flex-1" />
                                    <input type="text" placeholder="Path" value={s.path}
                                        onChange={e => handleSubmenuChange(i, 'path', e.target.value)}
                                        className="border rounded p-2 flex-1" />
                                    <button type="button" onClick={() => handleRemoveSubmenu(i)}
                                        className="bg-red-500 text-white px-2 rounded">X</button>
                                </div>

                                <div className="mt-1">
                                    <input type="text" placeholder="Ícone do submenu" value={s.icon || ''}
                                        onChange={e => handleSubmenuChange(i, 'icon', e.target.value)}
                                        className="border rounded p-2 w-full"
                                    />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddSubmenu} className="mt-2 px-3 py-1 bg-blue-500 text-white rounded cursor-pointer">+ Adicionar Submenu</button>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">{isEdit ? 'Salvar' : 'Criar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
