import { FaUsers, FaBox, FaShoppingCart, FaChartBar } from "react-icons/fa";
import React from "react";
import DynamicMetadata from "@/components/SEO/Metadata";

async function getDashboardData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const [ordersRes, productsRes, usersRes , appointmentsRes] = await Promise.all([
    fetch(`${baseUrl}/orders`, { cache: "no-store" }),
    fetch(`${baseUrl}/products`, { cache: "no-store" }),
    fetch(`${baseUrl}/users`, { cache: "no-store" }),
    fetch(`${baseUrl}/appointments`, { cache: "no-store" }),
  ]);

  const [orders, products, users , appointments] = await Promise.all([
    ordersRes.json(),
    productsRes.json(),
    usersRes.json(),
    appointmentsRes.json(),
  ]);

  return {
    orders: orders.length || 0,
    products: products.length || 0,
    users: users.length || 0,
    appointments: appointments.length || 0, 
  };
}

export default async function HomePage() {
  const { orders, products, users, appointments } = await getDashboardData();

  return (
    <>
      <DynamicMetadata 
          title="Sistema de Pedidos"
          description="Sistema de gerenciamento de Pedidos"
          keywords={['sistema', 'gerenciamento']}
          ogImage="/og-image-default.png"
        />

      <div className="flex">
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">
          {/* Cabeçalho */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Bem-vindo ao Dashboard
            </h2>
            <p className="text-gray-600">Selecione uma opção no menu para começar.</p>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition">
              <FaShoppingCart className="text-blue-600 text-3xl" />
              <div>
                <p className="text-gray-500">Pedidos</p>
                <h3 className="text-xl font-bold">{orders}</h3>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition">
              <FaBox className="text-green-600 text-3xl" />
              <div>
                <p className="text-gray-500">Produtos</p>
                <h3 className="text-xl font-bold">{products}</h3>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition">
              <FaUsers className="text-purple-600 text-3xl" />
              <div>
                <p className="text-gray-500">Usuários</p>
                <h3 className="text-xl font-bold">{users}</h3>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg transition">
              <FaChartBar className="text-orange-600 text-3xl" />
              <div>
                <p className="text-gray-500">Agendamentos</p>
                <h3 className="text-xl font-bold">{appointments}</h3>
              </div>
            </div>
          </div>

          {/* Área de relatórios rápidos */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
            <p className="text-gray-600">
              Aqui você pode acompanhar rapidamente os principais indicadores do sistema.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                <h4 className="font-medium text-gray-700">Pedidos Recentes</h4>
                <ul className="text-gray-600 text-sm mt-2 list-disc pl-5">
                  <li>Pedido #1023 - Aprovado</li>
                  <li>Pedido #1022 - Pendente</li>
                  <li>Pedido #1021 - Cancelado</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                <h4 className="font-medium text-gray-700">Produtos em Destaque</h4>
                <ul className="text-gray-600 text-sm mt-2 list-disc pl-5">
                  <li>Notebook Dell</li>
                  <li>Smartphone Samsung</li>
                  <li>Headset Logitech</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>  
    </>
  
  );
}