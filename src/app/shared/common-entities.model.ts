export interface ResponseObject<T> {
    data: T;
    success: boolean;
    message: string;
    total: number;
}

export interface SearchCriteria {
    key: string;
    value: object;
    operation: string;
}

export interface QueryPager {
    page: number;
    size: number;
}

export interface ModelQuery {
    pager: QueryPager;
}

export interface IMenuItem {
    label: string;
    route: string;
    icon: string;
}

export interface Lookup {
    id: number;
    name: string;
}

export interface Region extends Lookup {}

export interface District extends Lookup {
    region: Region;
}
