import { ArgsType, Field } from 'type-graphql'
import { OffsetPaginationArgs } from '../../../shared/graphql/offset-pagination-args'


@ArgsType()
export class FindPostsForUserDto extends OffsetPaginationArgs {

    @Field(() => String)
    userId!: string
}