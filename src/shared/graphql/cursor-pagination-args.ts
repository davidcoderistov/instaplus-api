import { ArgsType, InputType, Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


@InputType()
class Cursor {

    @Field()
    _id!: string

    @Field()
    createdAt!: Date
}

@ArgsType()
export class CursorPaginationArgs {

    @Field(() => Cursor, { nullable: true })
    cursor?: Cursor

    @Field(() => Int)
    @Min(0)
    limit!: number
}