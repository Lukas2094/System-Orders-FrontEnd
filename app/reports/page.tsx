"use client";

import { useEffect, useMemo, useState } from "react";
import DynamicMetadata from "@/components/SEO/Metadata";
import { api } from "@/utils/api";
import * as XLSX from "xlsx";
import { Category } from "@/types/products";

interface ReportData {
    id: number;
    [key: string]: any;
}

export default function ReportsPage() {
    const [tipo, setTipo] = useState("pedidos");
    const [dataInicio, setDataInicio] = useState("");
    const [dataFim, setDataFim] = useState("");
    const [status, setStatus] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");
    const [roleId, setRoleId] = useState("");
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loading, setLoading] = useState(false);


    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<{ id: number; name: string }[]>([]);



    const fetchReports = async () => {
        try {
            setLoading(true);

            // Monta params apenas se o campo tiver valor
            const params: Record<string, any> = { tipo };

            if (dataInicio) params.dataInicio = dataInicio;
            if (dataFim) params.dataFim = dataFim;
            if (status && tipo === "pedidos") params.status = status;
            if (categoryId && tipo === "produtos") params.category_id = categoryId;
            if (subcategoryId && tipo === "produtos") params.subcategory_id = subcategoryId;
            if (roleId && tipo === "usuarios") params.role_id = roleId;

            const res = await api.get("/reports", { params });
            setReports(res.data);
        } catch (error) {
            console.error("Erro ao carregar relatórios:", error);
        } finally {
            setLoading(false);
        }
    };


    // Export CSV
    const exportCSV = () => {
        if (reports.length === 0) return;

        const headers = Object.keys(reports[0]);
        const csvRows = [
            headers.join(","), // Cabeçalhos
            ...reports.map((row) =>
                headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
            ),
        ];
        const csvContent = csvRows.join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `relatorio-${tipo}.csv`;
        link.click();
    };

    // Export Excel
    const exportExcel = () => {
        if (reports.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(reports);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

        XLSX.writeFile(workbook, `relatorio-${tipo}.xlsx`);
    };

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

    const fetchSubcategories = async (categoryId: string) => {
        try {
            const res = await api.get(`/categories/${categoryId}/subcategories`);
            setSubcategories(res.data);
        } catch (err) {
            console.error("Erro ao buscar subcategorias:", err);
        }
    };

    const handleCategoryChange = (id: string) => {
        setCategoryId(id);
        setSubcategoryId("");
        if (id) fetchSubcategories(id);
    };



    return (
        <>
            <DynamicMetadata
                title="Relatórios do Sistema"
                description="Página de relatórios de pedidos, produtos e usuários"
                keywords={["relatórios", "pedidos", "produtos", "usuários"]}
                ogImage="/reports-og-image.png"
            />

            <div className="flex">
                <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold mb-6">Relatórios</h2>

                    {/* Form de filtros */}
                    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                fetchReports();
                            }}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
                        >
                            {/* Select tipo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Relatório
                                </label>
                                <select
                                    value={tipo}
                                    onChange={(e) => setTipo(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="pedidos">Pedidos</option>
                                    <option value="produtos">Produtos</option>
                                    <option value="usuarios">Usuários</option>
                                </select>
                            </div>

                            {/* Data início */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Início
                                </label>
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            {/* Data fim */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data Fim
                                </label>
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            {/* Botão gerar */}
                            <div>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full cursor-pointer"
                                >
                                    {loading ? "Carregando..." : "Gerar"}
                                </button>
                            </div>
                        </form>

                        {/* Campos extras */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            {tipo === "pedidos" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <input
                                        type="text"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        placeholder="Ex: entregue, pendente"
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                            )}

                            {tipo === "produtos" && (
                                <>
                                    {/* Categoria */}
                                    <div className="flex flex-col">
                                        <label className="text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                        <select
                                            value={categoryId}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="p-3 rounded-lg border"
                                        >
                                            <option value="">Todas Categorias</option>
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
                                            value={subcategoryId}
                                            onChange={(e) => setSubcategoryId(e.target.value)}
                                            className="p-3 rounded-lg border"
                                            disabled={!subcategories.length}
                                        >
                                            <option value="">Todas Subcategorias</option>
                                            {subcategories.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {tipo === "usuarios" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Função (Role ID)
                                    </label>
                                    <input
                                        type="number"
                                        value={roleId}
                                        onChange={(e) => setRoleId(e.target.value)}
                                        className="w-full border rounded-lg p-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resultados */}
                    {reports.length === 0 && !loading ? (
                        <p className="text-gray-600">Nenhum dado encontrado.</p>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={exportCSV}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer"
                                >
                                    Exportar CSV
                                </button>
                                <button
                                    onClick={exportExcel}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer"
                                >
                                    Exportar Excel
                                </button>
                            </div>

                            <table className="min-w-full table-auto border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-left">
                                        {reports.length > 0 &&
                                            Object.keys(reports[0]).map((col, i) => (
                                                <th key={i} className="px-4 py-2 border-b">
                                                    {col}
                                                </th>
                                            ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-4 py-2 border-b">
                                                    {String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}