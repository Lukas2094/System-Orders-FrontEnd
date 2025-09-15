import OrdersClient from '@/components/OrderCard/OrdersClient';
import DynamicMetadata from '@/components/SEO/Metadata';
import { Order } from '@/types';
import { api } from '@/utils/api';

export default async function OrdersPage() {

  const res = await api.get<Order[]>('/orders');
  const ordersSSR = res.data;


  return (
    <>
         <DynamicMetadata 
                title="Gerenciamento de Pedidos"
                description={`Sistema de Gerenciamento de Pedidos com ${ordersSSR.length} pedidos cadastrados`}
                keywords={["pedidos", "gerenciamento"]}
                ogImage="/pedidos-og-image.png"
            />

          <div className="flex">
            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
              <h2 className="text-2xl font-bold mb-4">Pedidos</h2>
              <OrdersClient initialOrders={ordersSSR} />
            </main>
          </div>
    </>
   
  );
}
