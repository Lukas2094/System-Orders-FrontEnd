export type Order = {
    id: number;
    customerName: string;
    customerPhone: string;
    status: string;
    items: { item: string; qty: number; price: number }[];
};
