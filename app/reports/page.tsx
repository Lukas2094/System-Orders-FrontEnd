"use client";

import { useEffect, useState } from "react";
import DynamicMetadata from "@/components/SEO/Metadata";
import { api } from "@/utils/api";
import * as XLSX from "xlsx";
import { Category } from "@/types/products";
import { formatDateBR } from "@/utils/functions/masks";
import { FaFileCsv, FaFileExcel, FaFilter, FaDownload } from "react-icons/fa";

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
  const [filtersOpen, setFiltersOpen] = useState(false);

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

      <div className="min-h-screen bg-gray-100 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">📊 Relatórios</h2>
            <p className="text-gray-600 mt-2">Gere relatórios de pedidos, produtos e usuários</p>
          </div>

          {/* Form de filtros principais */}
          <div className="bg-white rounded-2xl shadow-md p-4 lg:p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filtros Principais</h3>

              {/* Mobile Filters Toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full justify-center"
              >
                <FaFilter /> {filtersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>

            <form
              onSubmit={e => { e.preventDefault(); fetchReports(); }}
              className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-4 items-end"
            >
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    const newTipo = e.target.value;
                    setTipo(newTipo);
                    setSelectedCategory("");
                    setSelectedSubcategory("");
                    setReports([]);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pedidos">📦 Pedidos</option>
                  <option value="produtos">🛍️ Produtos</option>
                  <option value="usuarios">👥 Usuários</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <FaFilter size={14} />
                      Gerar Relatório
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Filtros extras */}
            <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block mt-6 pt-6 border-t border-gray-200`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tipo === "pedidos" && (
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <input
                      type="text"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      placeholder="Ex: entregue, pendente"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {tipo === "produtos" && (
                  <>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Todas Categorias</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategoria</label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Função (Role ID)</label>
                    <input
                      type="number"
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resultados */}
          {filteredReports.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum dado encontrado</h3>
              <p className="text-gray-500">Ajuste os filtros e gere um relatório para visualizar os dados.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Header da Tabela */}
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Resultados</h3>
                    <p className="text-sm text-gray-600">
                      {filteredReports.length} registro{filteredReports.length !== 1 ? 's' : ''} encontrado{filteredReports.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={exportCSV}
                      disabled={filteredReports.length === 0}
                      className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
                    >
                      <FaFileCsv size={14} />
                      <span className="hidden xs:inline">CSV</span>
                    </button>
                    <button
                      onClick={exportExcel}
                      disabled={filteredReports.length === 0}
                      className="flex-1 sm:flex-none flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors text-sm"
                    >
                      <FaFileExcel size={14} />
                      <span className="hidden xs:inline">Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabela */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-bold">
                    <tr>
                      {tipo === "produtos" && (
                        <>
                          <th className="px-4 py-3 whitespace-nowrap">ID</th>
                          <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                          <th className="px-4 py-3 whitespace-nowrap">Preço</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Estoque</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Atualizado em</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Categoria</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">Subcategoria</th>
                        </>
                      )}
                      {tipo === "pedidos" && (
                        <>
                          <th className="px-4 py-3 whitespace-nowrap">ID</th>
                          <th className="px-4 py-3 whitespace-nowrap">Cliente</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Telefone</th>
                          <th className="px-4 py-3 whitespace-nowrap">Status</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Criado em</th>
                        </>
                      )}
                      {tipo === "usuarios" && (
                        <>
                          <th className="px-4 py-3 whitespace-nowrap">ID</th>
                          <th className="px-4 py-3 whitespace-nowrap">Nome</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">Email</th>
                          <th className="px-4 py-3 whitespace-nowrap">Função</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden md:table-cell">Telefone</th>
                          <th className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">Criado em</th>
                        </>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        {tipo === "produtos" && (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-800">{row.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">{row.name}</span>
                                <span className="text-xs text-gray-500 sm:hidden">
                                  Estoque: {row.stock} | R$ {row.price}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">R$ {row.price}</td>
                            <td className="px-4 py-3 hidden sm:table-cell">{row.stock}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{formatDateBR(row.updated_at)}</td>
                            <td className="px-4 py-3 hidden md:table-cell">{row.category_name}</td>
                            <td className="px-4 py-3 hidden xl:table-cell">{row.subcategory_name}</td>
                          </>
                        )}
                        {tipo === "pedidos" && (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-800">{row.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">{row.customerName}</span>
                                <span className="text-xs text-gray-500 sm:hidden">
                                  {row.customerPhone}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">{row.customerPhone}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'entregue' ? 'bg-green-100 text-green-800' :
                                  row.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">{formatDateBR(row.createdAt)}</td>
                          </>
                        )}
                        {tipo === "usuarios" && (
                          <>
                            <td className="px-4 py-3 font-medium text-gray-800">{row.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col">
                                <span className="font-medium">{row.name}</span>
                                <span className="text-xs text-gray-500 sm:hidden">
                                  {row.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">{row.email}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                {row.role_id}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">{row.phone}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">{formatDateBR(row.createdAt)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}