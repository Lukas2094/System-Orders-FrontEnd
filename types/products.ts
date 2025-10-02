export interface Category {
    id: number;
    name: string;
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
}

export interface Subcategory {
    id: number;
    name: string;
    categoryId: number;
    createdAt: string; // ISO date
    updatedAt: string; // ISO date
}

export interface Product {
    id: number;
    name: string;
    price: string; // pode mudar para number se no banco for DECIMAL
    stock: number;
    categoryId: number;
    subcategoryId: number;
    createdAt: string;
    updatedAt: string;
    category?: Category;
    subcategory?: Subcategory;
    isbn: string;
}

// se vier como array
export type ProductList = Product[];
