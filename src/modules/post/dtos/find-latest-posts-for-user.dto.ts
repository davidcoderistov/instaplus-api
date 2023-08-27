import { ArgsType, Field, Int } from 'type-graphql'
import { Min } from 'class-validator'


@ArgsType()
export class FindLatestPostsForUserDto {

    @Field(() => String)
    userId!: string

    @Field(() => Int)
    @Min(0)
    limit!: number
}