import { Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


export class PaginationArgs {

    @Field(() => Int)
    @Min(0)
    offset!: number

    @Field(() => Int)
    @Min(0)
    limit!: number
}