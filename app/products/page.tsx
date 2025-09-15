import ProducTable from '@/components/ProductCard/ProductTable';
import DynamicMetadata from '@/components/SEO/Metadata';
import { ProductList } from '@/types/products';
import { api } from '@/utils/api';

export default async function ProductsPage() {
    const res = await api.get('/products');
    const productsSSR: ProductList = res.data;

    return (
        <>
            <DynamicMetadata 
                title="Gerenciamento de Produtos"
                description={`Sistema de Gerenciamento de produtos com ${productsSSR.length} produtos cadastrados`}
                keywords={["produtos", "gerenciamento", "dashboard"]}
                ogImage="/produtos-og-image.png"
            />
            
            <div className="flex">
                <main className="flex-1 p-6 bg-gray-100 min-h-screen">
                    <h2 className="text-2xl font-bold mb-4">Produtos</h2>
                    <ProducTable products={productsSSR} />
                </main>
            </div>
        </>
      
    );
}
