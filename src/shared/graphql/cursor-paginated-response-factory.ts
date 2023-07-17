import { ObjectType, Field, ClassType } from 'type-graphql'


@ObjectType()
class NextCursor {

    @Field()
    _id!: string

    @Field()
    createdAt!: Date
}

export function CursorPaginatedResponseFactory<T>(TClass: ClassType<T>) {

    @ObjectType()
    class CursorPaginatedResponse {

        @Field(() => NextCursor, { nullable: true })
        nextCursor?: NextCursor

        @Field(() => [TClass])
        data!: T[]
    }

    return CursorPaginatedResponse
}