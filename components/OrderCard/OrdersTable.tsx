import { Order } from '@/types';
import { api } from '@/utils/api';
import { FaClock, FaCheckCircle, FaTruck } from 'react-icons/fa';

type Props = {
    orders: Order[];
    onStatusUpdate: (updatedOrder: Order) => void;
};

export default function OrdersTable({ orders, onStatusUpdate }: Props) {
    const updateStatus = async (orderId: number, status: string) => {
        const res = await api.patch(`/orders/${orderId}/status`, { status });
        onStatusUpdate(res.data);
    };

    function formatPhone(phone: string) {
        const digits = phone.replace(/\D/g, '');


        if (digits.length === 11) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        } else if (digits.length === 10) {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }

        return phone; 
    };

    function statusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'pendente':
                return 'text-yellow-500 font-semibold';
            case 'pago':
                return 'text-green-500 font-semibold';
            case 'enviado':
                return 'text-blue-500 font-semibold';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <div className="overflow-x-auto bg-white rounded shadow p-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-2 text-left text-sm font-bold text-gray-700 font">Cliente</th>
                        <th className="px-4 py-2 text-left text-sm font-bold text-gray-700 font">Telefone</th>
                        <th className="px-4 py-2 text-left text-sm font-bold text-gray-700 font">Status</th>
                        <th className="px-4 py-2 text-left text-sm font-bold text-gray-700 font">Produtos</th>
                        <th className="px-4 py-2 text-left text-sm font-bold text-gray-700 font">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{order.customerName}</td>
                            <td className="px-4 py-2">{formatPhone(order.customerPhone)}</td>
                            <td className={`px-4 py-2 ${statusColor(order.status)}`}>{order.status}</td>
                            <td className="px-4 py-2">
                                <ul className="list-disc pl-5">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            Produto {item.item} x{item.qty} - R${item.price}
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="px-4 py-2 text-center space-x-2 inline-flex">
                                <button
                                    title="Pendente"
                                    className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                    onClick={() => updateStatus(order.id, 'Pendente')}
                                >
                                    <FaClock size={16} />
                                </button>
                                <button
                                    title="Pago"
                                    className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600"
                                    onClick={() => updateStatus(order.id, 'Pago')}
                                >
                                    <FaCheckCircle size={16} />
                                </button>
                                <button
                                    title="Enviado"
                                    className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    onClick={() => updateStatus(order.id, 'Enviado')}
                                >
                                    <FaTruck size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
