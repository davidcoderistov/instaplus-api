import { ArgsType, Field } from 'type-graphql'
import { CursorPaginationArgs } from '../../../shared/graphql/cursor-pagination-args'


@ArgsType()
export class FindUsersWhoLikedPostDto extends CursorPaginationArgs {

    @Field(() => String)
    postId!: string
}