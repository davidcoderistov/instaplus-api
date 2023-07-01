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

export function getPaginatedResponse(aggregateData: AggregateData[]): PaginatedResponse {
    return {
        count: aggregateData[0].metadata.length > 0 ? aggregateData[0].metadata[0].count : 0,
        data: aggregateData[0].data,
    }
}