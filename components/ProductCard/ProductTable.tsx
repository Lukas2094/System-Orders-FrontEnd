'use client';

import React, { useState, useMemo } from 'react';
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import ProductModal from './ProductModal';
import { useRouter } from 'next/navigation';
import { ProductList } from '@/types/products';

interface ProductTableProps {
  products: ProductList;
  pageSize?: number;
}

export default function ProductTable({ products, pageSize = 5 }: ProductTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔎 Filtros
  const [search, setSearch] = useState("");
  const [searchIsbn, setSearchIsbn] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  // Opções únicas de categorias e subcategorias
  const categories = useMemo(() => {
    const unique = new Map();
    products.forEach(p => {
      if (p.category) unique.set(p.category.id, p.category.name);
    });
    return Array.from(unique.entries());
  }, [products]);

  const subcategories = useMemo(() => {
    const unique = new Map();
    products.forEach(p => {
      if (p.subcategory) unique.set(p.subcategory.id, p.subcategory.name);
    });
    return Array.from(unique.entries());
  }, [products]);

  // 🧮 Filtragem dos produtos
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchIsbn =
        searchIsbn === "" || (p.isbn && p.isbn.toLowerCase().includes(searchIsbn.toLowerCase()));

      const matchName =
        search === "" || p.name.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === "" || p.category?.id.toString() === selectedCategory;

      const matchSubcategory =
        selectedSubcategory === "" || p.subcategory?.id.toString() === selectedSubcategory;

      return matchName && matchCategory && matchSubcategory && matchIsbn;
    });
  }, [products, search, selectedCategory, selectedSubcategory, searchIsbn]);


  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSave = async (product: any) => {
    if (editingProduct) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    } else {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
    }

    setModalOpen(false);
    setEditingProduct(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: "DELETE",
      });
      router.refresh();
    }
  };

  const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">📦 Lista de Produtos</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <FaPlus /> Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por ISBN..."
          value={searchIsbn}
          onChange={(e) => setSearchIsbn(e.target.value)}
          className="px-3 py-2 border rounded-md w-60"
        />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md w-60"
        />
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory(""); }}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Todas Categorias</option>
          {categories.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          className="px-3 py-2 border rounded-md"
          disabled={!selectedCategory}
        >
          <option value="">Todas Subcategorias</option>
          {subcategories
            .filter(([id]) => {
              // só mostra subcategorias da categoria escolhida
              const prod = products.find(p => p.subcategory?.id === id);
              return prod?.category?.id.toString() === selectedCategory;
            })
            .map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
        </select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Subcategoria</th>
              <th className="px-4 py-3">Quantidade</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{product.isbn || "-"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
                  <td className="px-4 py-3">R$ {Number(product.price).toFixed(2)}</td>
                  <td className="px-4 py-3">{product?.category?.name || "-"}</td>
                  <td className="px-4 py-3">{product?.subcategory?.name || "-"}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                      title="Editar"
                      className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Excluir"
                      className="flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Nenhum produto encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer text-white"
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-blue-500 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer text-white"
          >
            Próxima
          </button>
        </div>
      )}

      {/* Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProduct(null); }}
        onSave={handleSave}
        initialData={editingProduct}
      />
    </div>
  );
}