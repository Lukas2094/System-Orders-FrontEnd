'use client';

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { IoMdCloseCircle } from "react-icons/io";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => void;
    initialData?: any;
}

interface Category {
    id: number;
    name: string;
    subcategories?: { id: number; name: string }[];
}

export default function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
    const [form, setForm] = useState({
        isbn: "",
        name: "",
        price: "",
        categoryId: "",
        subcategoryId: "",
        stock: 0,
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/categories");
                setCategories(res.data);
            } catch (err) {
                console.error("Erro ao buscar categorias:", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (initialData) {
            setForm({
                isbn: initialData.isbn ?? "",
                name: initialData.name ?? "",
                price: initialData.price ?? "",
                categoryId: initialData.categoryId ?? "",
                subcategoryId: initialData.subcategoryId ?? "",
                stock: initialData.stock ?? 0,
            });
            if (initialData.categoryId) {
                const selected = categories.find(c => c.id === Number(initialData.categoryId));
                setSubcategories(selected?.subcategories || []);
            }
        } else {
            setForm({
                isbn: "",
                name: "",
                price: "",
                categoryId: "",
                subcategoryId: "",
                stock: 0,
            });
        }
    }, [initialData, categories]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (name === "categoryId") {
            const selected = categories.find(c => c.id === Number(value));
            setSubcategories(selected?.subcategories || []);
            setForm(prev => ({ ...prev, subcategoryId: "" }));
        }
    };

    const handleSubmit = () => onSave(form);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
            <div className="bg-white w-full max-w-md lg:max-w-2xl rounded-2xl shadow-2xl p-4 lg:p-6 space-y-4 lg:space-y-5 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                        {initialData ? "Editar Produto" : "Novo Produto"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <IoMdCloseCircle size={24} />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4 lg:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                        {/* ISBN */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">ISBN</label>
                            <input
                                name="isbn"
                                value={form.isbn ?? ""}
                                onChange={handleChange}
                                placeholder="Digite ou scanneie o ISBN"
                                className="p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                            />
                        </div>

                        {/* Nome */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Nome</label>
                            <input
                                name="name"
                                value={form.name ?? ""}
                                onChange={handleChange}
                                placeholder="Digite o nome do produto"
                                className="p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                            />
                        </div>

                        {/* Preço */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Preço</label>
                            <input
                                name="price"
                                value={form.price ?? ""}
                                onChange={handleChange}
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                className="p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                            />
                        </div>

                        {/* Estoque */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Estoque</label>
                            <input
                                name="stock"
                                value={form.stock ?? 0}
                                onChange={handleChange}
                                type="number"
                                className="p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                            />
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select
                            name="categoryId"
                            value={form.categoryId ?? ""}
                            onChange={handleChange}
                            className="p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base"
                        >
                            <option value="">Selecione a Categoria</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Subcategoria */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                        <select
                            name="subcategoryId"
                            value={form.subcategoryId ?? ""}
                            onChange={handleChange}
                            disabled={!subcategories.length}
                            className={`p-2 lg:p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm lg:text-base ${!subcategories.length ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                        >
                            <option value="">Selecione a Subcategoria</option>
                            {subcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 lg:gap-3 pt-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 lg:px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition cursor-pointer text-sm lg:text-base order-2 sm:order-1 w-full sm:w-auto"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 lg:px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-sm lg:text-base order-1 sm:order-2 w-full sm:w-auto"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}