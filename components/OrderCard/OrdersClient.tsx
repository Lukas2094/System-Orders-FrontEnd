'use client'

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Order } from '@/types';
import OrdersTable from './OrdersTable';

let socket: Socket;

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState<Order[]>(initialOrders);

    useEffect(() => {
        socket = io(`${process.env.NEXT_PUBLIC_API_URL}` , {
            transports: ['websocket'],
        });

        socket.on('ordersUpdated', (order: Order) => {
            setOrders(prev => {
                const exists = prev.find(o => o.id === order.id);
                if (exists) {
                    return prev.map(o => (o.id === order.id ? order : o));
                }
                return [order, ...prev];
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleStatusUpdate = (updatedOrder: Order) => {
        setOrders(prev =>
            prev.map(o => (o.id === updatedOrder.id ? updatedOrder : o))
        );
    };

    return (
        <div>
            <OrdersTable orders={orders} onStatusUpdate={handleStatusUpdate} />
        </div>
    );
}