import ProducTable from '@/components/ProductCard/ProductTable';
import { ProductList } from '@/types/products';
import { api } from '@/utils/api';

export default async function ProductsPage() {
    const res = await api.get('/products');
    const productsSSR: ProductList = res.data;

    return (
        <div className="flex">
            <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                <h2 className="text-2xl font-bold mb-4">Produtos</h2>
                <ProducTable products={productsSSR} />
            </main>
        </div>
    );
}
