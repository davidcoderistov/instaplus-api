import { ObjectType, Field, Int, ClassType } from 'type-graphql'


export function OffsetPaginatedResponseFactory<T>(TClass: ClassType<T>) {

    @ObjectType()
    class PaginatedResponse {

        @Field(() => Int)
        count!: number

        @Field(() => [TClass])
        data!: T[]
    }

    return PaginatedResponse
}