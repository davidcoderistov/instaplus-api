import { ArgsType, Field } from 'type-graphql'
import { CursorPaginationArgs } from '../../../shared/graphql/cursor-pagination-args'


@ArgsType()
export class FindUsersWhoLikedCommentDto extends CursorPaginationArgs {

    @Field(() => String)
    commentId!: string
}