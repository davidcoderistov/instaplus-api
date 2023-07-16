interface Metadata {
    count: number
}

interface AggregateData {
    metadata: Metadata[]
    data: any[]
}

interface PaginatedResponse {
    count: number
    data: any[]
}

export function getPaginatedData(aggregateData: AggregateData[]): PaginatedResponse {
    return {
        count: aggregateData[0].metadata.length > 0 ? aggregateData[0].metadata[0].count : 0,
        data: aggregateData[0].data,
    }
}

interface CursorPaginatedResponse {
    hasNext: boolean
    data: any[]
}

export function getCursorPaginatedData(data: any[], limit: number): CursorPaginatedResponse {
    return {
        hasNext: data.length > limit,
        data: data.slice(0, limit),
    }
}