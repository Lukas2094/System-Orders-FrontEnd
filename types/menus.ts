export interface Menu {
    id: number;
    name: string;
    path: string;
    icon: string;
    roleIds?: number[];
    submenus?: SubmenuData[];
}

export type SubmenuData = {
    id?: number;
    name: string;
    path: string;
    icon?: string;
};