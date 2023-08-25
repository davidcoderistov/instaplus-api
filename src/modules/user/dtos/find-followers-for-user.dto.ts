import { ArgsType, Field } from 'type-graphql'
import { CursorPaginationArgs } from '../../../shared/graphql/cursor-pagination-args'


@ArgsType()
export class FindFollowersForUserDto extends CursorPaginationArgs {

    @Field(() => String)
    userId!: string
}