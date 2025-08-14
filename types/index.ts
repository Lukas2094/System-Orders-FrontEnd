export type Order = {
    id: number;
    customerName: string;
    customerPhone: string;
    status: string;
    items: { productId: number; quantity: number; price: number }[];
};
