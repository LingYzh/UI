export interface TableHeader {
    key: string;
    title: string;
    sortable?: boolean;
    align?: 'start' | 'center' | 'end';
    width?: string;
}
export interface TableSort { key: string; order: 'asc' | 'desc' }
export interface TableOptions { page: number; itemsPerPage: number; sortBy: TableSort[] }
export const positiveInteger = (value: number, fallback = 1) => Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
