import { ArgsType, Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


@ArgsType()
export class CursorPaginationArgs {

    @Field(() => Date, { nullable: true })
    lastCreatedAt?: Date

    @Field({ nullable: true })
    lastId?: string

    @Field(() => Int)
    @Min(0)
    limit!: number
}