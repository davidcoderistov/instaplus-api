import { ArgsType, Field } from 'type-graphql'
import { OffsetPaginationArgs } from '../../../shared/graphql/offset-pagination-args'


@ArgsType()
export class FindCommentRepliesDto extends OffsetPaginationArgs {

    @Field(() => String)
    commentId!: string
}