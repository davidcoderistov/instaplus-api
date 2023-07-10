import { ArgsType, Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


@ArgsType()
export class PaginationArgs {

    @Field(() => Int)
    @Min(0)
    offset!: number

    @Field(() => Int)
    @Min(0)
    limit!: number
}