import { ObjectType, Field, ClassType } from 'type-graphql'


export function CursorPaginatedResponseFactory<T>(TClass: ClassType<T>) {

    @ObjectType()
    class CursorPaginatedResponse {

        @Field(() => Boolean)
        hasNext!: boolean

        @Field(() => [TClass])
        data!: T[]
    }

    return CursorPaginatedResponse
}