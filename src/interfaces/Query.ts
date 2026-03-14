export interface IRoomQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    type?: string;
    maxPeople?: number;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
}

export interface IContractQuery {
    page?: number;
    limit?: number;
    search?: string;
    roomId?: string;
    tenantId?: string;
    status?: string;
}

export interface ITenantQuery {
    page?: number;
    limit?: number;
    search?: string;
    roomId?: string;
    isRepresent?: boolean;
}

export interface IServiceQuery {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    unit?: string;
}

export interface IInvoiceQuery {
    page?: number;
    limit?: number;
    search?: string;
    roomId?: string;
    tenantId?: string;
    month?: number;
    year?: number;
    isPaid?: boolean;
}

