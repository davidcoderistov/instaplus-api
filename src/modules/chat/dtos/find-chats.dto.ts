import { ArgsType, Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


@ArgsType()
export class FindChatsDto {

    @Field(() => Int)
    @Min(0)
    offset: number

    @Field(() => Int)
    @Min(0)
    limit: number

    constructor(offset: number, limit: number) {
        this.offset = offset
        this.limit = limit
    }
}