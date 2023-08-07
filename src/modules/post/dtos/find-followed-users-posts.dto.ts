import { ArgsType } from 'type-graphql'
import { CursorPaginationArgs } from '../../../shared/graphql/cursor-pagination-args'


@ArgsType()
export class FindFollowedUsersPostsDto extends CursorPaginationArgs {
}