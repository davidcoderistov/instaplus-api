interface Metadata {
    count: number
}

interface AggregateData {
    metadata: Metadata[]
    data: any[]
}

interface OffsetPaginatedResponse {
    count: number
    data: any[]
}

export function getOffsetPaginatedData(aggregateData: AggregateData[]): OffsetPaginatedResponse {
    return {
        count: aggregateData[0].metadata.length > 0 ? aggregateData[0].metadata[0].count : 0,
        data: aggregateData[0].data,
    }
}

interface NextCursor {
    _id: string
    createdAt: Date
}

interface CursorPaginatedResponse {
    nextCursor: NextCursor | null
    data: any[]
}

export function getCursorPaginatedData(aggregateData: { data: any[], nextCursor: NextCursor[] }[]): CursorPaginatedResponse {
    return {
        nextCursor: aggregateData[0].nextCursor.length > 0 ? aggregateData[0].nextCursor[0] : null,
        data: aggregateData[0].data,
    }
}