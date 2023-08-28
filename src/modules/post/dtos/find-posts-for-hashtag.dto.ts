import { ArgsType, Field } from 'type-graphql'
import { OffsetPaginationArgs } from '../../../shared/graphql/offset-pagination-args'


@ArgsType()
export class FindPostsForHashtagDto extends OffsetPaginationArgs {

    @Field(() => String)
    name!: string
}