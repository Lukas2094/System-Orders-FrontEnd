"use client";

import { useEffect, useState } from "react";
import DynamicMetadata from "@/components/SEO/Metadata";
import { api } from "@/utils/api";
import * as XLSX from "xlsx";
import { Category } from "@/types/products";
import { formatDateBR } from "@/utils/functions/masks";

interface ReportData {
  id: number;
  name: string;
  price: string | number;
  stock: number;
  updated_at: string;
  category_id?: number;
  category_name?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  [key: string]: any;
}

interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

export default function ReportsPage() {
  const [tipo, setTipo] = useState("pedidos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [status, setStatus] = useState("");
  const [roleId, setRoleId] = useState("");
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔎 Filtros tipo produtos
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Listas de categorias e subcategorias
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  // 🔹 Fetch relatórios
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { tipo };
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;
      if (status && tipo === "pedidos") params.status = status;
      if (selectedCategory && tipo === "produtos") params.category_id = selectedCategory;
      if (selectedSubcategory && tipo === "produtos") params.subcategory_id = selectedSubcategory;
      if (roleId && tipo === "usuarios") params.role_id = roleId;

      const res = await api.get("/reports", { params });
      setReports(res.data);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch categorias
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

  // 🔹 Fetch subcategorias ao mudar categoria usando /categories/:id
  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("");
    if (!categoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const res = await api.get(`/categories/${categoryId}`);
      setSubcategories(res.data.subcategories || []);
    } catch (err) {
      console.error("Erro ao buscar subcategorias:", err);
      setSubcategories([]);
    }
  };

  // 🔹 Export CSV
  const exportCSV = () => {
    if (reports.length === 0) return;
    const headers = ["id", "name", "price", "stock", "updated_at", "category_name", "subcategory_name"];
    const csvRows = [
      headers.join(","),
      ...reports.map(row =>
        headers.map(h => JSON.stringify(row[h] ?? "")).join(",")
      )
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${tipo}.csv`;
    link.click();
  };

  // 🔹 Export Excel
  const exportExcel = () => {
    if (reports.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(
      reports.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        stock: r.stock,
        updated_at: r.updated_at,
        category_name: r.category_name,
        subcategory_name: r.subcategory_name
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");
    XLSX.writeFile(workbook, `relatorio-${tipo}.xlsx`);
  };

  // 🔹 Filtragem cliente-side
  const filteredReports = reports.filter(r => {
    const matchStatus = tipo === "pedidos"
      ? (status === "" || (r.status?.toLowerCase() ?? "").includes(status.toLowerCase()))
      : true;

    const matchCategory = tipo === "produtos"
      ? (selectedCategory === "" || r.category_id?.toString() === selectedCategory)
      : true;

    const matchSubcategory = tipo === "produtos"
      ? (selectedSubcategory === "" || r.subcategory_id?.toString() === selectedSubcategory)
      : true;

    const matchRole = tipo === "usuarios"
      ? (roleId === "" || r.role_id?.toString() === roleId)
      : true;

    return matchStatus && matchCategory && matchSubcategory && matchRole;
  });

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
              onSubmit={e => { e.preventDefault(); fetchReports(); }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
                <select
                    value={tipo}
                    onChange={(e) => {
                        const newTipo = e.target.value;
                        setTipo(newTipo);
                        setSelectedCategory("");
                        setSelectedSubcategory("");
                        setReports([]);
                    }}
                    className="w-full border rounded-lg p-2"
                    >
                    <option value="pedidos">Pedidos</option>
                    <option value="produtos">Produtos</option>
                    <option value="usuarios">Usuários</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full border rounded-lg p-2" />
              </div>

              <div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full cursor-pointer">
                  {loading ? "Carregando..." : "Gerar"}
                </button>
              </div>
            </form>

            {/* Filtros extras */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              {tipo === "pedidos" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="">Todas Categorias</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                    <select
                      value={selectedSubcategory}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="w-full border rounded-lg p-2"
                      disabled={!selectedCategory || subcategories.length === 0}
                    >
                      <option value="">Todas Subcategorias</option>
                      {subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {tipo === "usuarios" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Função (Role ID)</label>
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
            {filteredReports.length === 0 && !loading ? (
            <p className="text-gray-600">Nenhum dado encontrado.</p>
            ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
                <div className="flex gap-2 mb-4">
                <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">Exportar CSV</button>
                <button onClick={exportExcel} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer">Exportar Excel</button>
                </div>

                <table className="min-w-full table-auto border-collapse">
                <thead>
                    <tr className="bg-gray-200 text-left">
                    {tipo === "produtos" && (
                        <>
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Nome</th>
                        <th className="px-4 py-2 border-b">Preço</th>
                        <th className="px-4 py-2 border-b">Estoque</th>
                        <th className="px-4 py-2 border-b">Atualizado em</th>
                        <th className="px-4 py-2 border-b">Categoria</th>
                        <th className="px-4 py-2 border-b">Subcategoria</th>
                        </>
                    )}
                    {tipo === "pedidos" && (
                        <>
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Cliente</th>
                        <th className="px-4 py-2 border-b">Telefone</th>
                        <th className="px-4 py-2 border-b">Status</th>
                        <th className="px-4 py-2 border-b">Criado em</th>
                        </>
                    )}
                    {tipo === "usuarios" && (
                        <>
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Nome</th>
                        <th className="px-4 py-2 border-b">Email</th>
                        <th className="px-4 py-2 border-b">Função</th>
                        <th className="px-4 py-2 border-b">Telefone</th>
                        <th className="px-4 py-2 border-b">Criado em</th>
                        </>
                    )}
                    </tr>
                </thead>

                <tbody>
                    {filteredReports.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        {tipo === "produtos" && (
                        <>
                            <td className="px-4 py-2 border-b">{row.id}</td>
                            <td className="px-4 py-2 border-b">{row.name}</td>
                            <td className="px-4 py-2 border-b">{row.price}</td>
                            <td className="px-4 py-2 border-b">{row.stock}</td>
                            <td className="px-4 py-2 border-b">{formatDateBR(row.updated_at)}</td>
                            <td className="px-4 py-2 border-b">{row.category_name}</td>
                            <td className="px-4 py-2 border-b">{row.subcategory_name}</td>
                        </>
                        )}
                        {tipo === "pedidos" && (
                        <>
                            <td className="px-4 py-2 border-b">{row.id}</td>
                            <td className="px-4 py-2 border-b">{row.customerName}</td>
                            <td className="px-4 py-2 border-b">{row.customerPhone}</td>
                            <td className="px-4 py-2 border-b">{row.status}</td>
                            <td className="px-4 py-2 border-b">{formatDateBR(row.createdAt)}</td>
                        </>
                        )}
                        {tipo === "usuarios" && (
                        <>
                            <td className="px-4 py-2 border-b">{row.id}</td>
                            <td className="px-4 py-2 border-b">{row.name}</td>
                            <td className="px-4 py-2 border-b">{row.email}</td>
                            <td className="px-4 py-2 border-b">{row.role_id}</td>
                            <td className="px-4 py-2 border-b">{row.phone}</td>
                            <td className="px-4 py-2 border-b">{formatDateBR(row.createdAt)}</td>
                        </>
                        )}
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